import asyncio
import shutil
from pathlib import Path, PurePosixPath
from tempfile import NamedTemporaryFile

from google.cloud import storage

from core.config import get_settings

def build_storage_key(
    user_id: str,
    course_id: str,
    upload_id: str,
    original_filename: str,
) -> str:
    safe_filename = Path(original_filename.replace("\\", "/")).name.replace(" ", "_")
    safe_filename = safe_filename or "uploaded-file"

    return str(
        PurePosixPath("users")
        / user_id
        / "courses"
        / course_id
        / f"{upload_id}_{safe_filename}"
    )
class StorageService:
    def __init__(self) -> None:
        settings = get_settings()

        self.backend = settings.storage_backend
        self.local_root = Path("uploads").resolve()
        self.bucket: storage.Bucket | None = None

        if self.backend == "gcs":
            if not settings.gcs_upload_bucket:
                raise RuntimeError(
                    "GCS_UPLOAD_BUCKET must be set when STORAGE_BACKEND=gcs"
                )

            client = storage.Client(project=settings.gcp_project_id or None)
            self.bucket = client.bucket(settings.gcs_upload_bucket)

    async def upload_from_path(self, source_path: Path, storage_key: str) -> None:
        self._validate_storage_key(storage_key)

        if self.backend == "local":
            destination_path = self._local_path(storage_key)
            destination_path.parent.mkdir(parents=True, exist_ok=True)
            await asyncio.to_thread(shutil.copyfile, source_path, destination_path)
            return

        await asyncio.to_thread(self._upload_to_gcs, source_path, storage_key)

    async def download_to_temporary_file(
        self,
        storage_key: str,
        suffix: str,
    ) -> Path:
        self._validate_storage_key(storage_key)

        temporary_file = NamedTemporaryFile(
            prefix="tlearn-upload-",
            suffix=suffix,
            delete=False,
        )
        temporary_path = Path(temporary_file.name)
        temporary_file.close()

        try:
            if self.backend == "local":
                await asyncio.to_thread(
                    shutil.copyfile,
                    self._local_path(storage_key),
                    temporary_path,
                )
            else:
                await asyncio.to_thread(
                    self._download_from_gcs,
                    storage_key,
                    temporary_path,
                )

            return temporary_path
        except Exception:
            temporary_path.unlink(missing_ok=True)
            raise

    async def delete(self, storage_key: str) -> None:
        self._validate_storage_key(storage_key)

        if self.backend == "local":
            self._local_path(storage_key).unlink(missing_ok=True)
            return

        await asyncio.to_thread(self._delete_from_gcs, storage_key)

    def _local_path(self, storage_key: str) -> Path:
        key_parts = PurePosixPath(storage_key).parts
        return self.local_root.joinpath(*key_parts)

    def _validate_storage_key(self, storage_key: str) -> None:
        key_path = PurePosixPath(storage_key)

        if not storage_key or key_path.is_absolute() or ".." in key_path.parts:
            raise ValueError("Invalid storage key")

    def _upload_to_gcs(self, source_path: Path, storage_key: str) -> None:
        if self.bucket is None:
            raise RuntimeError("Cloud Storage bucket is not configured")

        self.bucket.blob(storage_key).upload_from_filename(str(source_path))

    def _download_from_gcs(self, storage_key: str, destination_path: Path) -> None:
        if self.bucket is None:
            raise RuntimeError("Cloud Storage bucket is not configured")

        self.bucket.blob(storage_key).download_to_filename(str(destination_path))

    def _delete_from_gcs(self, storage_key: str) -> None:
        if self.bucket is None:
            raise RuntimeError("Cloud Storage bucket is not configured")

        self.bucket.blob(storage_key).delete()