from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from api.dependencies import get_current_user
from core.database import get_database
from schemas.course_schemas import CourseCreate, CourseResponse, CourseUpdate
from schemas.upload_schemas import UploadCreateResponse, UploadedFileListItem
from services.course_service import CourseService
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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> UploadCreateResponse:
    upload_service = UploadService(database)
    upload = await upload_service.create_upload(str(current_user["_id"]), course_id, file)
    background_tasks.add_task(upload_service.extract_upload_text, upload.file_id)
    return upload


@router.get("/{course_id}/uploads", response_model=list[UploadedFileListItem])
async def list_course_uploads(
    course_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[UploadedFileListItem]:
    return await UploadService(database).list_uploads(str(current_user["_id"]), course_id)
