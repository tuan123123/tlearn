from datetime import datetime
from typing import TypedDict


class TopicDocument(TypedDict):
    course_id: str
    user_id: str
    name: str
    description: str
    bloom_skills: list[str]
    source_evidence: str
    is_custom: bool
    is_approved: bool
    created_at: datetime
