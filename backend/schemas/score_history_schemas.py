from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ScoreHistoryResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    event_type: Literal["diagnostic", "mock"]
    event_id: str
    event_number: int
    total_score: float
    topic_scores: dict[str, float]
    bloom_scores: dict[str, float]
    days_until_exam: int
    recorded_at: datetime

    @classmethod
    def from_document(cls, row: dict) -> "ScoreHistoryResponse":
        return cls(
            id=str(row["_id"]),
            course_id=row["course_id"],
            user_id=row["user_id"],
            event_type=row["event_type"],
            event_id=row["event_id"],
            event_number=row["event_number"],
            total_score=row["total_score"],
            topic_scores=row["topic_scores"],
            bloom_scores=row["bloom_scores"],
            days_until_exam=row["days_until_exam"],
            recorded_at=row["recorded_at"],
        )


class ReadinessResponse(BaseModel):
    readiness_score: int
    status: Literal["on_track", "at_risk", "critical"]
    trend: Literal["improving", "stagnant", "declining", "insufficient_data"]
    topic_readiness: dict[str, float]
    bloom_readiness: dict[str, float]
    last_event_date: datetime | None
    events_completed: dict[str, int | bool]


class TopicProgressResponse(BaseModel):
    topic_name: str
    diagnostic_accuracy: float | None
    latest_mock_accuracy: float | None
    change: float | None
    trend: Literal["improving", "stagnant", "declining", "insufficient_data"]


class BloomTrendPoint(BaseModel):
    event_number: int
    event_type: Literal["diagnostic", "mock"]
    accuracy: float


class BloomTrendResponse(BaseModel):
    bloom_level: int
    points: list[BloomTrendPoint]
