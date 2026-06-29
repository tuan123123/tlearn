from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.upload_schemas import UploadedFileResponse
from services.upload_service import UploadService

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.get("/{upload_id}", response_model=UploadedFileResponse)
async def get_upload(
    upload_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> UploadedFileResponse:
    return await UploadService(database).get_upload(str(current_user["_id"]), upload_id)
