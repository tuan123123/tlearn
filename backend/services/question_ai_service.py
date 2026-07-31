import json
import logging

from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

from core.config import get_settings
from schemas.quiz_schemas import BLOOM_LABELS, QuestionAiItem

logger = logging.getLogger("tlearn.question_ai")

QUESTION_SYSTEM_PROMPT = """
You are a Microeconomics exam question writer. Generate high-quality exam questions.

Rules:
1. Match exactly the requested Bloom level and topic
2. Include the correct answer and a clear explanation
3. Reference the source material — include page or slide number if possible
4. Return ONLY valid JSON, no preamble, no markdown
5. Never generate duplicate questions
6. For MCQ: provide exactly 4 options (A, B, C, D), one correct answer
7. For numeric: provide an exact numeric answer as a string
8. For short_answer: provide a model answer for rubric grading
""".strip()

GRADING_SYSTEM_PROMPT = """
You are a Microeconomics exam grader. Grade student answers fairly and explain what is missing.

Rules:
1. Return score as a float 0.0 to 1.0
2. Do not penalize for wording differences — grade on conceptual accuracy
3. Return ONLY valid JSON
""".strip()


class ShortAnswerGrade(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    feedback: str = Field(min_length=1)


def generate_question_with_ai(
    topic_name: str,
    bloom_level: int,
    skill: str,
    question_type: str,
    difficulty: str,
    source_excerpt: str,
    language: str = "en",
) -> QuestionAiItem | None:
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_topic_model,
        temperature=0,
        max_completion_tokens=1000,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": QUESTION_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_question_prompt(
                    topic_name,
                    bloom_level,
                    skill,
                    question_type,
                    difficulty,
                    source_excerpt,
                    language,
                ),
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        return None

    try:
        return QuestionAiItem.model_validate(json.loads(content))
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("Rejected invalid generated question: %s", exc)
        return None


def grade_short_answer_with_ai(
    question_text: str,
    correct_answer: str,
    student_answer: str,
    language: str = "en",
) -> ShortAnswerGrade:
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_topic_model,
        temperature=0,
        max_completion_tokens=300,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": GRADING_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_grading_prompt(
                    question_text,
                    correct_answer,
                    student_answer,
                    language,
                ),
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        return ShortAnswerGrade(score=0.0, feedback="No grading feedback returned.")

    try:
        return ShortAnswerGrade.model_validate(json.loads(content))
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("Invalid short answer grading response: %s", exc)
        return ShortAnswerGrade(score=0.0, feedback="Could not grade this answer.")


def build_question_prompt(
    topic_name: str,
    bloom_level: int,
    skill: str,
    question_type: str,
    difficulty: str,
    source_excerpt: str,
    language: str = "en",
) -> str:
    response_language = "Vietnamese" if language == "vi" else "English"
    return f"""
Topic: {topic_name}
Bloom Level: {bloom_level} ({BLOOM_LABELS[bloom_level]})
Skill: {skill}
Question type: {question_type}
Difficulty: {difficulty}
Response language: {response_language}

Source material excerpt:
{source_excerpt}

Generate all user-facing fields in {response_language}: question_text, options, correct_answer for short_answer, explanation, and skill. For MCQ correct_answer, still return only A/B/C/D. For numeric correct_answer, still return only the numeric value as a string.

Generate ONE question. Return JSON:
{{
  "question_text": "...",
  "question_type": "mcq" | "short_answer" | "numeric",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."] or null,
  "correct_answer": "A" or "42.5" or "model answer text",
  "explanation": "why this is correct, referencing the concept",
  "bloom_level": {bloom_level},
  "bloom_label": "{BLOOM_LABELS[bloom_level]}",
  "skill": "what skill this tests",
  "source_ref": "Slide 12" or "Page 4"
}}
""".strip()


def build_grading_prompt(
    question_text: str,
    correct_answer: str,
    student_answer: str,
    language: str = "en",
) -> str:
    response_language = "Vietnamese" if language == "vi" else "English"
    return f"""
Question: {question_text}
Model answer: {correct_answer}
Student answer: {student_answer}

Write feedback in {response_language}.

Return JSON:
{{
  "score": 0.0,
  "feedback": "one sentence: what the student got right and what concept was missing"
}}
""".strip()
