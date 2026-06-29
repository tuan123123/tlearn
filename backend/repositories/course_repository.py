from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.course_model import CourseDocument


class CourseRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["courses"]

    async def create(self, course: CourseDocument) -> dict:
        result = await self.collection.insert_one(course)
        created_course = await self.collection.find_one({"_id": result.inserted_id})
        if created_course is None:
            raise RuntimeError("Course was not created")
        return created_course

    async def list_by_user(self, user_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        return await cursor.to_list(length=100)

    async def get_by_id_for_user(self, user_id: str, course_id: str) -> dict | None:
        if not ObjectId.is_valid(course_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(course_id), "user_id": user_id}
        )

    async def update_for_user(
        self,
        user_id: str,
        course_id: str,
        updates: dict,
    ) -> dict | None:
        if not ObjectId.is_valid(course_id):
            return None

        await self.collection.update_one(
            {"_id": ObjectId(course_id), "user_id": user_id},
            {"$set": updates},
        )
        return await self.get_by_id_for_user(user_id, course_id)

    async def delete_for_user(self, user_id: str, course_id: str) -> bool:
        if not ObjectId.is_valid(course_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(course_id), "user_id": user_id}
        )
        return result.deleted_count == 1
