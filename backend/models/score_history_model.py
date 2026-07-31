from datetime import datetime
from typing import Literal, TypedDict


class ScoreHistoryDocument(TypedDict):
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
