from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from schemas.quiz_schemas import QuestionResponse, QuestionResultResponse

TimeBand = Literal["14+", "7-13", "3-6", "1-2", "exam_day"]
MockTrend = Literal["improving", "stagnant", "declining", "first_mock"]


class MockExamResponse(BaseModel):
    id: str
    course_id: str
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
    questions: list[QuestionResponse]

    @classmethod
    def from_document(cls, mock_exam: dict, questions: list[dict]) -> "MockExamResponse":
        return cls(
            id=str(mock_exam["_id"]),
            course_id=mock_exam["course_id"],
            mock_number=mock_exam["mock_number"],
            time_band=mock_exam["time_band"],
            days_until_exam=mock_exam["days_until_exam"],
            question_count=mock_exam["question_count"],
            duration_minutes=mock_exam["duration_minutes"],
            question_ids=mock_exam["question_ids"],
            weak_topic_boost=mock_exam["weak_topic_boost"],
            bloom_distribution=mock_exam["bloom_distribution"],
            status=mock_exam["status"],
            created_at=mock_exam["created_at"],
            submitted_at=mock_exam["submitted_at"],
            questions=[QuestionResponse.from_document(question) for question in questions],
        )


class MockExamGenerateResponse(BaseModel):
    mode: Literal["mock_exam", "exam_day"]
    mock_exam: MockExamResponse | None = None
    checklist: list[str] = []


class MockExamListItem(BaseModel):
    id: str
    course_id: str
    mock_number: int
    time_band: TimeBand
    question_count: int
    duration_minutes: int | None
    status: Literal["active", "submitted"]
    created_at: datetime
    submitted_at: datetime | None
    latest_score: float | None = None
    trend: MockTrend | None = None
    vs_diagnostic: float | None = None

    @classmethod
    def from_document(cls, mock_exam: dict, attempt: dict | None) -> "MockExamListItem":
        return cls(
            id=str(mock_exam["_id"]),
            course_id=mock_exam["course_id"],
            mock_number=mock_exam["mock_number"],
            time_band=mock_exam["time_band"],
            question_count=mock_exam["question_count"],
            duration_minutes=mock_exam["duration_minutes"],
            status=mock_exam["status"],
            created_at=mock_exam["created_at"],
            submitted_at=mock_exam["submitted_at"],
            latest_score=attempt.get("total_score") if attempt else None,
            trend=attempt.get("trend") if attempt else None,
            vs_diagnostic=attempt.get("vs_diagnostic") if attempt else None,
        )


class MockExamAnswerSubmitItem(BaseModel):
    question_id: str
    student_answer: str = ""
    time_spent_seconds: int = Field(ge=0)


class MockExamSubmitRequest(BaseModel):
    answers: list[MockExamAnswerSubmitItem] = Field(min_length=1)


class MockExamSubmitResponse(BaseModel):
    mock_exam_attempt_id: str
    total_score: float
    trend: MockTrend
    vs_diagnostic: float | None
    vs_previous_mock: float | None
    study_guide_id: str | None
    study_guide_version: int | None


class MockExamAnswerResponse(BaseModel):
    question_id: str
    student_answer: str
    is_correct: bool
    score: float
    time_spent_seconds: int


class MockExamAttemptResponse(BaseModel):
    id: str
    mock_exam_id: str
    course_id: str
    mock_number: int
    total_score: float
    correct_count: int
    topic_scores: dict
    bloom_scores: dict
    vs_diagnostic: float | None
    vs_previous_mock: float | None
    answers: list[MockExamAnswerResponse]
    trend: MockTrend
    study_guide_id: str | None
    study_guide_version: int | None
    created_at: datetime

    @classmethod
    def from_document(cls, attempt: dict) -> "MockExamAttemptResponse":
        return cls(
            id=str(attempt["_id"]),
            mock_exam_id=attempt["mock_exam_id"],
            course_id=attempt["course_id"],
            mock_number=attempt["mock_number"],
            total_score=attempt["total_score"],
            correct_count=attempt["correct_count"],
            topic_scores=attempt["topic_scores"],
            bloom_scores=attempt["bloom_scores"],
            vs_diagnostic=attempt["vs_diagnostic"],
            vs_previous_mock=attempt["vs_previous_mock"],
            answers=[MockExamAnswerResponse.model_validate(answer) for answer in attempt["answers"]],
            trend=attempt["trend"],
            study_guide_id=attempt.get("study_guide_id"),
            study_guide_version=attempt.get("study_guide_version"),
            created_at=attempt["created_at"],
        )


class MockExamResultsResponse(BaseModel):
    mock_exam: MockExamResponse
    attempt: MockExamAttemptResponse
    questions: list[QuestionResultResponse]
    diagnostic_topic_scores: dict
    diagnostic_bloom_scores: dict
