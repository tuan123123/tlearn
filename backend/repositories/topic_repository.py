from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.topic_model import TopicDocument


class TopicRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["topics"]

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "created_at",
            1,
        )
        return await cursor.to_list(length=100)

    async def list_approved_by_ids_for_user(
        self,
        user_id: str,
        course_id: str,
        topic_ids: list[str],
    ) -> list[dict]:
        object_ids = [ObjectId(topic_id) for topic_id in topic_ids if ObjectId.is_valid(topic_id)]
        cursor = self.collection.find(
            {
                "_id": {"$in": object_ids},
                "user_id": user_id,
                "course_id": course_id,
                "is_approved": True,
            }
        )
        topics = await cursor.to_list(length=len(object_ids))
        order = {topic_id: index for index, topic_id in enumerate(topic_ids)}
        return sorted(topics, key=lambda topic: order.get(str(topic["_id"]), 9999))

    async def create(self, topic: TopicDocument) -> dict:
        result = await self.collection.insert_one(topic)
        created_topic = await self.collection.find_one({"_id": result.inserted_id})
        if created_topic is None:
            raise RuntimeError("Topic was not created")
        return created_topic

    async def upsert_by_name(self, topic: TopicDocument) -> dict | None:
        existing_topic = await self.collection.find_one(
            {
                "user_id": topic["user_id"],
                "course_id": topic["course_id"],
                "name": topic["name"],
            }
        )

        if existing_topic is not None:
            return None

        return await self.create(topic)

    async def get_by_id_for_user(self, user_id: str, topic_id: str) -> dict | None:
        if not ObjectId.is_valid(topic_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(topic_id), "user_id": user_id}
        )

    async def update_for_user(
        self,
        user_id: str,
        topic_id: str,
        updates: dict,
    ) -> dict | None:
        if not ObjectId.is_valid(topic_id):
            return None

        await self.collection.update_one(
            {"_id": ObjectId(topic_id), "user_id": user_id},
            {"$set": updates},
        )
        return await self.get_by_id_for_user(user_id, topic_id)

    async def delete_for_user(self, user_id: str, topic_id: str) -> bool:
        if not ObjectId.is_valid(topic_id):
            return False

        result = await self.collection.delete_one(
            {"_id": ObjectId(topic_id), "user_id": user_id}
        )
        return result.deleted_count == 1
