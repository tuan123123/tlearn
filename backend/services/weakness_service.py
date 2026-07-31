import logging
from datetime import datetime, timezone

from openai import OpenAI
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.config import get_settings
from repositories.attempt_repository import AttemptRepository
from repositories.quiz_repository import QuizRepository
from schemas.quiz_schemas import BLOOM_LABELS

logger = logging.getLogger("tlearn.weakness")


class WeaknessService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.attempts = AttemptRepository(database)
        self.quizzes = QuizRepository(database)

    async def compute_weakness_report(
        self,
        quiz_id: str,
        user_id: str,
        language: str = "en",
    ) -> dict:
        attempts = await self.attempts.list_by_quiz_for_user(user_id, quiz_id)
        draft_report = build_weakness_report_from_attempts(attempts, "", language)
        weakness_summary = generate_weakness_summary(
            draft_report["weak_topics"],
            draft_report["weak_bloom_levels"],
            language,
        )
        report = build_weakness_report_from_attempts(attempts, weakness_summary, language)
        saved_quiz = await self.quizzes.save_weakness_report(user_id, quiz_id, report)
        if saved_quiz is not None:
            return saved_quiz["weakness_report"]
        return report


def build_weakness_report_from_attempts(
    attempts: list[dict],
    weakness_summary: str,
    language: str = "en",
) -> dict:
    topic_scores = build_topic_scores(attempts)
    bloom_scores = build_bloom_scores(attempts)
    skill_scores = build_skill_scores(attempts)

    weak_topics = [
        {"topic_name": topic_name, **score}
        for topic_name, score in topic_scores.items()
        if score["accuracy"] < 0.6
    ]
    weak_topics.sort(key=lambda topic: topic["weakness_score"], reverse=True)

    weak_bloom_levels = [
        {"bloom_level": int(bloom_level), **score}
        for bloom_level, score in bloom_scores.items()
        if score["accuracy"] < 0.6
    ]
    weak_bloom_levels.sort(key=lambda bloom: bloom["accuracy"])

    weakest_skills = [
        {"skill": skill, **score}
        for skill, score in skill_scores.items()
        if score["accuracy"] < 0.5
    ]
    weakest_skills.sort(key=lambda skill: skill["accuracy"])

    return {
        "topic_scores": topic_scores,
        "bloom_scores": bloom_scores,
        "skill_scores": skill_scores,
        "weak_topics": weak_topics,
        "weak_bloom_levels": weak_bloom_levels,
        "weakest_skills": weakest_skills,
        "weakness_summary": weakness_summary or default_weakness_summary(weak_topics, language),
        "computed_at": datetime.now(timezone.utc),
    }


def build_topic_scores(attempts: list[dict]) -> dict[str, dict]:
    scores: dict[str, dict] = {}
    topic_names = sorted({attempt["topic_name"] for attempt in attempts})

    for topic_name in topic_names:
        topic_attempts = [
            attempt for attempt in attempts if attempt["topic_name"] == topic_name
        ]
        accuracy = mean([attempt["score"] for attempt in topic_attempts])
        avg_time = mean([attempt["time_spent_seconds"] for attempt in topic_attempts])
        time_penalty = clamp((avg_time - 60) / 120, 0, 1)
        weakness_score = (1 - accuracy) * 0.6 + time_penalty * 0.3
        scores[topic_name] = {
            "accuracy": round(accuracy, 3),
            "avg_time": round(avg_time, 1),
            "question_count": len(topic_attempts),
            "weakness_score": round(weakness_score, 3),
        }

    return scores


def build_bloom_scores(attempts: list[dict]) -> dict[str, dict]:
    scores: dict[str, dict] = {}

    for bloom_level in range(1, 7):
        bloom_attempts = [
            attempt for attempt in attempts if attempt["bloom_level"] == bloom_level
        ]
        if not bloom_attempts:
            continue

        accuracy = mean([attempt["score"] for attempt in bloom_attempts])
        scores[str(bloom_level)] = {
            "bloom_label": BLOOM_LABELS[bloom_level],
            "accuracy": round(accuracy, 3),
            "question_count": len(bloom_attempts),
        }

    return scores


def build_skill_scores(attempts: list[dict]) -> dict[str, dict]:
    scores: dict[str, dict] = {}
    skills = sorted({attempt["skill"] for attempt in attempts})

    for skill in skills:
        skill_attempts = [attempt for attempt in attempts if attempt["skill"] == skill]
        first_attempt = skill_attempts[0]
        accuracy = mean([attempt["score"] for attempt in skill_attempts])
        scores[skill] = {
            "accuracy": round(accuracy, 3),
            "topic_name": first_attempt["topic_name"],
            "bloom_level": first_attempt["bloom_level"],
            "question_count": len(skill_attempts),
        }

    return scores


def generate_weakness_summary(
    weak_topics: list[dict],
    weak_bloom_levels: list[dict],
    language: str = "en",
) -> str:
    settings = get_settings()
    if not settings.openai_api_key or settings.openai_api_key.startswith("replace-"):
        return default_weakness_summary(weak_topics, language)

    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model=settings.openai_topic_model,
            temperature=0,
            max_completion_tokens=180,
            messages=[
                {
                    "role": "user",
                    "content": build_summary_prompt(weak_topics, weak_bloom_levels, language),
                },
            ],
        )
        content = response.choices[0].message.content
        if content:
            return content.strip()
    except Exception as exc:
        logger.warning("Could not generate weakness summary: %s", exc)

    return default_weakness_summary(weak_topics, language)


def build_summary_prompt(
    weak_topics: list[dict],
    weak_bloom_levels: list[dict],
    language: str = "en",
) -> str:
    weak_topics_summary = [
        {
            "topic": topic["topic_name"],
            "accuracy": topic["accuracy"],
            "avg_time": topic["avg_time"],
            "weakness_score": topic["weakness_score"],
        }
        for topic in weak_topics[:5]
    ]
    weak_bloom_summary = [
        {
            "bloom_level": bloom["bloom_level"],
            "bloom_label": bloom["bloom_label"],
            "accuracy": bloom["accuracy"],
        }
        for bloom in weak_bloom_levels
    ]
    response_language = "Vietnamese" if language == "vi" else "English"
    return (
        "Given these weak topics: "
        f"{weak_topics_summary} and weak Bloom levels: {weak_bloom_summary}, "
        "write 3 sentences explaining the student's main knowledge gaps in plain language. "
        f"Write the response in {response_language}."
    )


def default_weakness_summary(weak_topics: list[dict], language: str = "en") -> str:
    if not weak_topics:
        if language == "vi":
            return "Không có điểm yếu lớn nào nổi bật từ lần làm quiz này."
        return "No major weak areas stood out from this quiz attempt."

    topic_names = ", ".join(topic["topic_name"] for topic in weak_topics[:3])
    if language == "vi":
        return (
            f"Các khoảng trống chính của bạn nằm ở {topic_names}. "
            "Hãy tập trung trước vào các chủ đề có độ chính xác thấp và thời gian làm bài dài hơn. "
            "Xem lại các câu sai bên dưới, rồi luyện thêm bài tương tự trước khi học tiếp."
        )

    return (
        f"Your main gaps are in {topic_names}. "
        "Focus first on the topics with lower accuracy and longer average time. "
        "Review the missed questions below, then practice similar problems before moving on."
    )


def mean(values: list[float | int]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))
