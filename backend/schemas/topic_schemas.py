from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ALLOWED_TOPIC_NAMES = [
    "Supply and Demand",
    "Price Elasticity",
    "Income and Cross Elasticity",
    "Consumer Theory",
    "Production and Costs",
    "Perfect Competition",
    "Monopoly",
    "Oligopoly",
    "Game Theory",
    "Market Failure and Externalities",
    "Public Goods",
    "Labour Markets",
    "International Trade",
]

TOPIC_TRANSLATIONS = {
    "Supply and Demand": ["cung và cầu", "cầu", "cung", "cân bằng thị trường"],
    "Price Elasticity": [
        "độ co giãn theo giá",
        "độ co giãn của cầu theo giá",
        "độ co giãn của cung theo giá",
    ],
    "Income and Cross Elasticity": [
        "độ co giãn theo thu nhập",
        "độ co giãn chéo",
        "hàng hóa thay thế",
        "hàng hóa bổ sung",
    ],
    "Consumer Theory": [
        "lý thuyết người tiêu dùng",
        "hữu dụng",
        "đường bàng quan",
        "ràng buộc ngân sách",
    ],
    "Production and Costs": [
        "sản xuất và chi phí",
        "chi phí biên",
        "chi phí cố định",
        "chi phí biến đổi",
    ],
    "Perfect Competition": ["cạnh tranh hoàn hảo", "doanh nghiệp chấp nhận giá"],
    "Monopoly": ["độc quyền", "độc quyền tự nhiên", "sức mạnh thị trường"],
    "Oligopoly": ["độc quyền nhóm", "thiểu số độc quyền", "cạnh tranh độc quyền nhóm"],
    "Game Theory": ["lý thuyết trò chơi", "cân bằng Nash", "song đề tù nhân"],
    "Market Failure and Externalities": [
        "thất bại thị trường",
        "ngoại tác",
        "ngoại ứng",
        "ô nhiễm",
    ],
    "Public Goods": ["hàng hóa công", "tính không loại trừ", "tính không cạnh tranh"],
    "Labour Markets": ["thị trường lao động", "tiền lương", "cung lao động", "cầu lao động"],
    "International Trade": [
        "thương mại quốc tế",
        "lợi thế so sánh",
        "thuế quan",
        "hạn ngạch",
    ],
}

TopicName = Literal[
    "Supply and Demand",
    "Price Elasticity",
    "Income and Cross Elasticity",
    "Consumer Theory",
    "Production and Costs",
    "Perfect Competition",
    "Monopoly",
    "Oligopoly",
    "Game Theory",
    "Market Failure and Externalities",
    "Public Goods",
    "Labour Markets",
    "International Trade",
]


class TopicAiItem(BaseModel):
    name: TopicName
    description: str = Field(min_length=1)
    bloom_skills: list[str] = Field(min_length=1)
    source_evidence: str = Field(min_length=1)


class TopicAiResponse(BaseModel):
    topics: list[TopicAiItem]


class TopicCreate(BaseModel):
    name: TopicName
    description: str = Field(min_length=1)
    bloom_skills: list[str] = Field(min_length=1)


class TopicUpdate(BaseModel):
    name: TopicName | None = None
    description: str | None = Field(default=None, min_length=1)
    bloom_skills: list[str] | None = Field(default=None, min_length=1)
    is_approved: bool | None = None


class TopicResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    name: TopicName
    description: str
    bloom_skills: list[str]
    source_evidence: str
    is_custom: bool
    is_approved: bool
    created_at: datetime

    @classmethod
    def from_document(cls, topic: dict) -> "TopicResponse":
        return cls(
            id=str(topic["_id"]),
            course_id=topic["course_id"],
            user_id=topic["user_id"],
            name=topic["name"],
            description=topic["description"],
            bloom_skills=topic["bloom_skills"],
            source_evidence=topic["source_evidence"],
            is_custom=topic["is_custom"],
            is_approved=topic["is_approved"],
            created_at=topic["created_at"],
        )


class TopicExtractionResponse(BaseModel):
    topics: list[TopicResponse]
    extracted_count: int
