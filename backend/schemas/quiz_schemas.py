from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

BLOOM_LABELS = {
    1: "Remember",
    2: "Understand",
    3: "Apply",
    4: "Analyze",
    5: "Evaluate",
    6: "Create",
}

QuestionType = Literal["mcq", "short_answer", "numeric"]
Difficulty = Literal["easy", "medium", "hard"]


class QuestionGenerateRequest(BaseModel):
    topic_ids: list[str] = Field(min_length=1)
    questions_per_bloom: int = Field(default=3, ge=1, le=5)


class QuestionAiItem(BaseModel):
    question_text: str = Field(min_length=1)
    question_type: QuestionType
    options: list[str] | None = None
    correct_answer: str = Field(min_length=1)
    explanation: str = Field(min_length=1)
    bloom_level: int = Field(ge=1, le=6)
    bloom_label: Literal[
        "Remember",
        "Understand",
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
    ]
    skill: str = Field(min_length=1)
    source_ref: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_question_shape(self) -> "QuestionAiItem":
        if self.bloom_label != BLOOM_LABELS[self.bloom_level]:
            raise ValueError("Bloom label does not match bloom level")

        if self.question_type == "mcq":
            if self.options is None or len(self.options) != 4:
                raise ValueError("MCQ questions need exactly 4 options")
            if self.correct_answer not in {"A", "B", "C", "D"}:
                raise ValueError("MCQ correct answer must be A, B, C, or D")
        elif self.options is not None:
            raise ValueError("Non-MCQ questions must not include options")

        return self


class QuestionResponse(BaseModel):
    id: str
    course_id: str
    topic_id: str
    topic_name: str
    skill: str
    bloom_level: int
    bloom_label: str
    question_type: QuestionType
    question_text: str
    options: list[str] | None
    source_ref: str
    difficulty: Difficulty
    created_at: datetime

    @classmethod
    def from_document(cls, question: dict) -> "QuestionResponse":
        return cls(
            id=str(question["_id"]),
            course_id=question["course_id"],
            topic_id=question["topic_id"],
            topic_name=question["topic_name"],
            skill=question["skill"],
            bloom_level=question["bloom_level"],
            bloom_label=question["bloom_label"],
            question_type=question["question_type"],
            question_text=question["question_text"],
            options=question["options"],
            source_ref=question["source_ref"],
            difficulty=question["difficulty"],
            created_at=question["created_at"],
        )


class QuestionResultResponse(QuestionResponse):
    correct_answer: str
    explanation: str

    @classmethod
    def from_document(cls, question: dict) -> "QuestionResultResponse":
        safe_question = QuestionResponse.from_document(question).model_dump()
        return cls(
            **safe_question,
            correct_answer=question["correct_answer"],
            explanation=question["explanation"],
        )


class QuestionGenerationResponse(BaseModel):
    generated: int
    rejected: int
    questions: list[QuestionResultResponse]


class QuizResponse(BaseModel):
    id: str
    course_id: str
    quiz_type: Literal["diagnostic", "practice"]
    question_ids: list[str]
    bloom_distribution: dict[str, int]
    status: Literal["active", "submitted"]
    created_at: datetime
    submitted_at: datetime | None
    questions: list[QuestionResponse]

    @classmethod
    def from_document(cls, quiz: dict, questions: list[dict]) -> "QuizResponse":
        return cls(
            id=str(quiz["_id"]),
            course_id=quiz["course_id"],
            quiz_type=quiz["quiz_type"],
            question_ids=quiz["question_ids"],
            bloom_distribution=quiz["bloom_distribution"],
            status=quiz["status"],
            created_at=quiz["created_at"],
            submitted_at=quiz["submitted_at"],
            questions=[QuestionResponse.from_document(question) for question in questions],
        )


class QuizMetadataResponse(BaseModel):
    id: str
    course_id: str
    quiz_type: Literal["diagnostic", "practice"]
    status: Literal["active", "submitted"]
    created_at: datetime
    submitted_at: datetime | None

    @classmethod
    def from_document(cls, quiz: dict) -> "QuizMetadataResponse":
        return cls(
            id=str(quiz["_id"]),
            course_id=quiz["course_id"],
            quiz_type=quiz["quiz_type"],
            status=quiz["status"],
            created_at=quiz["created_at"],
            submitted_at=quiz["submitted_at"],
        )


class AnswerSubmitItem(BaseModel):
    question_id: str
    student_answer: str
    time_spent_seconds: int = Field(ge=0)


class QuizSubmitRequest(BaseModel):
    answers: list[AnswerSubmitItem] = Field(min_length=1)


class QuizSubmitResponse(BaseModel):
    quiz_id: str
    total_score: float
    correct_count: int
    total_questions: int


class AttemptResponse(BaseModel):
    id: str
    quiz_id: str
    question_id: str
    course_id: str
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

    @classmethod
    def from_document(cls, attempt: dict) -> "AttemptResponse":
        return cls(
            id=str(attempt["_id"]),
            quiz_id=attempt["quiz_id"],
            question_id=attempt["question_id"],
            course_id=attempt["course_id"],
            topic_id=attempt["topic_id"],
            topic_name=attempt["topic_name"],
            bloom_level=attempt["bloom_level"],
            bloom_label=attempt["bloom_label"],
            skill=attempt["skill"],
            student_answer=attempt["student_answer"],
            is_correct=attempt["is_correct"],
            score=attempt["score"],
            time_spent_seconds=attempt["time_spent_seconds"],
            used_hint=attempt["used_hint"],
            grading_method=attempt["grading_method"],
            ai_feedback=attempt["ai_feedback"],
            created_at=attempt["created_at"],
        )


class TopicScoreResponse(BaseModel):
    accuracy: float
    avg_time: float
    question_count: int
    weakness_score: float


class BloomScoreResponse(BaseModel):
    bloom_label: str
    accuracy: float
    question_count: int


class SkillScoreResponse(BaseModel):
    accuracy: float
    topic_name: str
    bloom_level: int
    question_count: int


class WeakTopicResponse(TopicScoreResponse):
    topic_name: str


class WeakBloomLevelResponse(BloomScoreResponse):
    bloom_level: int


class WeakSkillResponse(SkillScoreResponse):
    skill: str


class WeaknessReportResponse(BaseModel):
    topic_scores: dict[str, TopicScoreResponse]
    bloom_scores: dict[str, BloomScoreResponse]
    skill_scores: dict[str, SkillScoreResponse]
    weak_topics: list[WeakTopicResponse]
    weak_bloom_levels: list[WeakBloomLevelResponse]
    weakest_skills: list[WeakSkillResponse]
    weakness_summary: str
    computed_at: datetime


class QuizResultsResponse(BaseModel):
    quiz: QuizResponse
    questions: list[QuestionResultResponse]
    attempts: list[AttemptResponse]
    weakness_report: WeaknessReportResponse
    total_score: float
    correct_count: int
    total_questions: int
