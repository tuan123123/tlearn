import json
import logging
from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from openai import OpenAI
from pydantic import ValidationError

from core.config import get_settings
from repositories.course_repository import CourseRepository
from repositories.quiz_repository import QuizRepository
from repositories.study_guide_repository import StudyGuideRepository
from schemas.study_guide_schemas import (
    StudyGuideAiResponse,
    StudyGuideGenerateRequest,
    StudyGuideMetadataResponse,
    StudyGuideResponse,
)

logger = logging.getLogger("tlearn.study_guide")

SYSTEM_PROMPT = """
You are an adaptive study coach for Microeconomics exam preparation.
Your job is to build a realistic, prioritized day-by-day study plan.

Rules:
1. NEVER create more days than days_until_exam
2. Focus first on the weakest topics (highest weakness_score)
3. Match Bloom activities to the student's Bloom gaps
4. Each day should have a clear focus; do not spread everything across every day
5. Be specific: name the topic and the type of activity
6. Keep each day to 2-3 hours maximum
7. Return ONLY valid JSON, no preamble, no markdown
""".strip()


class StudyGuideService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.courses = CourseRepository(database)
        self.quizzes = QuizRepository(database)
        self.study_guides = StudyGuideRepository(database)

    async def generate_study_guide(
        self,
        user_id: str,
        course_id: str,
        payload: StudyGuideGenerateRequest,
        language: str = "en",
    ) -> StudyGuideResponse:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        days_until_exam = days_until_exam_from_course(course)
        if days_until_exam <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exam has already passed",
            )

        quiz = await self.quizzes.get_by_id_for_user(user_id, payload.quiz_id)
        if quiz is None or quiz["course_id"] != course_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        weakness_report = quiz.get("weakness_report")
        if weakness_report is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz weakness report is not available yet",
            )

        existing_count = await self.study_guides.count_by_course_for_user(user_id, course_id)
        version = existing_count + 1
        weak_topics = weakness_report.get("weak_topics", [])
        bloom_gaps = weakness_report.get("weak_bloom_levels", [])
        time_band = time_band_from_days(days_until_exam)
        plan = generate_plan_with_ai(
            days_until_exam=days_until_exam,
            time_band=time_band,
            weak_topics=weak_topics,
            bloom_gaps=bloom_gaps,
            trend=trend_for_version(version),
            language=language,
        )

        guide = await self.study_guides.create(
            {
                "course_id": course_id,
                "user_id": user_id,
                "version": version,
                "trigger": trigger_from_quiz_type(quiz.get("quiz_type", "diagnostic")),
                "exam_date": course["exam_date"],
                "days_until_exam": days_until_exam,
                "time_band": time_band,
                "weak_topics_input": weak_topics,
                "bloom_gaps_input": bloom_gaps,
                "plan": [day.model_dump() for day in plan.plan],
                "generated_at": datetime.now(timezone.utc),
            }
        )
        return StudyGuideResponse.from_document(guide)

    async def get_latest(self, user_id: str, course_id: str) -> StudyGuideResponse:
        guide = await self.study_guides.get_latest_by_course_for_user(user_id, course_id)
        if guide is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study guide not found",
            )
        return StudyGuideResponse.from_document(guide)

    async def list_versions(
        self,
        user_id: str,
        course_id: str,
    ) -> list[StudyGuideMetadataResponse]:
        guides = await self.study_guides.list_metadata_by_course_for_user(user_id, course_id)
        return [StudyGuideMetadataResponse.from_document(guide) for guide in guides]

    async def get_by_id(self, user_id: str, guide_id: str) -> StudyGuideResponse:
        guide = await self.study_guides.get_by_id_for_user(user_id, guide_id)
        if guide is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study guide not found",
            )
        return StudyGuideResponse.from_document(guide)

    async def generate_from_mock_attempt(
        self,
        user_id: str,
        course_id: str,
        mock_number: int,
        weak_topics: list[dict],
        bloom_gaps: list[dict],
        trend: str,
        language: str = "en",
    ) -> StudyGuideResponse:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        days_until_exam = days_until_exam_from_course(course)
        if days_until_exam <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exam has already passed",
            )

        version = await self.study_guides.count_by_course_for_user(user_id, course_id) + 1
        time_band = time_band_from_days(days_until_exam)
        plan = generate_plan_with_ai(
            days_until_exam=days_until_exam,
            time_band=time_band,
            weak_topics=weak_topics,
            bloom_gaps=bloom_gaps,
            trend=trend,
            language=language,
        )

        guide = await self.study_guides.create(
            {
                "course_id": course_id,
                "user_id": user_id,
                "version": version,
                "trigger": f"mock_{mock_number}",
                "exam_date": course["exam_date"],
                "days_until_exam": days_until_exam,
                "time_band": time_band,
                "weak_topics_input": weak_topics,
                "bloom_gaps_input": bloom_gaps,
                "plan": [day.model_dump() for day in plan.plan],
                "generated_at": datetime.now(timezone.utc),
            }
        )
        return StudyGuideResponse.from_document(guide)


