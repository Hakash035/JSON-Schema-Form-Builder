from pydantic import BaseModel
from typing import Dict, Any
from uuid import UUID
from datetime import datetime

class SchemaIn(BaseModel):
    name: str | None = None
    schema_json: Dict[str, Any]

class SubmissionIn(BaseModel):
    schema_json: Dict[str, Any]  # Used for validation
    form_data: Dict[str, Any]
    schema_id: UUID | None = None

class SubmissionOut(BaseModel):
    id: UUID
    schema_id: UUID
    form_data: Dict[str, Any]
    submitted_at: datetime

class SchemaOut(BaseModel):
    id: UUID
    name: str | None
    schema_json: Dict[str, Any]
    created_at: datetime

class SubmissionDetailOut(SubmissionOut):
    schema_json: Dict[str, Any]
    name: str | None

class CountOut(BaseModel):
    totalRecords: int

class AIResponseIn(BaseModel):
    prompt: str

class AIResponseOut(BaseModel):
    response: str