from pydantic import ValidationError

from schemas.feedback_schemas import FeedbackCreateRequest


def test_feedback_accepts_valid_public_message() -> None:
    feedback = FeedbackCreateRequest(
        category="general",
        rating=5,
        message="The demo page looks clear and makes the product easy to understand.",
        page_context="came from /landing",
    )

    assert feedback.category == "general"
    assert feedback.rating == 5


def test_feedback_rejects_too_short_message() -> None:
    try:
        FeedbackCreateRequest(
            category="bug",
            message="Too short",
            page_context="came from /feedback",
        )
    except ValidationError:
        return

    raise AssertionError("Feedback message should require at least 10 characters")


def test_feedback_rejects_unknown_category() -> None:
    try:
        FeedbackCreateRequest(
            category="compliment",
            message="This message is long enough to pass the message validation.",
            page_context="came from /feedback",
        )
    except ValidationError:
        return

    raise AssertionError("Feedback category should be one of the allowed values")
