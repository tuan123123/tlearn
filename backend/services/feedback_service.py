from datetime import datetime, timedelta, timezone
from hashlib import sha256

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from repositories.feedback_repository import FeedbackRepository
from schemas.feedback_schemas import (
    FeedbackAdminResponse,
    FeedbackCategory,
    FeedbackCreateRequest,
    FeedbackCreateResponse,
    FeedbackListResponse,
    FeedbackStatus,
)


class FeedbackService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.feedback = FeedbackRepository(database)

    async def create_feedback(
        self,
        payload: FeedbackCreateRequest,
        current_user: dict | None,
        client_host: str,
    ) -> FeedbackCreateResponse:
        rate_limit_key = self._rate_limit_key(current_user, client_host)
        since = datetime.now(timezone.utc) - timedelta(hours=1)
        recent_count = await self.feedback.count_recent_by_rate_limit_key(
            rate_limit_key,
            since,
        )
        if recent_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Feedback submission limit reached. Please try again in an hour.",
            )

        feedback = await self.feedback.create(
            {
                "user_id": str(current_user["_id"]) if current_user else None,
                "user_email": current_user.get("email") if current_user else None,
                "category": payload.category,
                "message": payload.message.strip(),
                "page_context": payload.page_context.strip(),
                "rating": payload.rating,
                "status": "new",
                "rate_limit_key": rate_limit_key,
                "created_at": datetime.now(timezone.utc),
            }
        )
        return FeedbackCreateResponse(feedback_id=str(feedback["_id"]))

    async def list_feedback(
        self,
        status_filter: FeedbackStatus | None,
        category: FeedbackCategory | None,
        page: int,
        page_size: int,
    ) -> FeedbackListResponse:
        filters = {}
        if status_filter is not None:
            filters["status"] = status_filter
        if category is not None:
            filters["category"] = category

        items, total = await self.feedback.list_for_admin(filters, page, page_size)
        return FeedbackListResponse(
            items=[FeedbackAdminResponse.from_document(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_status(
        self,
        feedback_id: str,
        status_update: FeedbackStatus,
    ) -> FeedbackAdminResponse:
        feedback = await self.feedback.update_status(feedback_id, status_update)
        if feedback is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found",
            )
        return FeedbackAdminResponse.from_document(feedback)

    def _rate_limit_key(self, current_user: dict | None, client_host: str) -> str:
        if current_user is not None:
            raw_key = f"user:{current_user['_id']}"
        else:
            raw_key = f"ip:{client_host}"
        return sha256(raw_key.encode("utf-8")).hexdigest()
