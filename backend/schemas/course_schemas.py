from datetime import date, datetime

from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    university: str = Field(min_length=1, max_length=120)
    language: str = Field(min_length=1, max_length=50)
    exam_date: date


class CourseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    university: str | None = Field(default=None, min_length=1, max_length=120)
    language: str | None = Field(default=None, min_length=1, max_length=50)
    exam_date: date | None = None


class CourseResponse(BaseModel):
    id: str
    user_id: str
    name: str
    university: str
    language: str
    exam_date: date
    days_until_exam: int
    uploaded_file_count: int = 0
    created_at: datetime

    @classmethod
    def from_document(cls, course: dict) -> "CourseResponse":
        exam_date = course["exam_date"]
        if isinstance(exam_date, datetime):
            exam_date = exam_date.date()

        return cls(
            id=str(course["_id"]),
            user_id=course["user_id"],
            name=course["name"],
            university=course["university"],
            language=course["language"],
            exam_date=exam_date,
            days_until_exam=(exam_date - date.today()).days,
            uploaded_file_count=course.get("uploaded_file_count", 0),
            created_at=course["created_at"],
        )
