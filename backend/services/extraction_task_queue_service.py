import asyncio
import json
import logging

from google.cloud import tasks_v2
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.config import get_settings
from services.extraction_worker_service import ExtractionWorkerService

logger = logging.getLogger(__name__)
local_extraction_tasks: set[asyncio.Task[None]] = set()


class ExtractionTaskQueueService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.database = database
        self.settings = get_settings()

    async def enqueue_extraction(self, upload_id: str) -> None:
        if self.settings.task_queue_backend == "local":
            task = asyncio.create_task(self._process_locally(upload_id))
            local_extraction_tasks.add(task)
            task.add_done_callback(local_extraction_tasks.discard)
            return

        await asyncio.to_thread(self._create_cloud_task, upload_id)

    async def _process_locally(self, upload_id: str) -> None:
        try:
            await ExtractionWorkerService(self.database).process_upload(upload_id)
        except Exception:
            logger.exception("Local extraction failed for upload %s", upload_id)

    def _create_cloud_task(self, upload_id: str) -> None:
        self._validate_gcp_settings()

        client = tasks_v2.CloudTasksClient()
        parent = client.queue_path(
            self.settings.gcp_project_id,
            self.settings.cloud_tasks_location,
            self.settings.cloud_tasks_queue,
        )

        task = tasks_v2.Task(
            http_request=tasks_v2.HttpRequest(
                http_method=tasks_v2.HttpMethod.POST,
                url=self.settings.extraction_worker_url,
                headers={"Content-Type": "application/json"},
                body=json.dumps({"upload_id": upload_id}).encode("utf-8"),
                oidc_token=tasks_v2.OidcToken(
                    service_account_email=(
                        self.settings.cloud_tasks_invoker_service_account_email
                    ),
                    audience=self.settings.extraction_worker_audience,
                ),
            )
        )

        client.create_task(parent=parent, task=task)

    def _validate_gcp_settings(self) -> None:
        required_settings = {
            "GCP_PROJECT_ID": self.settings.gcp_project_id,
            "CLOUD_TASKS_LOCATION": self.settings.cloud_tasks_location,
            "CLOUD_TASKS_QUEUE": self.settings.cloud_tasks_queue,
            "EXTRACTION_WORKER_URL": self.settings.extraction_worker_url,
            "EXTRACTION_WORKER_AUDIENCE": self.settings.extraction_worker_audience,
            "CLOUD_TASKS_INVOKER_SERVICE_ACCOUNT_EMAIL": (
                self.settings.cloud_tasks_invoker_service_account_email
            ),
        }

        missing_settings = [
            name for name, value in required_settings.items() if not value
        ]

        if missing_settings:
            joined_names = ", ".join(missing_settings)
            raise RuntimeError(f"Missing Cloud Tasks settings: {joined_names}")
