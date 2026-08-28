from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from repositories.course_repository import CourseRepository
from repositories.uploaded_file_repository import UploadedFileRepository
from schemas.upload_schemas import (
    UploadCreateResponse,
    UploadedFileListItem,
    UploadedFileResponse,
)
from services.storage_service import StorageService, build_storage_key

ALLOWED_EXTENSIONS = {".pdf": "pdf", ".pptx": "pptx"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024


class UploadService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.database = database
        self.courses = CourseRepository(database)
        self.uploaded_files = UploadedFileRepository(database)
        self.storage = StorageService()

    async def create_upload(
        self,
        user_id: str,
        course_id: str,
        file: UploadFile,
    ) -> UploadCreateResponse:
        await self._verify_course_owner(user_id, course_id)

        original_filename = file.filename or "uploaded-file"
        file_type = self._validate_file_type(original_filename)
        upload_id = uuid4().hex
        storage_key = build_storage_key(
            user_id,
            course_id,
            upload_id,
            original_filename,
        )
        file_size = await self._save_upload(file, storage_key)

        try:
            uploaded_file = await self.uploaded_files.create(
                {
                    "course_id": course_id,
                    "user_id": user_id,
                    "original_filename": original_filename,
                    "file_type": file_type,
                    "file_size_bytes": file_size,
                    "storage_key": storage_key,
                    "extracted_text": None,
                    "page_refs": [],
                    "extraction_status": "pending",
                    "extraction_error": None,
                    "uploaded_at": datetime.now(timezone.utc),
                    "extracted_at": None,
                }
            )
        except Exception:
            try:
                await self.storage.delete(storage_key)
            except Exception:
                pass
            raise

        return UploadCreateResponse(
            file_id=str(uploaded_file["_id"]),
            original_filename=uploaded_file["original_filename"],
            extraction_status=uploaded_file["extraction_status"],
        )

    async def list_uploads(
        self,
        user_id: str,
        course_id: str,
    ) -> list[UploadedFileListItem]:
        await self._verify_course_owner(user_id, course_id)
        uploaded_files = await self.uploaded_files.list_by_course_for_user(
            user_id,
            course_id,
        )
        return [
            UploadedFileListItem.from_document(uploaded_file)
            for uploaded_file in uploaded_files
        ]

    async def get_upload(self, user_id: str, upload_id: str) -> UploadedFileResponse:
        uploaded_file = await self.uploaded_files.get_by_id_for_user(user_id, upload_id)
        if uploaded_file is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Upload not found",
            )
        return UploadedFileResponse.from_document(uploaded_file)

    async def _verify_course_owner(self, user_id: str, course_id: str) -> None:
        course = await self.courses.get_by_id_for_user(user_id, course_id)
        if course is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

    def _validate_file_type(self, filename: str | None) -> str:
        file_type = get_file_type_from_filename(filename)

        if file_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF and PPTX uploads are supported in Phase 2",
            )

        return file_type

    async def _save_upload(self, file: UploadFile, storage_key: str) -> int:
        temporary_file = NamedTemporaryFile(prefix="tlearn-upload-", delete=False)
        temporary_path = Path(temporary_file.name)
        file_size = 0

        try:
            with temporary_file:
                while chunk := await file.read(1024 * 1024):
                    file_size += len(chunk)

                    if file_size > MAX_FILE_SIZE_BYTES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="File is too large. Maximum upload size is 20MB",
                        )

                    temporary_file.write(chunk)

            await self.storage.upload_from_path(temporary_path, storage_key)
            return file_size
        finally:
            temporary_path.unlink(missing_ok=True)


def get_file_type_from_filename(filename: str | None) -> str | None:
    extension = Path(filename or "").suffix.lower()
    return ALLOWED_EXTENSIONS.get(extension)