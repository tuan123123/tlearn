from datetime import date, datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.attempt_repository import AttemptRepository
from repositories.course_repository import CourseRepository
from repositories.mock_exam_attempt_repository import MockExamAttemptRepository
from repositories.mock_exam_repository import MockExamRepository
from repositories.question_repository import QuestionRepository
from repositories.quiz_repository import QuizRepository
from repositories.topic_repository import TopicRepository
from schemas.mock_exam_schemas import (
    MockExamGenerateResponse,
    MockExamListItem,
    MockExamResponse,
    MockExamResultsResponse,
    MockExamSubmitRequest,
    MockExamSubmitResponse,
    MockExamAttemptResponse,
)
from schemas.quiz_schemas import QuestionGenerateRequest
from schemas.quiz_schemas import QuestionResultResponse
from services.quiz_service import QuizService, grade_answer
from services.score_history_service import ScoreHistoryService
from services.study_guide_service import StudyGuideService

TIME_BAND_RULES = {
    "14+": {"question_count": 40, "duration_minutes": 80},
    "7-13": {"question_count": 25, "duration_minutes": 50},
    "3-6": {"question_count": 15, "duration_minutes": 30},
    "1-2": {"question_count": 10, "duration_minutes": 20},
    "exam_day": {"question_count": 0, "duration_minutes": None},
}


