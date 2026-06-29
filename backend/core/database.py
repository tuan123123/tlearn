import asyncio

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from core.config import get_settings

settings = get_settings()
clients: dict[int, AsyncIOMotorClient] = {}


async def get_database() -> AsyncIOMotorDatabase:
    loop_id = id(asyncio.get_running_loop())
    client = clients.get(loop_id)

    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_url)
        clients[loop_id] = client

    return client[settings.mongodb_db_name]
