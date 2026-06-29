from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.database import get_database
from api.dependencies import get_current_user
from schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> TokenResponse:
    return await AuthService(database).register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> TokenResponse:
    return await AuthService(database).login(payload)


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    return UserResponse.from_document(current_user)
