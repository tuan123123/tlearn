from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.study_guide_model import StudyGuideDocument


class StudyGuideRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["study_guides"]

    async def create(self, study_guide: StudyGuideDocument) -> dict:
        result = await self.collection.insert_one(study_guide)
        created_guide = await self.collection.find_one({"_id": result.inserted_id})
        if created_guide is None:
            raise RuntimeError("Study guide was not created")
        return created_guide

    async def count_by_course_for_user(self, user_id: str, course_id: str) -> int:
        return await self.collection.count_documents(
            {"user_id": user_id, "course_id": course_id}
        )

    async def get_latest_by_course_for_user(
        self,
        user_id: str,
        course_id: str,
    ) -> dict | None:
        return await self.collection.find_one(
            {"user_id": user_id, "course_id": course_id},
            sort=[("version", -1)],
        )

    async def list_metadata_by_course_for_user(
        self,
        user_id: str,
        course_id: str,
    ) -> list[dict]:
        cursor = (
            self.collection.find(
                {"user_id": user_id, "course_id": course_id},
                {"plan": 0},
            )
            .sort("version", -1)
        )
        return await cursor.to_list(length=100)

    async def get_by_id_for_user(self, user_id: str, guide_id: str) -> dict | None:
        if not ObjectId.is_valid(guide_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(guide_id), "user_id": user_id}
        )
