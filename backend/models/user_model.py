from datetime import datetime
from typing import TypedDict


class UserDocument(TypedDict):
    email: str
    display_name: str
    hashed_password: str
    location_country: str
    language: str
    role: str
    created_at: datetime
