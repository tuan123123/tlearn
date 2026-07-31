from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_admin_user, get_optional_current_user
from core.database import get_database
from schemas.feedback_schemas import (
    FeedbackAdminResponse,
    FeedbackCategory,
    FeedbackCreateRequest,
    FeedbackCreateResponse,
    FeedbackListResponse,
    FeedbackStatus,
    FeedbackStatusUpdate,
)
from services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["feedback"])
admin_router = APIRouter(prefix="/admin/feedback", tags=["admin-feedback"])


@router.post("", response_model=FeedbackCreateResponse)
async def create_feedback(
    payload: FeedbackCreateRequest,
    request: Request,
    current_user: dict | None = Depends(get_optional_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> FeedbackCreateResponse:
    client_host = request.client.host if request.client else "unknown"
    return await FeedbackService(database).create_feedback(
        payload,
        current_user,
        client_host,
    )


@admin_router.get("", response_model=FeedbackListResponse)
async def list_feedback_for_admin(
    status: FeedbackStatus | None = None,
    category: FeedbackCategory | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> FeedbackListResponse:
    return await FeedbackService(database).list_feedback(
        status,
        category,
        page,
        page_size,
    )


@admin_router.patch("/{feedback_id}", response_model=FeedbackAdminResponse)
async def update_feedback_status(
    feedback_id: str,
    payload: FeedbackStatusUpdate,
    current_admin: dict = Depends(get_current_admin_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> FeedbackAdminResponse:
    return await FeedbackService(database).update_status(feedback_id, payload.status)
