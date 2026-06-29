from datetime import datetime
from typing import TypedDict


class UserDocument(TypedDict):
    email: str
    display_name: str
    hashed_password: str
    language: str
    created_at: datetime
