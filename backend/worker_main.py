from fastapi import Depends, FastAPI, Response, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.config import get_settings
from core.database import ensure_database_indexes, get_database
from schemas.task_schemas import ExtractionTaskRequest
from services.extraction_worker_service import ExtractionWorkerService


def create_worker_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=f"{settings.app_name} Extraction Worker")

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/tasks/extract", status_code=status.HTTP_204_NO_CONTENT)
    async def extract_upload(
        payload: ExtractionTaskRequest,
        database: AsyncIOMotorDatabase = Depends(get_database),
    ) -> Response:
        await ExtractionWorkerService(database).process_upload(payload.upload_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.on_event("startup")
    async def startup() -> None:
        database = await get_database()
        await ensure_database_indexes(database)

    return app


app = create_worker_app()