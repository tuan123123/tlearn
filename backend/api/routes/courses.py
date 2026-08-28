from fastapi import APIRouter, Depends, File, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.course_schemas import CourseCreate, CourseResponse, CourseUpdate
from schemas.topic_schemas import TopicCreate, TopicExtractionResponse, TopicResponse
from schemas.upload_schemas import UploadCreateResponse, UploadedFileListItem
from schemas.quiz_schemas import (
    QuestionGenerateRequest,
    QuestionGenerationResponse,
    QuizMetadataResponse,
    QuizResponse,
)
from schemas.score_history_schemas import (
    BloomTrendResponse,
    ReadinessResponse,
    ScoreHistoryResponse,
    TopicProgressResponse,
)
from schemas.study_guide_schemas import (
    StudyGuideGenerateRequest,
    StudyGuideMetadataResponse,
    StudyGuideResponse,
)
from services.course_service import CourseService
from services.extraction_task_queue_service import ExtractionTaskQueueService
from services.quiz_service import QuizService
from services.score_history_service import ScoreHistoryService
from services.study_guide_service import StudyGuideService
from services.topic_service import TopicService
from services.upload_service import UploadService

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseResponse)
async def create_course(
    payload: CourseCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> CourseResponse:
    return await CourseService(database).create_course(str(current_user["_id"]), payload)


@router.get("", response_model=list[CourseResponse])
async def list_courses(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[CourseResponse]:
    return await CourseService(database).list_courses(str(current_user["_id"]))


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> CourseResponse:
    return await CourseService(database).get_course(str(current_user["_id"]), course_id)


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> CourseResponse:
    return await CourseService(database).update_course(
        str(current_user["_id"]),
        course_id,
        payload,
    )


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> dict[str, str]:
    await CourseService(database).delete_course(str(current_user["_id"]), course_id)
    return {"status": "deleted"}


@router.post("/{course_id}/uploads", response_model=UploadCreateResponse)
async def upload_course_material(
    course_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> UploadCreateResponse:
    upload_service = UploadService(database)
    upload = await upload_service.create_upload(
        str(current_user["_id"]),
        course_id,
        file,
    )

    await ExtractionTaskQueueService(database).enqueue_extraction(upload.file_id)

    return upload


@router.get("/{course_id}/uploads", response_model=list[UploadedFileListItem])
async def list_course_uploads(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[UploadedFileListItem]:
    return await UploadService(database).list_uploads(str(current_user["_id"]), course_id)


@router.post("/{course_id}/extract-topics", response_model=TopicExtractionResponse)
async def extract_course_topics(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> TopicExtractionResponse:
    return await TopicService(database).extract_topics(
        str(current_user["_id"]),
        course_id,
        current_user.get("language", "en"),
    )


@router.get("/{course_id}/topics", response_model=list[TopicResponse])
async def list_course_topics(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[TopicResponse]:
    return await TopicService(database).list_topics(str(current_user["_id"]), course_id)


@router.post("/{course_id}/topics", response_model=TopicResponse)
async def create_custom_topic(
    course_id: str,
    payload: TopicCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> TopicResponse:
    return await TopicService(database).create_custom_topic(
        str(current_user["_id"]),
        course_id,
        payload,
    )


@router.post("/{course_id}/questions/generate", response_model=QuestionGenerationResponse)
async def generate_course_questions(
    course_id: str,
    payload: QuestionGenerateRequest,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> QuestionGenerationResponse:
    return await QuizService(database).generate_questions(
        str(current_user["_id"]),
        course_id,
        payload,
        current_user.get("language", "en"),
    )


@router.post("/{course_id}/quizzes/diagnostic", response_model=QuizResponse)
async def create_diagnostic_quiz(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> QuizResponse:
    return await QuizService(database).create_diagnostic_quiz(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/quizzes", response_model=list[QuizMetadataResponse])
async def list_course_quizzes(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[QuizMetadataResponse]:
    return await QuizService(database).list_course_quizzes(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/score-history", response_model=list[ScoreHistoryResponse])
async def list_score_history(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[ScoreHistoryResponse]:
    return await ScoreHistoryService(database).list_score_history(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/readiness", response_model=ReadinessResponse)
async def get_course_readiness(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> ReadinessResponse:
    return await ScoreHistoryService(database).get_readiness(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/progress/topics", response_model=list[TopicProgressResponse])
async def get_topic_progress(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[TopicProgressResponse]:
    return await ScoreHistoryService(database).get_topic_progress(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/progress/bloom-trend", response_model=list[BloomTrendResponse])
async def get_bloom_trend(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[BloomTrendResponse]:
    return await ScoreHistoryService(database).get_bloom_trend(
        str(current_user["_id"]),
        course_id,
    )


@router.post("/{course_id}/study-guide/generate", response_model=StudyGuideResponse)
async def generate_study_guide(
    course_id: str,
    payload: StudyGuideGenerateRequest,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> StudyGuideResponse:
    return await StudyGuideService(database).generate_study_guide(
        str(current_user["_id"]),
        course_id,
        payload,
        current_user.get("language", "en"),
    )


@router.get("/{course_id}/study-guide/latest", response_model=StudyGuideResponse)
async def get_latest_study_guide(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> StudyGuideResponse:
    return await StudyGuideService(database).get_latest(
        str(current_user["_id"]),
        course_id,
    )


@router.get("/{course_id}/study-guides", response_model=list[StudyGuideMetadataResponse])
async def list_study_guide_versions(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[StudyGuideMetadataResponse]:
    return await StudyGuideService(database).list_versions(
        str(current_user["_id"]),
        course_id,
    )
