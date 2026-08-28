import asyncio

from api.routes.courses import router as courses_router
from services.extraction_task_queue_service import ExtractionTaskQueueService
from services.storage_service import StorageService, build_storage_key
from services.upload_service import get_file_type_from_filename


def test_courses_router_has_course_create_and_one_upload_route() -> None:
    create_routes = [
        route
        for route in courses_router.routes
        if route.path == "/courses" and "POST" in route.methods
    ]
    upload_routes = [
        route
        for route in courses_router.routes
        if route.path == "/courses/{course_id}/uploads" and "POST" in route.methods
    ]

    assert len(create_routes) == 1
    assert len(upload_routes) == 1


def test_local_extraction_is_scheduled_without_blocking(monkeypatch) -> None:
    async def run_test() -> None:
        extraction_started = asyncio.Event()
        allow_extraction_to_finish = asyncio.Event()

        async def fake_process_locally(self, upload_id: str) -> None:
            assert upload_id == "upload-123"
            extraction_started.set()
            await allow_extraction_to_finish.wait()

        monkeypatch.setattr(
            ExtractionTaskQueueService,
            "_process_locally",
            fake_process_locally,
        )

        service = ExtractionTaskQueueService(database=None)
        await service.enqueue_extraction("upload-123")
        await asyncio.wait_for(extraction_started.wait(), timeout=1)

        allow_extraction_to_finish.set()
        await asyncio.sleep(0)

    asyncio.run(run_test())


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
        storage.backend = "local"
        storage.local_root = tmp_path / "uploads"
        storage.bucket = None

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