class MockExamService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.database = database
        self.courses = CourseRepository(database)
        self.questions = QuestionRepository(database)
        self.quizzes = QuizRepository(database)
        self.quiz_attempts = AttemptRepository(database)
        self.mock_exams = MockExamRepository(database)
        self.mock_attempts = MockExamAttemptRepository(database)
        self.topics = TopicRepository(database)

    async def generate_mock_exam(
        self,
        user_id: str,
        course_id: str,
        language: str = "en",
    ) -> MockExamGenerateResponse:
        course = await self._get_course_or_404(user_id, course_id)
        days_until_exam = days_until_exam_from_course(course)
        time_band = time_band_from_days(days_until_exam)
        rule = TIME_BAND_RULES[time_band]

        if time_band == "exam_day":
            return MockExamGenerateResponse(
                mode="exam_day",
                checklist=await self._build_exam_day_checklist(user_id, course_id),
            )

        mock_number = await self.mock_exams.count_by_course_for_user(user_id, course_id) + 1
        weak_topic_boost = await self._latest_weak_topic_boost(user_id, course_id)
        question_count = rule["question_count"]
        used_question_ids = await self.mock_exams.list_used_question_ids_for_course(
            user_id,
            course_id,
        )
        all_questions = await self.questions.list_by_course_for_user(user_id, course_id)
        available_questions = [
            question
            for question in all_questions
            if str(question["_id"]) not in used_question_ids
        ]
        selected_questions = select_mock_questions(
            available_questions,
            question_count,
            weak_topic_boost,
        )

        if len(selected_questions) < question_count:
            await self._generate_more_questions(user_id, course_id, language)
            all_questions = await self.questions.list_by_course_for_user(user_id, course_id)
            available_questions = [
                question
                for question in all_questions
                if str(question["_id"]) not in used_question_ids
            ]
            selected_questions = select_mock_questions(
                available_questions,
                question_count,
                weak_topic_boost,
            )

            if len(selected_questions) < question_count:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Not enough unused generated questions are available for this mock. "
                        "Generate more course questions first."
                    ),
                )

        bloom_distribution = build_bloom_distribution(selected_questions)
        mock_exam = await self.mock_exams.create(
            {
                "course_id": course_id,
                "user_id": user_id,
                "mock_number": mock_number,
                "time_band": time_band,
                "days_until_exam": days_until_exam,
                "question_count": question_count,
                "duration_minutes": rule["duration_minutes"],
                "question_ids": [str(question["_id"]) for question in selected_questions],
                "weak_topic_boost": weak_topic_boost,
                "bloom_distribution": bloom_distribution,
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "submitted_at": None,
            }
        )
        return MockExamGenerateResponse(
            mode="mock_exam",
            mock_exam=MockExamResponse.from_document(mock_exam, selected_questions),
        )

    async def list_mock_exams(
        self,
        user_id: str,
        course_id: str,
    ) -> list[MockExamListItem]:
        await self._get_course_or_404(user_id, course_id)
        mock_exams = await self.mock_exams.list_by_course_for_user(user_id, course_id)
        attempts = await self.mock_attempts.list_by_course_for_user(user_id, course_id)
        attempts_by_mock = {attempt["mock_exam_id"]: attempt for attempt in attempts}
        return [
            MockExamListItem.from_document(mock_exam, attempts_by_mock.get(str(mock_exam["_id"])))
            for mock_exam in mock_exams
        ]

    async def get_mock_exam(self, user_id: str, mock_exam_id: str) -> MockExamResponse:
        mock_exam = await self._get_mock_exam_or_404(user_id, mock_exam_id)
        questions = await self.questions.list_by_ids_for_user(user_id, mock_exam["question_ids"])
        return MockExamResponse.from_document(mock_exam, questions)

    async def submit_mock_exam(
        self,
        user_id: str,
        mock_exam_id: str,
        payload: MockExamSubmitRequest,
        language: str = "en",
    ) -> MockExamSubmitResponse:
        mock_exam = await self._get_mock_exam_or_404(user_id, mock_exam_id)
        if mock_exam["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mock exam has already been submitted",
            )

        questions = await self.questions.list_by_ids_for_user(user_id, mock_exam["question_ids"])
        answers_by_id = {answer.question_id: answer for answer in payload.answers}
        graded_answers = []
        total_score = 0.0
        correct_count = 0

        for question in questions:
            question_id = str(question["_id"])
            answer = answers_by_id.get(question_id)
            student_answer = answer.student_answer if answer else ""
            time_spent_seconds = answer.time_spent_seconds if answer else 0
            if not student_answer.strip():
                score, is_correct = 0.0, False
            else:
                score, is_correct, _, _ = grade_answer(question, student_answer, language)

            total_score += score
            correct_count += 1 if is_correct else 0
            graded_answers.append(
                {
                    "question_id": question_id,
                    "student_answer": student_answer,
                    "is_correct": is_correct,
                    "score": score,
                    "time_spent_seconds": time_spent_seconds,
                }
            )

        total_score_ratio = round(total_score / len(questions), 3) if questions else 0.0
        topic_scores = build_topic_scores(questions, graded_answers)
        bloom_scores = build_bloom_scores(questions, graded_answers)
        diagnostic_score = await self._latest_diagnostic_score(
            user_id,
            mock_exam["course_id"],
        )
        previous_mock = await self.mock_attempts.get_previous_for_course(
            user_id,
            mock_exam["course_id"],
            mock_exam["mock_number"],
        )
        previous_score = previous_mock["total_score"] if previous_mock else None
        trend = compute_trend(total_score_ratio, previous_score)
        vs_diagnostic = (
            round(total_score_ratio - diagnostic_score, 3)
            if diagnostic_score is not None
            else None
        )
        vs_previous_mock = (
            round(total_score_ratio - previous_score, 3)
            if previous_score is not None
            else None
        )
        weak_topics = weak_topics_from_scores(topic_scores)
        bloom_gaps = bloom_gaps_from_scores(bloom_scores)
        study_guide = await StudyGuideService(self.database).generate_from_mock_attempt(
            user_id,
            mock_exam["course_id"],
            mock_exam["mock_number"],
            weak_topics,
            bloom_gaps,
            trend,
            language,
        )
        study_guide_id = study_guide.id
        study_guide_version = study_guide.version

        attempt = await self.mock_attempts.create(
            {
                "mock_exam_id": mock_exam_id,
                "course_id": mock_exam["course_id"],
                "user_id": user_id,
                "mock_number": mock_exam["mock_number"],
                "total_score": total_score_ratio,
                "correct_count": correct_count,
                "topic_scores": topic_scores,
                "bloom_scores": bloom_scores,
                "vs_diagnostic": vs_diagnostic,
                "vs_previous_mock": vs_previous_mock,
                "answers": graded_answers,
                "trend": trend,
                "study_guide_id": study_guide_id,
                "study_guide_version": study_guide_version,
                "created_at": datetime.now(timezone.utc),
            }
        )
        await ScoreHistoryService(self.database).append_event(
            user_id=user_id,
            course_id=mock_exam["course_id"],
            event_type="mock",
            event_id=mock_exam_id,
            event_number=mock_exam["mock_number"],
            total_score=total_score_ratio,
            topic_scores={
                topic_name: score["accuracy"]
                for topic_name, score in topic_scores.items()
            },
            bloom_scores=bloom_scores,
        )
        await self.mock_exams.mark_submitted(user_id, mock_exam_id, datetime.now(timezone.utc))
        return MockExamSubmitResponse(
            mock_exam_attempt_id=str(attempt["_id"]),
            total_score=total_score_ratio,
            trend=trend,
            vs_diagnostic=vs_diagnostic,
            vs_previous_mock=vs_previous_mock,
            study_guide_id=study_guide_id,
            study_guide_version=study_guide_version,
        )

    async def get_results(
        self,
        user_id: str,
        mock_exam_id: str,
    ) -> MockExamResultsResponse:
        mock_exam = await self._get_mock_exam_or_404(user_id, mock_exam_id)
        attempt = await self.mock_attempts.get_by_mock_exam_for_user(user_id, mock_exam_id)
        if attempt is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mock exam attempt not found",
            )
        questions = await self.questions.list_by_ids_for_user(user_id, mock_exam["question_ids"])
        diagnostic_topic_scores, diagnostic_bloom_scores = await self._latest_diagnostic_breakdown(
            user_id,
            mock_exam["course_id"],
        )
        return MockExamResultsResponse(
            mock_exam=MockExamResponse.from_document(mock_exam, questions),
            attempt=MockExamAttemptResponse.from_document(attempt),
            questions=[
                QuestionResultResponse.from_document(question)
                for question in questions
            ],
            diagnostic_topic_scores=diagnostic_topic_scores,
            diagnostic_bloom_scores=diagnostic_bloom_scores,
        )

    async def _latest_weak_topic_boost(
        self,
        user_id: str,
        course_id: str,
    ) -> dict[str, float]:
        attempts = await self.mock_attempts.list_by_course_for_user(user_id, course_id)
        if attempts:
            latest_attempt = attempts[0]
            return {
                topic_name: 2.0
                for topic_name, score in latest_attempt["topic_scores"].items()
                if score["accuracy"] < 0.6
            }

        quizzes = await self.quizzes.list_by_course_for_user(user_id, course_id)
        for quiz in quizzes:
            if quiz.get("quiz_type") == "diagnostic" and quiz.get("weakness_report"):
                return {
                    topic["topic_name"]: 2.0
                    for topic in quiz["weakness_report"].get("weak_topics", [])
                }
        return {}

    async def _latest_diagnostic_score(self, user_id: str, course_id: str) -> float | None:
        quizzes = await self.quizzes.list_by_course_for_user(user_id, course_id)
        for quiz in quizzes:
            if quiz.get("quiz_type") != "diagnostic" or quiz.get("status") != "submitted":
                continue
            attempts = await self.quiz_attempts.list_by_quiz_for_user(user_id, str(quiz["_id"]))
            if attempts:
                return round(sum(attempt["score"] for attempt in attempts) / len(attempts), 3)
        return None

    async def _latest_diagnostic_breakdown(
        self,
        user_id: str,
        course_id: str,
    ) -> tuple[dict, dict]:
        quizzes = await self.quizzes.list_by_course_for_user(user_id, course_id)
        for quiz in quizzes:
            if quiz.get("quiz_type") != "diagnostic" or quiz.get("status") != "submitted":
                continue
            attempts = await self.quiz_attempts.list_by_quiz_for_user(user_id, str(quiz["_id"]))
            if not attempts:
                continue
            topic_scores: dict[str, dict] = {}
            bloom_scores: dict[str, dict] = {}
            for attempt in attempts:
                topic_name = attempt["topic_name"]
                if topic_name not in topic_scores:
                    topic_scores[topic_name] = {"total": 0.0, "question_count": 0}
                topic_scores[topic_name]["total"] += attempt["score"]
                topic_scores[topic_name]["question_count"] += 1

                bloom_level = str(attempt["bloom_level"])
                if bloom_level not in bloom_scores:
                    bloom_scores[bloom_level] = {"total": 0.0, "question_count": 0}
                bloom_scores[bloom_level]["total"] += attempt["score"]
                bloom_scores[bloom_level]["question_count"] += 1

            return (
                {
                    topic_name: {
                        "accuracy": round(score["total"] / score["question_count"], 3),
                        "question_count": score["question_count"],
                    }
                    for topic_name, score in topic_scores.items()
                },
                {
                    bloom_level: round(score["total"] / score["question_count"], 3)
                    for bloom_level, score in bloom_scores.items()
                },
            )
        return {}, {}

    async def _build_exam_day_checklist(self, user_id: str, course_id: str) -> list[str]:
        topics = await self.topics.list_by_course_for_user(user_id, course_id)
        topic_names = [topic["name"] for topic in topics]
        return topic_names or [
            "Review your highest-priority formulas",
            "Check calculator and allowed materials",
            "Take three calm breaths before starting",
        ]

    async def _generate_more_questions(
        self,
        user_id: str,
        course_id: str,
        language: str,
    ) -> None:
        topics = await self.topics.list_by_course_for_user(user_id, course_id)
        approved_topic_ids = [
            str(topic["_id"]) for topic in topics if topic.get("is_approved")
        ]
        if not approved_topic_ids:
            return

        await QuizService(self.database).generate_questions(
            user_id,
            course_id,
            QuestionGenerateRequest(topic_ids=approved_topic_ids, questions_per_bloom=5),
            language,
        )

    async def _get_course_or_404(self, user_id: str, course_id: str) -> dict:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        return course

    async def _get_mock_exam_or_404(self, user_id: str, mock_exam_id: str) -> dict:
        mock_exam = await self.mock_exams.get_by_id_for_user(user_id, mock_exam_id)
        if mock_exam is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mock exam not found",
            )
        return mock_exam


