from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.mock_exam_attempt_model import MockExamAttemptDocument


class MockExamAttemptRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["mock_exam_attempts"]

    async def create(self, attempt: MockExamAttemptDocument) -> dict:
        result = await self.collection.insert_one(attempt)
        created_attempt = await self.collection.find_one({"_id": result.inserted_id})
        if created_attempt is None:
            raise RuntimeError("Mock exam attempt was not created")
        return created_attempt

    async def get_by_mock_exam_for_user(
        self,
        user_id: str,
        mock_exam_id: str,
    ) -> dict | None:
        return await self.collection.find_one(
            {"user_id": user_id, "mock_exam_id": mock_exam_id}
        )

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "mock_number",
            -1,
        )
        return await cursor.to_list(length=100)

    async def get_previous_for_course(
        self,
        user_id: str,
        course_id: str,
        mock_number: int,
    ) -> dict | None:
        return await self.collection.find_one(
            {
                "user_id": user_id,
                "course_id": course_id,
                "mock_number": {"$lt": mock_number},
            },
            sort=[("mock_number", -1)],
        )

    async def get_by_id_for_user(self, user_id: str, attempt_id: str) -> dict | None:
        if not ObjectId.is_valid(attempt_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(attempt_id), "user_id": user_id}
        )
