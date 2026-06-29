from datetime import date, datetime, timedelta, timezone

from schemas.course_schemas import CourseResponse


def test_days_until_exam_is_computed_on_read() -> None:
    exam_date = date.today() + timedelta(days=14)

    course = CourseResponse.from_document(
        {
            "_id": "course-id",
            "user_id": "user-id",
            "name": "Microeconomics",
            "university": "Tlearn University",
            "language": "en",
            "exam_date": exam_date,
            "created_at": datetime.now(timezone.utc),
        }
    )

    assert course.days_until_exam == 14
