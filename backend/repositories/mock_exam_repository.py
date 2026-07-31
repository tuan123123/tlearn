from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.mock_exam_model import MockExamDocument


class MockExamRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["mock_exams"]

    async def create(self, mock_exam: MockExamDocument) -> dict:
        result = await self.collection.insert_one(mock_exam)
        created_mock = await self.collection.find_one({"_id": result.inserted_id})
        if created_mock is None:
            raise RuntimeError("Mock exam was not created")
        return created_mock

    async def count_by_course_for_user(self, user_id: str, course_id: str) -> int:
        return await self.collection.count_documents(
            {"user_id": user_id, "course_id": course_id}
        )

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "mock_number",
            -1,
        )
        return await cursor.to_list(length=100)

    async def get_by_id_for_user(self, user_id: str, mock_exam_id: str) -> dict | None:
        if not ObjectId.is_valid(mock_exam_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(mock_exam_id), "user_id": user_id}
        )

    async def list_used_question_ids_for_course(self, user_id: str, course_id: str) -> set[str]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id})
        mock_exams = await cursor.to_list(length=100)
        used_ids: set[str] = set()
        for mock_exam in mock_exams:
            used_ids.update(mock_exam.get("question_ids", []))
        return used_ids

    async def mark_submitted(
        self,
        user_id: str,
        mock_exam_id: str,
        submitted_at: datetime,
    ) -> dict | None:
        if not ObjectId.is_valid(mock_exam_id):
            return None
        await self.collection.update_one(
            {"_id": ObjectId(mock_exam_id), "user_id": user_id},
            {"$set": {"status": "submitted", "submitted_at": submitted_at}},
        )
        return await self.get_by_id_for_user(user_id, mock_exam_id)
