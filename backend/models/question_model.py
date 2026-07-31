from datetime import datetime
from typing import Literal, TypedDict


class QuestionDocument(TypedDict):
    course_id: str
    user_id: str
    topic_id: str
    topic_name: str
    skill: str
    bloom_level: int
    bloom_label: str
    question_type: Literal["mcq", "short_answer", "numeric"]
    question_text: str
    options: list[str] | None
    correct_answer: str
    explanation: str
    source_ref: str
    difficulty: Literal["easy", "medium", "hard"]
    created_at: datetime
