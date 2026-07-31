from datetime import datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.attempt_repository import AttemptRepository
from repositories.course_repository import CourseRepository
from repositories.question_repository import QuestionRepository
from repositories.quiz_repository import QuizRepository
from repositories.topic_repository import TopicRepository
from repositories.uploaded_file_repository import UploadedFileRepository
from schemas.quiz_schemas import (
    AttemptResponse,
    BLOOM_LABELS,
    QuestionGenerateRequest,
    QuestionGenerationResponse,
    QuestionResultResponse,
    QuizResponse,
    QuizMetadataResponse,
    QuizResultsResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from services.question_ai_service import (
    generate_question_with_ai,
    grade_short_answer_with_ai,
)
from services.score_history_service import ScoreHistoryService
from services.weakness_service import WeaknessService

BLOOM_TARGET_FOR_20 = {1: 4, 2: 4, 3: 3, 4: 3, 5: 3, 6: 3}
QUESTION_TYPES = ["mcq", "numeric", "short_answer"]
DIFFICULTIES = ["easy", "medium", "hard"]


class QuizService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.database = database
        self.courses = CourseRepository(database)
        self.topics = TopicRepository(database)
        self.uploaded_files = UploadedFileRepository(database)
        self.questions = QuestionRepository(database)
        self.quizzes = QuizRepository(database)
        self.attempts = AttemptRepository(database)

    async def generate_questions(
        self,
        user_id: str,
        course_id: str,
        payload: QuestionGenerateRequest,
        language: str = "en",
    ) -> QuestionGenerationResponse:
        await self._verify_course_owner(user_id, course_id)
        topics = await self.topics.list_approved_by_ids_for_user(
            user_id,
            course_id,
            payload.topic_ids,
        )
        if not topics:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No approved topics selected",
            )

        ready_files = await self.uploaded_files.list_done_by_course_for_user(
            user_id,
            course_id,
        )
        if not ready_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No extracted files available",
            )

        source_excerpt = build_source_excerpt(ready_files)
        distribution = build_generation_distribution(payload.questions_per_bloom)
        generated_questions = []
        rejected = 0
        question_index = 0

        for bloom_level, count in distribution.items():
            for count_index in range(count):
                topic = topics[(question_index + count_index) % len(topics)]
                skill = choose_skill(topic, bloom_level)
                question_type = QUESTION_TYPES[question_index % len(QUESTION_TYPES)]
                difficulty = DIFFICULTIES[min(bloom_level // 2, 2)]
                ai_question = generate_question_with_ai(
                    topic["name"],
                    bloom_level,
                    skill,
                    question_type,
                    difficulty,
                    source_excerpt,
                    language,
                )
                question_index += 1

                if ai_question is None:
                    rejected += 1
                    continue

                if await self.questions.question_text_exists(
                    course_id,
                    ai_question.question_text,
                ):
                    rejected += 1
                    continue

                created_question = await self.questions.create(
                    {
                        "course_id": course_id,
                        "user_id": user_id,
                        "topic_id": str(topic["_id"]),
                        "topic_name": topic["name"],
                        "skill": ai_question.skill,
                        "bloom_level": ai_question.bloom_level,
                        "bloom_label": ai_question.bloom_label,
                        "question_type": ai_question.question_type,
                        "question_text": ai_question.question_text,
                        "options": ai_question.options,
                        "correct_answer": ai_question.correct_answer,
                        "explanation": ai_question.explanation,
                        "source_ref": ai_question.source_ref,
                        "difficulty": difficulty,
                        "created_at": datetime.now(timezone.utc),
                    }
                )
                generated_questions.append(created_question)

        return QuestionGenerationResponse(
            generated=len(generated_questions),
            rejected=rejected,
            questions=[
                QuestionResultResponse.from_document(question)
                for question in generated_questions
            ],
        )

    async def create_diagnostic_quiz(self, user_id: str, course_id: str) -> QuizResponse:
        await self._verify_course_owner(user_id, course_id)
        all_questions = await self.questions.list_by_course_for_user(user_id, course_id)
        used_question_ids = await self.quizzes.list_question_ids_used_for_course(
            user_id,
            course_id,
        )
        selected_questions = select_diagnostic_questions(all_questions, used_question_ids)
        if len(selected_questions) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 20 generated questions are required",
            )

        question_ids = [str(question["_id"]) for question in selected_questions]
        bloom_distribution: dict[str, int] = {}
        for question in selected_questions:
            key = str(question["bloom_level"])
            bloom_distribution[key] = bloom_distribution.get(key, 0) + 1

        quiz = await self.quizzes.create(
            {
                "course_id": course_id,
                "user_id": user_id,
                "quiz_type": "diagnostic",
                "question_ids": question_ids,
                "bloom_distribution": bloom_distribution,
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "submitted_at": None,
            }
        )
        return QuizResponse.from_document(quiz, selected_questions)

    async def list_course_quizzes(
        self,
        user_id: str,
        course_id: str,
    ) -> list[QuizMetadataResponse]:
        await self._verify_course_owner(user_id, course_id)
        quizzes = await self.quizzes.list_by_course_for_user(user_id, course_id)
        return [QuizMetadataResponse.from_document(quiz) for quiz in quizzes]

    async def get_quiz(self, user_id: str, quiz_id: str) -> QuizResponse:
        quiz = await self._get_quiz_or_404(user_id, quiz_id)
        questions = await self.questions.list_by_ids_for_user(user_id, quiz["question_ids"])
        return QuizResponse.from_document(quiz, questions)

    async def submit_quiz(
        self,
        user_id: str,
        quiz_id: str,
        payload: QuizSubmitRequest,
        language: str = "en",
    ) -> QuizSubmitResponse:
        quiz = await self._get_quiz_or_404(user_id, quiz_id)
        if quiz["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz has already been submitted",
            )

        questions = await self.questions.list_by_ids_for_user(user_id, quiz["question_ids"])
        questions_by_id = {str(question["_id"]): question for question in questions}
        answers_by_id = {answer.question_id: answer for answer in payload.answers}
        attempts_to_create = []
        total_score = 0.0
        correct_count = 0

        for question in questions:
            question_id = str(question["_id"])
            answer = answers_by_id.get(question_id)
            if answer is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="All quiz questions must be answered",
                )

            score, is_correct, grading_method, ai_feedback = grade_answer(
                question,
                answer.student_answer,
                language,
            )
            total_score += score
            correct_count += 1 if is_correct else 0
            attempts_to_create.append(
                {
                    "quiz_id": quiz_id,
                    "question_id": question_id,
                    "course_id": question["course_id"],
                    "user_id": user_id,
                    "topic_id": question["topic_id"],
                    "topic_name": question["topic_name"],
                    "bloom_level": question["bloom_level"],
                    "bloom_label": question["bloom_label"],
                    "skill": question["skill"],
                    "student_answer": answer.student_answer,
                    "is_correct": is_correct,
                    "score": score,
                    "time_spent_seconds": answer.time_spent_seconds,
                    "used_hint": False,
                    "grading_method": grading_method,
                    "ai_feedback": ai_feedback,
                    "created_at": datetime.now(timezone.utc),
                }
            )

        await self.attempts.create_many(attempts_to_create)
        await self.quizzes.mark_submitted(user_id, quiz_id, datetime.now(timezone.utc))
        await ScoreHistoryService(self.database).append_event(
            user_id=user_id,
            course_id=quiz["course_id"],
            event_type="diagnostic",
            event_id=quiz_id,
            event_number=0,
            total_score=total_score / len(questions),
            topic_scores=score_history_topic_scores(attempts_to_create),
            bloom_scores=score_history_bloom_scores(attempts_to_create),
        )
        return QuizSubmitResponse(
            quiz_id=quiz_id,
            total_score=round(total_score, 2),
            correct_count=correct_count,
            total_questions=len(questions_by_id),
        )

    async def get_results(
        self,
        user_id: str,
        quiz_id: str,
        language: str = "en",
    ) -> QuizResultsResponse:
        quiz = await self._get_quiz_or_404(user_id, quiz_id)
        questions = await self.questions.list_by_ids_for_user(user_id, quiz["question_ids"])
        attempts = await self.attempts.list_by_quiz_for_user(user_id, quiz_id)
        weakness_report = quiz.get("weakness_report")
        if weakness_report is None:
            weakness_report = await WeaknessService(self.database).compute_weakness_report(
                quiz_id,
                user_id,
                language,
            )
        total_score = sum(attempt["score"] for attempt in attempts)
        correct_count = sum(1 for attempt in attempts if attempt["is_correct"])
        return QuizResultsResponse(
            quiz=QuizResponse.from_document(quiz, questions),
            questions=[
                QuestionResultResponse.from_document(question) for question in questions
            ],
            attempts=[
                AttemptResponse.from_document(attempt)
                for attempt in attempts
            ],
            weakness_report=weakness_report,
            total_score=round(total_score, 2),
            correct_count=correct_count,
            total_questions=len(questions),
        )

    async def _verify_course_owner(self, user_id: str, course_id: str) -> None:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

    async def _get_quiz_or_404(self, user_id: str, quiz_id: str) -> dict:
        quiz = await self.quizzes.get_by_id_for_user(user_id, quiz_id)
        if quiz is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found",
            )
        return quiz


