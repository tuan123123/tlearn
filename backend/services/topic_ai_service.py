import json
import logging

from fastapi import HTTPException, status
from openai import OpenAI
from pydantic import ValidationError

from core.config import get_settings
from schemas.topic_schemas import ALLOWED_TOPIC_NAMES, TOPIC_TRANSLATIONS, TopicAiItem

logger = logging.getLogger("tlearn.topic_ai")

SYSTEM_PROMPT = f"""
You are a bilingual Microeconomics curriculum analyst. Your job is to extract topics from student course materials written in English, Vietnamese, or a mix of both, then map them to a standard Microeconomics template.

Rules:
1. Only extract topics that are explicitly present in the source material
2. Map English and Vietnamese terminology to the closest English canonical name from the allowed template
3. For each topic, include a short source_evidence quote (max 30 words) from the material that proves the topic exists; keep the quote in the original source language
4. Return ONLY valid JSON, no preamble, no markdown, no explanation
5. If a topic from the template is not in the material, do not include it

Allowed topic names:
{", ".join(ALLOWED_TOPIC_NAMES)}

Vietnamese topic aliases to recognize:
{json.dumps(TOPIC_TRANSLATIONS, ensure_ascii=False, indent=2)}
""".strip()


def extract_topics_with_ai(extracted_text: str, language: str = "en") -> list[TopicAiItem]:
    settings = get_settings()
    if not settings.openai_api_key or settings.openai_api_key.startswith("replace-"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY is not configured",
        )

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_topic_model,
        temperature=0,
        max_completion_tokens=2000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_user_prompt(extracted_text, language),
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        return []

    try:
        raw_response = json.loads(content)
    except json.JSONDecodeError as exc:
        logger.warning("Topic AI returned invalid JSON: %s", exc)
        return []

    valid_topics: list[TopicAiItem] = []
    for raw_topic in raw_response.get("topics", []):
        try:
            valid_topics.append(TopicAiItem.model_validate(raw_topic))
        except ValidationError as exc:
            logger.warning("Rejected invalid topic from AI: %s", exc)

    return valid_topics


def build_user_prompt(extracted_text: str, language: str = "en") -> str:
    response_language = "Vietnamese" if language == "vi" else "English"
    return f"""
Extract Microeconomics topics from this course material:

{truncate_text(extracted_text)}

Write description and bloom_skills in {response_language}. Keep name as the exact {response_language} canonical topic name. Keep source_evidence in the original source language.

Return a JSON object in exactly this format:
{{
  "topics": [
    {{
      "name": "Supply and Demand",
      "description": "one sentence describing what aspect of this topic the course covers",
      "bloom_skills": ["identify", "explain", "calculate", "analyze"],
      "source_evidence": "short quote from material proving this topic exists"
    }}
  ]
}}
""".strip()


def truncate_text(text: str, max_words: int = 12000) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words])
