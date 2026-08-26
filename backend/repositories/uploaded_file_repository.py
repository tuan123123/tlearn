from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.uploaded_file_model import PageRef, UploadedFileDocument


class UploadedFileRepository:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["uploaded_files"]

    async def create(self, uploaded_file: UploadedFileDocument) -> dict:
        result = await self.collection.insert_one(uploaded_file)
        created_file = await self.collection.find_one({"_id": result.inserted_id})
        if created_file is None:
            raise RuntimeError("Uploaded file was not created")
        return created_file

    async def list_by_course_for_user(self, user_id: str, course_id: str) -> list[dict]:
        cursor = self.collection.find(
            {"user_id": user_id, "course_id": course_id},
            {"extracted_text": 0, "page_refs": 0, "storage_key": 0},
        ).sort("uploaded_at", -1)
        return await cursor.to_list(length=100)

    async def list_done_by_course_for_user(
        self,
        user_id: str,
        course_id: str,
    ) -> list[dict]:
        cursor = self.collection.find(
            {
                "user_id": user_id,
                "course_id": course_id,
                "extraction_status": "done",
            }
        ).sort("uploaded_at", 1)
        return await cursor.to_list(length=100)

    async def get_by_id_for_user(self, user_id: str, upload_id: str) -> dict | None:
        if not ObjectId.is_valid(upload_id):
            return None
        return await self.collection.find_one(
            {"_id": ObjectId(upload_id), "user_id": user_id}
        )

    async def get_by_id(self, upload_id: str) -> dict | None:
        if not ObjectId.is_valid(upload_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(upload_id)})

    async def count_by_course_for_user(self, user_id: str, course_id: str) -> int:
        return await self.collection.count_documents(
            {"user_id": user_id, "course_id": course_id}
        )

    async def mark_processing(self, upload_id: str) -> None:
        await self.collection.update_one(
            {"_id": ObjectId(upload_id)},
            {"$set": {"extraction_status": "processing", "extraction_error": None}},
        )

    async def mark_done(
        self,
        upload_id: str,
        extracted_text: str,
        page_refs: list[PageRef],
        extracted_at: datetime,
    ) -> None:
        await self.collection.update_one(
            {"_id": ObjectId(upload_id)},
            {
                "$set": {
                    "extracted_text": extracted_text,
                    "page_refs": page_refs,
                    "extraction_status": "done",
                    "extraction_error": None,
                    "extracted_at": extracted_at,
                }
            },
        )

    async def mark_failed(self, upload_id: str, error_message: str) -> None:
        await self.collection.update_one(
            {"_id": ObjectId(upload_id)},
            {
                "$set": {
                    "extraction_status": "failed",
                    "extraction_error": error_message,
                }
            },
        )
