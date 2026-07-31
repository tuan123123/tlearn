from datetime import datetime, timezone

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.security import create_access_token, hash_password, verify_password
from repositories.user_repository import UserRepository
from schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse


class AuthService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.users = UserRepository(database)

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        existing_user = await self.users.get_by_email(payload.email)
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = await self.users.create(
            {
                "email": payload.email.lower(),
                "display_name": payload.display_name,
                "hashed_password": hash_password(payload.password),
                "location_country": payload.location_country,
                "language": language_from_country(payload.location_country),
                "role": "user",
                "created_at": datetime.now(timezone.utc),
            }
        )
        return self._token_response(user)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = await self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        return self._token_response(user)

    def _token_response(self, user: dict) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(str(user["_id"])),
            user=UserResponse.from_document(user),
        )


def language_from_country(location_country: str) -> str:
    normalized = location_country.strip().lower()
    vietnam_values = {"vietnam", "viet nam", "việt nam", "vn"}
    united_states_values = {
        "united states",
        "united states of america",
        "usa",
        "us",
        "america",
    }

    if normalized in vietnam_values:
        return "vi"
    if normalized in united_states_values:
        return "en"
    return "en"