def days_until_exam_from_course(course: dict) -> int:
    exam_date = course["exam_date"]
    if isinstance(exam_date, datetime):
        exam_date = exam_date.date()
    return (exam_date - date.today()).days


def time_band_from_days(days_until_exam: int) -> str:
    if days_until_exam >= 14:
        return "14+"
    if days_until_exam >= 7:
        return "7-13"
    if days_until_exam >= 3:
        return "3-6"
    if days_until_exam >= 1:
        return "1-2"
    return "exam_day"


def select_mock_questions(
    questions: list[dict],
    question_count: int,
    weak_topic_boost: dict[str, float],
) -> list[dict]:
    selected: list[dict] = []
    selected_ids: set[str] = set()
    bloom_targets = target_bloom_distribution(question_count)

    for bloom_level, target_count in bloom_targets.items():
        bloom_questions = [
            question for question in questions if question["bloom_level"] == bloom_level
        ]
        bloom_questions.sort(
            key=lambda question: (
                0 if question["topic_name"] in weak_topic_boost else 1,
                question["topic_name"],
            )
        )
        for question in bloom_questions:
            question_id = str(question["_id"])
            if question_id in selected_ids:
                continue
            selected.append(question)
            selected_ids.add(question_id)
            if sum(1 for item in selected if item["bloom_level"] == bloom_level) >= target_count:
                break

    if len(selected) < question_count:
        for question in questions:
            question_id = str(question["_id"])
            if question_id not in selected_ids:
                selected.append(question)
                selected_ids.add(question_id)
            if len(selected) == question_count:
                break

    return selected[:question_count]


