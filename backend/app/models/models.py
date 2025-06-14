from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from ..db.base import Base

class SchemaMaintenance(Base):
    __tablename__ = "schema_maintenance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    schema_json = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class SubmissionMaintenance(Base):
    __tablename__ = "submission_maintenance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schema_id = Column(UUID(as_uuid=True), ForeignKey("schema_maintenance.id"), nullable=False)
    form_data = Column(JSONB, nullable=False)
    submitted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
