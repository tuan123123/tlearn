from pydantic import BaseModel


class ExtractionTaskRequest(BaseModel):
    upload_id: str