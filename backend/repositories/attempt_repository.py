from motor.motor_asyncio import AsyncIOMotorDatabase

from models.attempt_model import AttemptDocument


class AttemptRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["attempts"]

    async def create_many(self, attempts: list[AttemptDocument]) -> list[dict]:
        if not attempts:
            return []
        result = await self.collection.insert_many(attempts)
        cursor = self.collection.find({"_id": {"$in": result.inserted_ids}})
        return await cursor.to_list(length=len(result.inserted_ids))

    async def list_by_quiz_for_user(self, user_id: str, quiz_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "quiz_id": quiz_id}).sort(
            "created_at",
            1,
        )
        return await cursor.to_list(length=100)
