from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


TimeBand = Literal["14+", "7-13", "3-6", "1-2", "exam_day"]


class StudyGuideGenerateRequest(BaseModel):
    quiz_id: str = Field(min_length=1)


class DayPlanResponse(BaseModel):
    day_number: int = Field(ge=1)
    date_label: str = Field(min_length=1)
    focus_topics: list[str] = Field(min_length=1)
    bloom_focus: list[str] = Field(min_length=1)
    activities: list[str] = Field(min_length=1)
    estimated_hours: float = Field(ge=0.5, le=4.0)
    practice_question_count: int = Field(ge=0)


class StudyGuideAiResponse(BaseModel):
    plan: list[DayPlanResponse] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_sequential_days(self) -> "StudyGuideAiResponse":
        for index, day in enumerate(self.plan, start=1):
            if day.day_number != index:
                raise ValueError("Study guide days must be sequential starting at 1")
        return self


class StudyGuideResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    version: int
    trigger: str
    exam_date: date
    days_until_exam: int
    time_band: TimeBand
    weak_topics_input: list[dict]
    bloom_gaps_input: list[dict]
    plan: list[DayPlanResponse]
    generated_at: datetime

    @classmethod
    def from_document(cls, guide: dict) -> "StudyGuideResponse":
        exam_date = guide["exam_date"]
        if isinstance(exam_date, datetime):
            exam_date = exam_date.date()

        return cls(
            id=str(guide["_id"]),
            course_id=guide["course_id"],
            user_id=guide["user_id"],
            version=guide["version"],
            trigger=guide["trigger"],
            exam_date=exam_date,
            days_until_exam=guide["days_until_exam"],
            time_band=guide["time_band"],
            weak_topics_input=guide["weak_topics_input"],
            bloom_gaps_input=guide["bloom_gaps_input"],
            plan=[DayPlanResponse.model_validate(day) for day in guide["plan"]],
            generated_at=guide["generated_at"],
        )


class StudyGuideMetadataResponse(BaseModel):
    id: str
    course_id: str
    version: int
    trigger: str
    exam_date: date
    days_until_exam: int
    time_band: TimeBand
    generated_at: datetime

    @classmethod
    def from_document(cls, guide: dict) -> "StudyGuideMetadataResponse":
        exam_date = guide["exam_date"]
        if isinstance(exam_date, datetime):
            exam_date = exam_date.date()

        return cls(
            id=str(guide["_id"]),
            course_id=guide["course_id"],
            version=guide["version"],
            trigger=guide["trigger"],
            exam_date=exam_date,
            days_until_exam=guide["days_until_exam"],
            time_band=guide["time_band"],
            generated_at=guide["generated_at"],
        )
