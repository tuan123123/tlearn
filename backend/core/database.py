import asyncio

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from core.config import get_settings

settings = get_settings()
clients: dict[int, AsyncIOMotorClient] = {}


async def get_database() -> AsyncIOMotorDatabase:
    loop_id = id(asyncio.get_running_loop())
    client = clients.get(loop_id)

    if client is None:
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        clients[loop_id] = client

    return client[settings.mongodb_db_name]


async def ensure_database_indexes(database: AsyncIOMotorDatabase) -> None:
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
