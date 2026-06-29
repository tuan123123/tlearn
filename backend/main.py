import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, courses, uploads
from core.config import get_settings
from core.errors import register_error_handlers

logger = logging.getLogger("tlearn.requests")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    logging.basicConfig(level=logging.INFO)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_cors_origins,
        allow_credentials=settings.environment != "development",
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def log_request(request: Request, call_next):
        started_at = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - started_at) * 1000
        logger.info(
            "%s %s completed in %.2fms",
            request.method,
            request.url.path,
            elapsed_ms,
        )
        return response

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    register_error_handlers(app)
    app.include_router(auth.router)
    app.include_router(courses.router)
    app.include_router(uploads.router)
    return app


app = create_app()
