from datetime import datetime
from typing import TypedDict


class FeedbackDocument(TypedDict):
    user_id: str | None
    user_email: str | None
    category: str
    message: str
    page_context: str
    rating: int | None
    status: str
    rate_limit_key: str
    created_at: datetime