def build_generation_distribution(questions_per_bloom: int) -> dict[int, int]:
    if questions_per_bloom == 3:
        return BLOOM_TARGET_FOR_20
    return {level: questions_per_bloom for level in range(1, 7)}


def build_source_excerpt(ready_files: list[dict], max_chars: int = 8000) -> str:
    chunks = []
    for uploaded_file in ready_files:
        for page_ref in uploaded_file.get("page_refs", []):
            chunks.append(f"Page/Slide {page_ref['page']}: {page_ref['text']}")
    excerpt = "\n\n".join(chunks)
    return excerpt[:max_chars]


def choose_skill(topic: dict, bloom_level: int) -> str:
    skills = topic.get("bloom_skills") or []
    if skills:
        return skills[(bloom_level - 1) % len(skills)]
    return f"{BLOOM_LABELS[bloom_level].lower()} {topic['name']}"


def select_diagnostic_questions(
    questions: list[dict],
    used_question_ids: set[str],
) -> list[dict]:
    unused = [question for question in questions if str(question["_id"]) not in used_question_ids]
    pool = unused if len(unused) >= 20 else questions
    selected: list[dict] = []
    selected_ids: set[str] = set()

    for bloom_level, target_count in BLOOM_TARGET_FOR_20.items():
        bloom_questions = [
            question
            for question in pool
            if question["bloom_level"] == bloom_level and str(question["_id"]) not in selected_ids
        ]
        for question in bloom_questions[:target_count]:
            selected.append(question)
            selected_ids.add(str(question["_id"]))

    if len(selected) < 20:
        for question in pool:
            if str(question["_id"]) not in selected_ids:
                selected.append(question)
                selected_ids.add(str(question["_id"]))
            if len(selected) == 20:
                break

    return selected[:20]