def target_bloom_distribution(question_count: int) -> dict[int, int]:
    base = question_count // 6
    remainder = question_count % 6
    return {
        bloom_level: base + (1 if bloom_level <= remainder else 0)
        for bloom_level in range(1, 7)
    }


def build_bloom_distribution(questions: list[dict]) -> dict[str, int]:
    distribution: dict[str, int] = {}
    for question in questions:
        key = str(question["bloom_level"])
        distribution[key] = distribution.get(key, 0) + 1
    return distribution


def build_topic_scores(questions: list[dict], answers: list[dict]) -> dict:
    question_by_id = {str(question["_id"]): question for question in questions}
    scores: dict[str, dict] = {}
    for answer in answers:
        question = question_by_id[answer["question_id"]]
        topic_name = question["topic_name"]
        if topic_name not in scores:
            scores[topic_name] = {"total": 0.0, "question_count": 0}
        scores[topic_name]["total"] += answer["score"]
        scores[topic_name]["question_count"] += 1

    return {
        topic_name: {
            "accuracy": round(score["total"] / score["question_count"], 3),
            "question_count": score["question_count"],
        }
        for topic_name, score in scores.items()
    }


def build_bloom_scores(questions: list[dict], answers: list[dict]) -> dict:
    question_by_id = {str(question["_id"]): question for question in questions}
    scores: dict[str, dict] = {}
    for answer in answers:
        question = question_by_id[answer["question_id"]]
        bloom_level = str(question["bloom_level"])
        if bloom_level not in scores:
            scores[bloom_level] = {"total": 0.0, "question_count": 0}
        scores[bloom_level]["total"] += answer["score"]
        scores[bloom_level]["question_count"] += 1

    return {
        bloom_level: round(score["total"] / score["question_count"], 3)
        for bloom_level, score in scores.items()
    }


def compute_trend(total_score: float, previous_score: float | None) -> str:
    if previous_score is None:
        return "first_mock"
    difference = total_score - previous_score
    if difference > 0.05:
        return "improving"
    if difference < -0.05:
        return "declining"
    return "stagnant"


def weak_topics_from_scores(topic_scores: dict) -> list[dict]:
    weak_topics = [
        {
            "topic_name": topic_name,
            "accuracy": score["accuracy"],
            "question_count": score["question_count"],
            "weakness_score": round(1 - score["accuracy"], 3),
        }
        for topic_name, score in topic_scores.items()
        if score["accuracy"] < 0.6
    ]
    return sorted(weak_topics, key=lambda topic: topic["weakness_score"], reverse=True)


def bloom_gaps_from_scores(bloom_scores: dict) -> list[dict]:
    labels = {
        "1": "Remember",
        "2": "Understand",
        "3": "Apply",
        "4": "Analyze",
        "5": "Evaluate",
        "6": "Create",
    }
    return [
        {
            "bloom_level": int(bloom_level),
            "bloom_label": labels[bloom_level],
            "accuracy": accuracy,
        }
        for bloom_level, accuracy in bloom_scores.items()
        if accuracy < 0.6
    ]