def generate_plan_with_ai(
    days_until_exam: int,
    time_band: str,
    weak_topics: list[dict],
    bloom_gaps: list[dict],
    trend: str,
    language: str,
) -> StudyGuideAiResponse:
    last_error: Exception | None = None

    for attempt_number in range(2):
        try:
            raw_plan = call_study_guide_ai(
                days_until_exam,
                time_band,
                weak_topics,
                bloom_gaps,
                trend,
                language,
                retry=attempt_number > 0,
            )
            plan = StudyGuideAiResponse.model_validate(raw_plan)
            validate_plan_days(plan, days_until_exam, time_band)
            return plan
        except (ValidationError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            logger.warning("Rejected invalid study guide plan: %s", exc)

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=f"AI returned an invalid study guide plan: {last_error}",
    )


def call_study_guide_ai(
    days_until_exam: int,
    time_band: str,
    weak_topics: list[dict],
    bloom_gaps: list[dict],
    trend: str,
    language: str,
    retry: bool = False,
) -> dict:
    settings = get_settings()
    if not settings.openai_api_key or settings.openai_api_key.startswith("replace-"):
        return fallback_plan(days_until_exam, weak_topics, bloom_gaps, language)

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_topic_model,
        temperature=0,
        max_completion_tokens=2200,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_user_prompt(
                    days_until_exam,
                    time_band,
                    weak_topics,
                    bloom_gaps,
                    trend,
                    language,
                    retry,
                ),
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("AI returned an empty study guide response")
    return json.loads(content)


def build_user_prompt(
    days_until_exam: int,
    time_band: str,
    weak_topics: list[dict],
    bloom_gaps: list[dict],
    trend: str,
    language: str,
    retry: bool,
) -> str:
    response_language = "Vietnamese" if language == "vi" else "English"
    retry_note = (
        "The previous response failed validation. Fix the JSON shape and day count."
        if retry
        else ""
    )
    return f"""
Student situation:
- Days until exam: {days_until_exam}
- Time band: {time_band}
- Weak topics (sorted by weakness_score): {json.dumps(weak_topics, ensure_ascii=False)}
- Bloom level gaps (levels with accuracy < 60%): {json.dumps(bloom_gaps, ensure_ascii=False)}
- Previous score trend: {trend}
- Response language: {response_language}

Generate a study plan with exactly {days_until_exam} days.
Each day should focus on 1-2 weak topics and 1-2 weak Bloom levels.
Write all activities in {response_language}.
{retry_note}

Return JSON:
{{
  "plan": [
    {{
      "day_number": 1,
      "date_label": "Day 1",
      "focus_topics": ["Supply and Demand", "Price Elasticity"],
      "bloom_focus": ["Apply", "Analyze"],
      "activities": [
        "Re-read your slides on consumer surplus",
        "Solve 5 MCQ questions on supply shifts",
        "Draw 3 supply and demand diagrams from memory"
      ],
      "estimated_hours": 2.0,
      "practice_question_count": 8
    }}
  ]
}}
""".strip()


def fallback_plan(
    days_until_exam: int,
    weak_topics: list[dict],
    bloom_gaps: list[dict],
    language: str,
) -> dict:
    topics = [topic["topic_name"] for topic in weak_topics] or ["Microeconomics review"]
    bloom_focus = [gap["bloom_label"] for gap in bloom_gaps] or ["Apply"]
    plan = []

    for day_number in range(1, days_until_exam + 1):
        topic = topics[(day_number - 1) % len(topics)]
        bloom = bloom_focus[(day_number - 1) % len(bloom_focus)]
        if language == "vi":
            activities = [
                f"Ôn lại ghi chú và slide về {topic}",
                f"Làm 5 câu hỏi luyện tập tập trung vào mức Bloom {bloom}",
                f"Tự giải thích lại một lỗi sai thường gặp trong {topic}",
            ]
        else:
            activities = [
                f"Review your notes and slides on {topic}",
                f"Solve 5 practice questions focused on Bloom level {bloom}",
                f"Explain one common mistake in {topic} in your own words",
            ]

        plan.append(
            {
                "day_number": day_number,
                "date_label": f"Day {day_number}",
                "focus_topics": [topic],
                "bloom_focus": [bloom],
                "activities": activities,
                "estimated_hours": 2.0,
                "practice_question_count": 8,
            }
        )

    return {"plan": plan}


def validate_plan_days(
    plan: StudyGuideAiResponse,
    days_until_exam: int,
    time_band: str,
) -> None:
    max_days = 1 if time_band == "exam_day" else days_until_exam
    if len(plan.plan) > max_days:
        raise ValueError("Study guide plan has more days than days_until_exam")


def days_until_exam_from_course(course: dict) -> int:
    exam_date = course["exam_date"]
    if isinstance(exam_date, datetime):
        exam_date = exam_date.date()
    return (exam_date - date.today()).days


def time_band_from_days(days_until_exam: int) -> str:
    if days_until_exam >= 14:
        return "14+"
    if days_until_exam >= 7:
        return "7-13"
    if days_until_exam >= 3:
        return "3-6"
    if days_until_exam >= 1:
        return "1-2"
    return "exam_day"


def trend_for_version(version: int) -> str:
    if version == 1:
        return "first_diagnostic"
    return "stagnant"


def trigger_from_quiz_type(quiz_type: str) -> str:
    if quiz_type == "diagnostic":
        return "diagnostic"
    return quiz_type