def grade_answer(
    question: dict,
    student_answer: str,
    language: str = "en",
) -> tuple[float, bool, str, str | None]:
    if question["question_type"] == "mcq":
        is_correct = student_answer.strip().upper() == question["correct_answer"].upper()
        return (1.0 if is_correct else 0.0, is_correct, "code", None)

    if question["question_type"] == "numeric":
        is_correct = numeric_answers_match(student_answer, question["correct_answer"])
        return (1.0 if is_correct else 0.0, is_correct, "code", None)

    grade = grade_short_answer_with_ai(
        question["question_text"],
        question["correct_answer"],
        student_answer,
        language,
    )
    return (grade.score, grade.score >= 0.7, "ai", grade.feedback)


def numeric_answers_match(student_answer: str, correct_answer: str) -> bool:
    try:
        student_value = float(student_answer)
        correct_value = float(correct_answer)
    except ValueError:
        return False

    tolerance = abs(correct_value) * 0.02
    if tolerance == 0:
        tolerance = 0.02
    return abs(student_value - correct_value) <= tolerance


def score_history_topic_scores(attempts: list[dict]) -> dict[str, float]:
    grouped: dict[str, dict[str, float]] = {}
    for attempt in attempts:
        topic_name = attempt["topic_name"]
        if topic_name not in grouped:
            grouped[topic_name] = {"total": 0.0, "count": 0}
        grouped[topic_name]["total"] += attempt["score"]
        grouped[topic_name]["count"] += 1
    return {
        topic_name: round(values["total"] / values["count"], 3)
        for topic_name, values in grouped.items()
    }


def score_history_bloom_scores(attempts: list[dict]) -> dict[str, float]:
    grouped: dict[str, dict[str, float]] = {}
    for attempt in attempts:
        bloom_level = str(attempt["bloom_level"])
        if bloom_level not in grouped:
            grouped[bloom_level] = {"total": 0.0, "count": 0}
        grouped[bloom_level]["total"] += attempt["score"]
        grouped[bloom_level]["count"] += 1
    return {
        bloom_level: round(values["total"] / values["count"], 3)
        for bloom_level, values in grouped.items()
    }
