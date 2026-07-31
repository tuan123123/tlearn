from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.quiz_model import QuizDocument


class QuizRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["quizzes"]

    async def create(self, quiz: QuizDocument) -> dict:
        result = await self.collection.insert_one(quiz)
        created_quiz = await self.collection.find_one({"_id": result.inserted_id})
        if created_quiz is None:
            raise RuntimeError("Quiz was not created")
        return created_quiz

    async def get_by_id_for_user(self, user_id: str, quiz_id: str) -> dict | None:
        if not ObjectId.is_valid(quiz_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(quiz_id), "user_id": user_id}
        )

    async def list_question_ids_used_for_course(self, user_id: str, course_id: str) -> set[str]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id})
        quizzes = await cursor.to_list(length=100)
        used_ids: set[str] = set()
        for quiz in quizzes:
            used_ids.update(quiz["question_ids"])
        return used_ids

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "created_at",
            -1,
        )
        return await cursor.to_list(length=100)

    async def mark_submitted(
        self,
        user_id: str,
        quiz_id: str,
        submitted_at: datetime,
    ) -> dict | None:
        if not ObjectId.is_valid(quiz_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(quiz_id), "user_id": user_id},
            {"$set": {"status": "submitted", "submitted_at": submitted_at}},
        )
        return await self.get_by_id_for_user(user_id, quiz_id)

    async def save_weakness_report(
        self,
        user_id: str,
        quiz_id: str,
        weakness_report: dict,
    ) -> dict | None:
        if not ObjectId.is_valid(quiz_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(quiz_id), "user_id": user_id},
            {"$set": {"weakness_report": weakness_report}},
        )
        return await self.get_by_id_for_user(user_id, quiz_id)
