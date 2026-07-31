from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.question_model import QuestionDocument


class QuestionRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["questions"]

    async def create(self, question: QuestionDocument) -> dict:
        result = await self.collection.insert_one(question)
        created_question = await self.collection.find_one({"_id": result.inserted_id})
        if created_question is None:
            raise RuntimeError("Question was not created")
        return created_question

    async def question_text_exists(self, course_id: str, question_text: str) -> bool:
        existing = await self.collection.find_one(
            {"course_id": course_id, "question_text": question_text}
        )
        return existing is not None

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find({"user_id": user_id, "course_id": course_id}).sort(
            "created_at",
            1,
        )
        return await cursor.to_list(length=300)

    async def list_by_ids_for_user(self, user_id: str, question_ids: list[str]) -> list[dict]:
        object_ids = [ObjectId(question_id) for question_id in question_ids if ObjectId.is_valid(question_id)]
        cursor = self.collection.find({"_id": {"$in": object_ids}, "user_id": user_id})
        questions = await cursor.to_list(length=len(object_ids))
        order = {question_id: index for index, question_id in enumerate(question_ids)}
        return sorted(questions, key=lambda question: order.get(str(question["_id"]), 9999))
