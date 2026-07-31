from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import get_database
from core.security import verify_access_token
from repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer()
optional_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    user_id = verify_access_token(credentials.credentials)
    user = await UserRepository(database).get_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return user


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> dict | None:
    if credentials is None:
        return None

    user_id = verify_access_token(credentials.credentials)
    return await UserRepository(database).get_by_id(user_id)


async def get_current_admin_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user
