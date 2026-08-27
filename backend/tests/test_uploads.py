import asyncio

from services.storage_service import StorageService, build_storage_key
from services.upload_service import get_file_type_from_filename


def test_upload_file_type_detection_allows_pdf_and_pptx() -> None:
    assert get_file_type_from_filename("lecture.pdf") == "pdf"
    assert get_file_type_from_filename("slides.PPTX") == "pptx"


def test_upload_file_type_detection_rejects_docx_for_phase_2() -> None:
    assert get_file_type_from_filename("notes.docx") is None


def test_build_storage_key_uses_portable_object_key() -> None:
    storage_key = build_storage_key(
        "user-123",
        "course-456",
        "upload-789",
        "Lecture 1.pdf",
    )

    assert storage_key == (
        "users/user-123/courses/course-456/upload-789_Lecture_1.pdf"
    )


def test_local_storage_upload_download_and_delete(tmp_path) -> None:
    async def run_test() -> None:
        storage = StorageService()
        storage.local_root = tmp_path / "uploads"

        source_path = tmp_path / "lecture.pdf"
        source_path.write_bytes(b"sample file content")
        storage_key = "users/user-123/courses/course-456/lecture.pdf"

        await storage.upload_from_path(source_path, storage_key)

        stored_path = storage.local_root / storage_key
        assert stored_path.read_bytes() == b"sample file content"

        temporary_path = await storage.download_to_temporary_file(
            storage_key,
            ".pdf",
        )
        try:
            assert temporary_path.read_bytes() == b"sample file content"
        finally:
            temporary_path.unlink(missing_ok=True)

        await storage.delete(storage_key)

        assert not stored_path.exists()

    asyncio.run(run_test())