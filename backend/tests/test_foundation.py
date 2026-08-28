from fastapi.testclient import TestClient

from core.config import Settings
from main import create_app


def test_health_check() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_mongodb_timeouts_allow_for_cloud_cold_starts() -> None:
    settings = Settings(_env_file=None)

    assert settings.mongodb_server_selection_timeout_ms == 30000
    assert settings.mongodb_connect_timeout_ms == 10000


def test_local_frontend_is_allowed_by_cors() -> None:
    client = TestClient(create_app())

    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"


def test_not_found_uses_global_error_format() -> None:
    client = TestClient(create_app())

    response = client.get("/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found", "code": "http_404"}


def test_unexpected_error_uses_global_error_format() -> None:
    app = create_app()

    @app.get("/explode")
    async def explode() -> None:
        raise RuntimeError("Sensitive internal detail")

    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/explode")

    assert response.status_code == 500
    assert response.json() == {
        "detail": "An unexpected error occurred",
        "code": "internal_server_error",
    }
