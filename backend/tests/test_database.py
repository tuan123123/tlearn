import asyncio

from pymongo.errors import ServerSelectionTimeoutError

from core import database as database_module


def test_database_index_setup_retries_transient_connection_errors(
    monkeypatch,
) -> None:
    async def run_test() -> None:
        attempts = 0
        retry_delays: list[int] = []

        async def fake_create_database_indexes(database) -> None:
            nonlocal attempts
            attempts += 1
            if attempts < 3:
                raise ServerSelectionTimeoutError("temporary startup delay")

        async def fake_sleep(delay: int) -> None:
            retry_delays.append(delay)

        monkeypatch.setattr(
            database_module,
            "_create_database_indexes",
            fake_create_database_indexes,
        )
        monkeypatch.setattr(database_module.asyncio, "sleep", fake_sleep)

        await database_module.ensure_database_indexes(database=None)

        assert attempts == 3
        assert retry_delays == [5, 10]

    asyncio.run(run_test())
