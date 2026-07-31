from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.topic_schemas import TopicResponse, TopicUpdate
from services.topic_service import TopicService

router = APIRouter(prefix="/topics", tags=["topics"])


@router.patch("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: str,
    payload: TopicUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> TopicResponse:
    return await TopicService(database).update_topic(
        str(current_user["_id"]),
        topic_id,
        payload,
    )


@router.delete("/{topic_id}")
async def delete_topic(
    topic_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> dict[str, str]:
    await TopicService(database).delete_topic(str(current_user["_id"]), topic_id)
    return {"status": "deleted"}
