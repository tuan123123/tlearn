from datetime import datetime
from typing import Literal, TypedDict


class DayPlanDocument(TypedDict):
    day_number: int
    date_label: str
    focus_topics: list[str]
    bloom_focus: list[str]
    activities: list[str]
    estimated_hours: float
    practice_question_count: int


class StudyGuideDocument(TypedDict):
    course_id: str
    user_id: str
    version: int
    trigger: str
    exam_date: datetime
    days_until_exam: int
    time_band: Literal["14+", "7-13", "3-6", "1-2", "exam_day"]
    weak_topics_input: list[dict]
    bloom_gaps_input: list[dict]
    plan: list[DayPlanDocument]
    generated_at: datetime
