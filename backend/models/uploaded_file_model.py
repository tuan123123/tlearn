from datetime import datetime
from typing import Literal, TypedDict


class PageRef(TypedDict):
    page: int
    text: str


class UploadedFileDocument(TypedDict):
    course_id: str
    user_id: str
    original_filename: str
    file_type: Literal["pdf", "pptx"]
    file_size_bytes: int
    storage_path: str
    extracted_text: str | None
    page_refs: list[PageRef]
    extraction_status: Literal["pending", "processing", "done", "failed"]
    extraction_error: str | None
    uploaded_at: datetime
    extracted_at: datetime | None
