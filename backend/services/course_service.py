from datetime import datetime, time, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.course_repository import CourseRepository
from repositories.uploaded_file_repository import UploadedFileRepository
from schemas.course_schemas import CourseCreate, CourseResponse, CourseUpdate


class CourseService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.courses = CourseRepository(database)
        self.uploaded_files = UploadedFileRepository(database)

    async def create_course(
        self,
        user_id: str,
        payload: CourseCreate,
    ) -> CourseResponse:
        course = await self.courses.create(
            {
                "user_id": user_id,
                "name": payload.name,
                "university": payload.university,
                "language": payload.language,
                "exam_date": datetime.combine(
                    payload.exam_date,
                    time.min,
                    tzinfo=timezone.utc,
                ),
                "created_at": datetime.now(timezone.utc),
            }
        )
        return CourseResponse.from_document(course)

    async def list_courses(self, user_id: str) -> list[CourseResponse]:
        courses = await self.courses.list_by_user(user_id)
        for course in courses:
            course["uploaded_file_count"] = await self.uploaded_files.count_by_course_for_user(
                user_id,
                str(course["_id"]),
            )
        return [CourseResponse.from_document(course) for course in courses]

    async def get_course(self, user_id: str, course_id: str) -> CourseResponse:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise self._not_found()
        course["uploaded_file_count"] = await self.uploaded_files.count_by_course_for_user(
            user_id,
            str(course["_id"]),
        )
        return CourseResponse.from_document(course)

    async def update_course(
        self,
        user_id: str,
        course_id: str,
        payload: CourseUpdate,
    ) -> CourseResponse:
        updates = payload.model_dump(exclude_unset=True)
        if "exam_date" in updates:
            updates["exam_date"] = datetime.combine(
                updates["exam_date"],
                time.min,
                tzinfo=timezone.utc,
            )

        course = await self.courses.update_for_user(user_id, course_id, updates)
        if course is None:
            raise self._not_found()
        return CourseResponse.from_document(course)

    async def delete_course(self, user_id: str, course_id: str) -> None:
        deleted = await self.courses.delete_for_user(user_id, course_id)
        if not deleted:
            raise self._not_found()

    def _not_found(self) -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
