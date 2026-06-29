from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    language: str
    created_at: datetime

    @classmethod
    def from_document(cls, user: dict) -> "UserResponse":
        return cls(
            id=str(user["_id"]),
            email=user["email"],
            display_name=user["display_name"],
            language=user["language"],
            created_at=user["created_at"],
        )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
