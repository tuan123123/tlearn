import asyncio
import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from core.config import get_settings

settings = get_settings()
clients: dict[int, AsyncIOMotorClient] = {}
logger = logging.getLogger(__name__)

DATABASE_STARTUP_ATTEMPTS = 4
DATABASE_STARTUP_RETRY_SECONDS = 5


async def get_database() -> AsyncIOMotorDatabase:
    loop_id = id(asyncio.get_running_loop())
    client = clients.get(loop_id)

    if client is None:
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
            connectTimeoutMS=settings.mongodb_connect_timeout_ms,
        )
        clients[loop_id] = client

    return client[settings.mongodb_db_name]


async def ensure_database_indexes(database: AsyncIOMotorDatabase) -> None:
    for attempt in range(DATABASE_STARTUP_ATTEMPTS):
        try:
            await _create_database_indexes(database)
            return
        except PyMongoError:
            if attempt == DATABASE_STARTUP_ATTEMPTS - 1:
                raise

            retry_delay = DATABASE_STARTUP_RETRY_SECONDS * (2**attempt)
            logger.warning(
                "Database startup connection failed; retrying in %s seconds",
                retry_delay,
            )
            await asyncio.sleep(retry_delay)


async def _create_database_indexes(database: AsyncIOMotorDatabase) -> None:
    indexed_collections = [
        "attempts",
        "courses",
        "mock_exam_attempts",
        "mock_exams",
        "questions",
        "quizzes",
        "score_history",
        "study_guides",
        "topics",
        "uploaded_files",
        "users",
    ]
    for collection_name in indexed_collections:
        await database[collection_name].create_index([("user_id", 1)])
        await database[collection_name].create_index([("course_id", 1)])

    await database["study_guides"].create_index([("course_id", 1), ("version", -1)])
    await database["feedback"].create_index([("created_at", -1)])
    await database["feedback"].create_index([("status", 1), ("category", 1)])
    await database["feedback"].create_index([("rate_limit_key", 1), ("created_at", -1)])
    await database["score_history"].create_index(
        [("course_id", 1), ("user_id", 1), ("recorded_at", 1)]
    )
