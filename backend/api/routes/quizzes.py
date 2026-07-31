from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.quiz_schemas import (
    QuizResponse,
    QuizResultsResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from services.quiz_service import QuizService

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> QuizResponse:
    return await QuizService(database).get_quiz(str(current_user["_id"]), quiz_id)


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    quiz_id: str,
    payload: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> QuizSubmitResponse:
    return await QuizService(database).submit_quiz(
        str(current_user["_id"]),
        quiz_id,
        payload,
        current_user.get("language", "en"),
    )


@router.get("/{quiz_id}/results", response_model=QuizResultsResponse)
async def get_quiz_results(
    quiz_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> QuizResultsResponse:
    return await QuizService(database).get_results(
        str(current_user["_id"]),
        quiz_id,
        current_user.get("language", "en"),
    )
