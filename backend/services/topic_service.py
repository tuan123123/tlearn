from datetime import datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.course_repository import CourseRepository
from repositories.topic_repository import TopicRepository
from repositories.uploaded_file_repository import UploadedFileRepository
from schemas.topic_schemas import (
    TopicCreate,
    TopicExtractionResponse,
    TopicResponse,
    TopicUpdate,
)
from services.topic_ai_service import extract_topics_with_ai


class TopicService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.courses = CourseRepository(database)
        self.uploaded_files = UploadedFileRepository(database)
        self.topics = TopicRepository(database)

    async def extract_topics(
        self,
        user_id: str,
        course_id: str,
        language: str = "en",
    ) -> TopicExtractionResponse:
        await self._verify_course_owner(user_id, course_id)
        ready_files = await self.uploaded_files.list_done_by_course_for_user(
            user_id,
            course_id,
        )

        if not ready_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No extracted files available",
            )

        extracted_text = "\n\n".join(
            uploaded_file["extracted_text"] or "" for uploaded_file in ready_files
        )
        ai_topics = extract_topics_with_ai(extracted_text, language)

        if not ai_topics:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI did not return any valid topics",
            )

        created_topics = []
        for topic in ai_topics:
            created_topic = await self.topics.upsert_by_name(
                {
                    "course_id": course_id,
                    "user_id": user_id,
                    "name": topic.name,
                    "description": topic.description,
                    "bloom_skills": topic.bloom_skills,
                    "source_evidence": topic.source_evidence,
                    "is_custom": False,
                    "is_approved": False,
                    "created_at": datetime.now(timezone.utc),
                }
            )
            if created_topic is not None:
                created_topics.append(created_topic)

        course_topics = await self.topics.list_by_course_for_user(user_id, course_id)
        return TopicExtractionResponse(
            topics=[TopicResponse.from_document(topic) for topic in course_topics],
            extracted_count=len(created_topics),
        )

    async def list_topics(self, user_id: str, course_id: str) -> list[TopicResponse]:
        await self._verify_course_owner(user_id, course_id)
        topics = await self.topics.list_by_course_for_user(user_id, course_id)
        return [TopicResponse.from_document(topic) for topic in topics]

    async def create_custom_topic(
        self,
        user_id: str,
        course_id: str,
        payload: TopicCreate,
    ) -> TopicResponse:
        await self._verify_course_owner(user_id, course_id)
        topic = await self.topics.upsert_by_name(
            {
                "course_id": course_id,
                "user_id": user_id,
                "name": payload.name,
                "description": payload.description,
                "bloom_skills": payload.bloom_skills,
                "source_evidence": "Added manually by student",
                "is_custom": True,
                "is_approved": True,
                "created_at": datetime.now(timezone.utc),
            }
        )

        if topic is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Topic already exists",
            )

        return TopicResponse.from_document(topic)

    async def update_topic(
        self,
        user_id: str,
        topic_id: str,
        payload: TopicUpdate,
    ) -> TopicResponse:
        updates = payload.model_dump(exclude_unset=True)
        topic = await self.topics.update_for_user(user_id, topic_id, updates)
        if topic is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found",
            )
        return TopicResponse.from_document(topic)

    async def delete_topic(self, user_id: str, topic_id: str) -> None:
        deleted = await self.topics.delete_for_user(user_id, topic_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found",
            )

    async def _verify_course_owner(self, user_id: str, course_id: str) -> None:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
