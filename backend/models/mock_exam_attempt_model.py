from datetime import datetime
from typing import Literal, TypedDict


class MockExamAnswerDocument(TypedDict):
    question_id: str
    student_answer: str
    is_correct: bool
    score: float
    time_spent_seconds: int


class MockExamAttemptDocument(TypedDict):
    mock_exam_id: str
    course_id: str
    user_id: str
    mock_number: int
    total_score: float
    correct_count: int
    topic_scores: dict
    bloom_scores: dict
    vs_diagnostic: float | None
    vs_previous_mock: float | None
    answers: list[MockExamAnswerDocument]
    trend: Literal["improving", "stagnant", "declining", "first_mock"]
    study_guide_id: str | None
    study_guide_version: int | None
    created_at: datetime
