from datetime import datetime
from typing import Literal, TypedDict


TimeBand = Literal["14+", "7-13", "3-6", "1-2", "exam_day"]


class MockExamDocument(TypedDict):
    course_id: str
    user_id: str
    mock_number: int
    time_band: TimeBand
    days_until_exam: int
    question_count: int
    duration_minutes: int | None
    question_ids: list[str]
    weak_topic_boost: dict[str, float]
    bloom_distribution: dict[str, int]
    status: Literal["active", "submitted"]
    created_at: datetime
    submitted_at: datetime | None
