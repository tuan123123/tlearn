from datetime import datetime, timezone

from pydantic import ValidationError

from schemas.quiz_schemas import QuestionAiItem, QuizResponse
from services.quiz_service import numeric_answers_match


def test_mcq_question_validation_requires_four_options() -> None:
    try:
        QuestionAiItem.model_validate(
            {
                "question_text": "What shifts demand?",
                "question_type": "mcq",
                "options": ["A. Income", "B. Weather"],
                "correct_answer": "A",
                "explanation": "Income can shift demand.",
                "bloom_level": 2,
                "bloom_label": "Understand",
                "skill": "explain demand shifts",
                "source_ref": "Page 1",
            }
        )
    except ValidationError:
        return

    raise AssertionError("Expected validation to reject malformed MCQ")


def test_numeric_answer_allows_two_percent_tolerance() -> None:
    assert numeric_answers_match("102", "100")
    assert not numeric_answers_match("103", "100")


def test_quiz_response_hides_correct_answer_and_explanation() -> None:
    now = datetime.now(timezone.utc)
    quiz = {
        "_id": "quiz-id",
        "course_id": "course-id",
        "quiz_type": "diagnostic",
        "question_ids": ["question-id"],
        "bloom_distribution": {"1": 1},
        "status": "active",
        "created_at": now,
        "submitted_at": None,
    }
    question = {
        "_id": "question-id",
        "course_id": "course-id",
        "topic_id": "topic-id",
        "topic_name": "Supply and Demand",
        "skill": "identify equilibrium",
        "bloom_level": 1,
        "bloom_label": "Remember",
        "question_type": "mcq",
        "question_text": "Where is equilibrium?",
        "options": ["A. One", "B. Two", "C. Three", "D. Four"],
        "correct_answer": "A",
        "explanation": "Because supply meets demand.",
        "source_ref": "Page 1",
        "difficulty": "easy",
        "created_at": now,
    }

    response = QuizResponse.from_document(quiz, [question]).model_dump()

    assert "correct_answer" not in response["questions"][0]
    assert "explanation" not in response["questions"][0]
