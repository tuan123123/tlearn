from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.course_repository import CourseRepository
from repositories.score_history_repository import ScoreHistoryRepository
from schemas.score_history_schemas import (
    BloomTrendResponse,
    ReadinessResponse,
    ScoreHistoryResponse,
    TopicProgressResponse,
)


class ScoreHistoryService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.courses = CourseRepository(database)
        self.score_history = ScoreHistoryRepository(database)

    async def append_event(
        self,
        user_id: str,
        course_id: str,
        event_type: str,
        event_id: str,
        event_number: int,
        total_score: float,
        topic_scores: dict[str, float],
        bloom_scores: dict[str, float],
    ) -> None:
        if await self.score_history.exists_for_event(user_id, event_type, event_id):
            return

        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            return

        await self.score_history.create(
            {
                "course_id": course_id,
                "user_id": user_id,
                "event_type": event_type,
                "event_id": event_id,
                "event_number": event_number,
                "total_score": round(total_score, 3),
                "topic_scores": topic_scores,
                "bloom_scores": bloom_scores,
                "days_until_exam": days_until_exam_from_course(course),
                "recorded_at": datetime.now(timezone.utc),
            }
        )

    async def list_score_history(
        self,
        user_id: str,
        course_id: str,
    ) -> list[ScoreHistoryResponse]:
        await self._verify_course(user_id, course_id)
        rows = await self.score_history.list_by_course_for_user(user_id, course_id)
        return [ScoreHistoryResponse.from_document(row) for row in rows]

    async def get_readiness(self, user_id: str, course_id: str) -> ReadinessResponse:
        await self._verify_course(user_id, course_id)
        rows = await self.score_history.list_by_course_for_user(user_id, course_id)
        if not rows:
            return ReadinessResponse(
                readiness_score=0,
                status="at_risk",
                trend="insufficient_data",
                topic_readiness={},
                bloom_readiness={},
                last_event_date=None,
                events_completed={"diagnostic": False, "mocks": 0},
            )

        latest = rows[-1]
        trend = overall_trend(rows)
        readiness = round(latest["total_score"] * 100)
        if trend == "improving":
            readiness += 5
        elif trend == "declining":
            readiness -= 5
        readiness = max(0, min(100, readiness))
        status_value = readiness_status(readiness, latest["days_until_exam"])

        return ReadinessResponse(
            readiness_score=readiness,
            status=status_value,
            trend=trend,
            topic_readiness=latest["topic_scores"],
            bloom_readiness=latest["bloom_scores"],
            last_event_date=latest["recorded_at"],
            events_completed={
                "diagnostic": any(row["event_type"] == "diagnostic" for row in rows),
                "mocks": sum(1 for row in rows if row["event_type"] == "mock"),
            },
        )

    async def get_topic_progress(
        self,
        user_id: str,
        course_id: str,
    ) -> list[TopicProgressResponse]:
        await self._verify_course(user_id, course_id)
        rows = await self.score_history.list_by_course_for_user(user_id, course_id)
        diagnostic = next((row for row in rows if row["event_type"] == "diagnostic"), None)
        latest_mock = next((row for row in reversed(rows) if row["event_type"] == "mock"), None)
        topic_names = set()
        if diagnostic:
            topic_names.update(diagnostic["topic_scores"].keys())
        if latest_mock:
            topic_names.update(latest_mock["topic_scores"].keys())

        progress = []
        for topic_name in topic_names:
            diagnostic_accuracy = diagnostic["topic_scores"].get(topic_name) if diagnostic else None
            latest_mock_accuracy = latest_mock["topic_scores"].get(topic_name) if latest_mock else None
            change = (
                round(latest_mock_accuracy - diagnostic_accuracy, 3)
                if diagnostic_accuracy is not None and latest_mock_accuracy is not None
                else None
            )
            progress.append(
                TopicProgressResponse(
                    topic_name=topic_name,
                    diagnostic_accuracy=diagnostic_accuracy,
                    latest_mock_accuracy=latest_mock_accuracy,
                    change=change,
                    trend=trend_from_change(change),
                )
            )

        return sorted(
            progress,
            key=lambda item: item.change if item.change is not None else -999,
        )

    async def get_bloom_trend(
        self,
        user_id: str,
        course_id: str,
    ) -> list[BloomTrendResponse]:
        await self._verify_course(user_id, course_id)
        rows = await self.score_history.list_by_course_for_user(user_id, course_id)
        response = []
        for bloom_level in range(1, 7):
            key = str(bloom_level)
            response.append(
                BloomTrendResponse(
                    bloom_level=bloom_level,
                    points=[
                        {
                            "event_number": row["event_number"],
                            "event_type": row["event_type"],
                            "accuracy": row["bloom_scores"].get(key, 0.0),
                        }
                        for row in rows
                    ],
                )
            )
        return response

    async def _verify_course(self, user_id: str, course_id: str) -> None:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")


def days_until_exam_from_course(course: dict) -> int:
    exam_date = course["exam_date"]
    if isinstance(exam_date, datetime):
        exam_date = exam_date.date()
    return (exam_date - date.today()).days


def overall_trend(rows: list[dict]) -> str:
    if len(rows) < 2:
        return "insufficient_data"
    difference = rows[-1]["total_score"] - rows[-2]["total_score"]
    return trend_from_change(difference)


def trend_from_change(change: float | None) -> str:
    if change is None:
        return "insufficient_data"
    if change > 0.05:
        return "improving"
    if change < -0.05:
        return "declining"
    return "stagnant"


def readiness_status(readiness: int, days_until_exam: int) -> str:
    if days_until_exam < 3 and readiness < 50:
        return "critical"
    if readiness >= 70:
        return "on_track"
    if readiness >= 40:
        return "at_risk"
    return "critical"
