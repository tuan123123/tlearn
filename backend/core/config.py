from functools import lru_cache
import os
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tlearn API"
    environment: str = "development"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "tlearn"
    jwt_secret: str = Field(default="")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    frontend_url: str = "http://localhost:5173"
    openai_api_key: str = ""
    openai_topic_model: str = "gpt-5.4-mini"
    topic_prompt_version: str = "v1"
    question_prompt_version: str = "v1"
    study_guide_prompt_version: str = "v1"
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    resend_from_email: str = os.getenv("RESEND_FROM_EMAIL", "")
    password_reset_token_minutes: int = 15
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_cors_origins(self) -> list[str]:
        if self.environment == "development":
            return ["*"]
        return [self.frontend_url]


@lru_cache
def get_settings() -> Settings:
    return Settings()
