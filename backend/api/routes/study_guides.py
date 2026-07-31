from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.study_guide_schemas import StudyGuideResponse
from services.study_guide_service import StudyGuideService

router = APIRouter(prefix="/study-guides", tags=["study-guides"])


@router.get("/{guide_id}", response_model=StudyGuideResponse)
async def get_study_guide(
    guide_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> StudyGuideResponse:
    return await StudyGuideService(database).get_by_id(
        str(current_user["_id"]),
        guide_id,
    )
