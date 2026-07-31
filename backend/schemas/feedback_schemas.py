from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

FeedbackCategory = Literal["bug", "feature_request", "content_issue", "general"]
FeedbackStatus = Literal["new", "reviewed", "resolved"]


class FeedbackCreateRequest(BaseModel):
    category: FeedbackCategory
    message: str = Field(min_length=10, max_length=2000)
    rating: int | None = Field(default=None, ge=1, le=5)
    page_context: str = Field(min_length=1, max_length=300)


class FeedbackCreateResponse(BaseModel):
    success: bool = True
    feedback_id: str


class FeedbackStatusUpdate(BaseModel):
    status: FeedbackStatus


class FeedbackAdminResponse(BaseModel):
    id: str
    user_id: str | None
    user_email: str | None
    category: FeedbackCategory
    message: str
    page_context: str
    rating: int | None
    status: FeedbackStatus
    created_at: datetime

    @classmethod
    def from_document(cls, feedback: dict) -> "FeedbackAdminResponse":
        return cls(
            id=str(feedback["_id"]),
            user_id=feedback.get("user_id"),
            user_email=feedback.get("user_email"),
            category=feedback["category"],
            message=feedback["message"],
            page_context=feedback["page_context"],
            rating=feedback.get("rating"),
            status=feedback["status"],
            created_at=feedback["created_at"],
        )


class FeedbackListResponse(BaseModel):
    items: list[FeedbackAdminResponse]
    total: int
    page: int
    page_size: int
