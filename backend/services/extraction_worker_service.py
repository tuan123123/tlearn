import asyncio
from datetime import datetime, timezone
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.uploaded_file_repository import UploadedFileRepository
from services.extraction_service import extract_text_from_file
from services.storage_service import StorageService


class ExtractionWorkerService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.uploaded_files = UploadedFileRepository(database)
        self.storage = StorageService()

    async def process_upload(self, upload_id: str) -> None:
        uploaded_file = await self.uploaded_files.get_by_id(upload_id)

        if uploaded_file is None:
            return

        if uploaded_file["extraction_status"] == "done":
            return

        temporary_path: Path | None = None

        try:
            await self.uploaded_files.mark_processing(upload_id)

            temporary_path = await self.storage.download_to_temporary_file(
                uploaded_file["storage_key"],
                Path(uploaded_file["original_filename"]).suffix,
            )

            extracted_text, page_refs = await asyncio.to_thread(
                extract_text_from_file,
                str(temporary_path),
                uploaded_file["file_type"],
            )

            await self.uploaded_files.mark_done(
                upload_id,
                extracted_text,
                page_refs,
                datetime.now(timezone.utc),
            )
        except Exception as exc:
            await self.uploaded_files.mark_failed(upload_id, str(exc))
            raise
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)