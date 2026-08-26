from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ExtractionStatus = Literal["pending", "processing", "done", "failed"]
FileType = Literal["pdf", "pptx"]


class PageRefResponse(BaseModel):
    page: int
    text: str


class UploadCreateResponse(BaseModel):
    file_id: str
    original_filename: str
    extraction_status: ExtractionStatus


class UploadedFileListItem(BaseModel):
    id: str
    course_id: str
    original_filename: str
    file_type: FileType
    file_size_bytes: int
    extraction_status: ExtractionStatus
    extraction_error: str | None
    uploaded_at: datetime
    extracted_at: datetime | None

    @classmethod
    def from_document(cls, uploaded_file: dict) -> "UploadedFileListItem":
        return cls(
            id=str(uploaded_file["_id"]),
            course_id=uploaded_file["course_id"],
            original_filename=uploaded_file["original_filename"],
            file_type=uploaded_file["file_type"],
            file_size_bytes=uploaded_file["file_size_bytes"],
            extraction_status=uploaded_file["extraction_status"],
            extraction_error=uploaded_file["extraction_error"],
            uploaded_at=uploaded_file["uploaded_at"],
            extracted_at=uploaded_file["extracted_at"],
        )


class UploadedFileResponse(UploadedFileListItem):
    user_id: str
    extracted_text: str | None
    page_refs: list[PageRefResponse]

    @classmethod
    def from_document(cls, uploaded_file: dict) -> "UploadedFileResponse":
        return cls(
            id=str(uploaded_file["_id"]),
            course_id=uploaded_file["course_id"],
            user_id=uploaded_file["user_id"],
            original_filename=uploaded_file["original_filename"],
            file_type=uploaded_file["file_type"],
            file_size_bytes=uploaded_file["file_size_bytes"],
            extracted_text=uploaded_file["extracted_text"],
            page_refs=uploaded_file["page_refs"],
            extraction_status=uploaded_file["extraction_status"],
            extraction_error=uploaded_file["extraction_error"],
            uploaded_at=uploaded_file["uploaded_at"],
            extracted_at=uploaded_file["extracted_at"],
        )
