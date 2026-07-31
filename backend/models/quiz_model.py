from datetime import datetime
from typing import Literal, TypedDict


class QuizDocument(TypedDict):
    course_id: str
    user_id: str
    quiz_type: Literal["diagnostic", "practice"]
    question_ids: list[str]
    bloom_distribution: dict[str, int]
    status: Literal["active", "submitted"]
    created_at: datetime
    submitted_at: datetime | None
    weakness_report: dict
