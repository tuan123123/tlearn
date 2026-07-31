from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.mock_exam_schemas import (
    MockExamGenerateResponse,
    MockExamListItem,
    MockExamResponse,
    MockExamResultsResponse,
    MockExamSubmitRequest,
    MockExamSubmitResponse,
)
from services.mock_exam_service import MockExamService

router = APIRouter(tags=["mock-exams"])


@router.post("/courses/{course_id}/mock-exams/generate", response_model=MockExamGenerateResponse)
async def generate_mock_exam(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> MockExamGenerateResponse:
    return await MockExamService(database).generate_mock_exam(
        str(current_user["_id"]),
        course_id,
        current_user.get("language", "en"),
    )


@router.get("/courses/{course_id}/mock-exams", response_model=list[MockExamListItem])
async def list_mock_exams(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[MockExamListItem]:
    return await MockExamService(database).list_mock_exams(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/mock-exams/{mock_exam_id}", response_model=MockExamResponse)
async def get_mock_exam(
    mock_exam_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> MockExamResponse:
    return await MockExamService(database).get_mock_exam(
        str(current_user["_id"]),
        mock_exam_id,
    )


@router.post("/mock-exams/{mock_exam_id}/submit", response_model=MockExamSubmitResponse)
async def submit_mock_exam(
    mock_exam_id: str,
    payload: MockExamSubmitRequest,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> MockExamSubmitResponse:
    return await MockExamService(database).submit_mock_exam(
        str(current_user["_id"]),
        mock_exam_id,
        payload,
        current_user.get("language", "en"),
    )


@router.get("/mock-exams/{mock_exam_id}/results", response_model=MockExamResultsResponse)
async def get_mock_exam_results(
    mock_exam_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> MockExamResultsResponse:
    return await MockExamService(database).get_results(
        str(current_user["_id"]),
        mock_exam_id,
    )
