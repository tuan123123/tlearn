from motor.motor_asyncio import AsyncIOMotorDatabase

from models.score_history_model import ScoreHistoryDocument


class ScoreHistoryRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["score_history"]

    async def create(self, score_history: ScoreHistoryDocument) -> dict:
        result = await self.collection.insert_one(score_history)
        created_row = await self.collection.find_one({"_id": result.inserted_id})
        if created_row is None:
            raise RuntimeError("Score history row was not created")
        return created_row

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "recorded_at",
            1,
        )
        return await cursor.to_list(length=200)

    async def exists_for_event(self, user_id: str, event_type: str, event_id: str) -> bool:
        existing = await self.collection.find_one(
            {"user_id": user_id, "event_type": event_type, "event_id": event_id}
        )
        return existing is not None
