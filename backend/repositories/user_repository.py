from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.user_model import UserDocument


class UserRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["users"]

    async def get_by_id(self, user_id: str) -> dict | None:
        if not ObjectId.is_valid(user_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def get_by_email(self, email: str) -> dict | None:
        return await self.collection.find_one({"email": email.lower()})

    async def create(self, user: UserDocument) -> dict:
        result = await self.collection.insert_one(user)
        created_user = await self.collection.find_one({"_id": result.inserted_id})
        if created_user is None:
            raise RuntimeError("User was not created")
        return created_user
