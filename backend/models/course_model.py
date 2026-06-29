from datetime import date, datetime
from typing import TypedDict


class CourseDocument(TypedDict):
    user_id: str
    name: str
    university: str
    language: str
    exam_date: date
    created_at: datetime
