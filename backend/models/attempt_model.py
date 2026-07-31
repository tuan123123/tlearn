from datetime import datetime
from typing import Literal, TypedDict


class AttemptDocument(TypedDict):
    quiz_id: str
    question_id: str
    course_id: str
    user_id: str
    topic_id: str
    topic_name: str
    bloom_level: int
    bloom_label: str
    skill: str
    student_answer: str
    is_correct: bool
    score: float
    time_spent_seconds: int
    used_hint: bool
    grading_method: Literal["code", "ai"]
    ai_feedback: str | None
    created_at: datetime
