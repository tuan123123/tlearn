from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.feedback_model import FeedbackDocument


class FeedbackRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["feedback"]

    async def create(self, feedback: FeedbackDocument) -> dict:
        result = await self.collection.insert_one(feedback)
        created_feedback = await self.collection.find_one({"_id": result.inserted_id})
        if created_feedback is None:
            raise RuntimeError("Feedback was not saved")
        return created_feedback

    async def count_recent_by_rate_limit_key(
        self,
        rate_limit_key: str,
        since: datetime,
    ) -> int:
        return await self.collection.count_documents(
            {
                "rate_limit_key": rate_limit_key,
                "created_at": {"$gte": since},
            }
        )

    async def list_for_admin(
        self,
        filters: dict,
        page: int,
        page_size: int,
    ) -> tuple[list[dict], int]:
        skip = (page - 1) * page_size
        total = await self.collection.count_documents(filters)
        cursor = (
            self.collection.find(filters)
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        )
        return await cursor.to_list(length=page_size), total

    async def update_status(self, feedback_id: str, status: str) -> dict | None:
        if not ObjectId.is_valid(feedback_id):
            return None

        await self.collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": {"status": status}},
        )
        return await self.collection.find_one({"_id": ObjectId(feedback_id)})
