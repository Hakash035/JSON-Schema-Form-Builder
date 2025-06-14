from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, desc
from sqlalchemy.future import select
from ..models.models import SchemaMaintenance, SubmissionMaintenance
from uuid import UUID

async def create_schema(db: AsyncSession, name: str | None, schema_json: dict):
    schema = SchemaMaintenance(name=name, schema_json=schema_json)
    db.add(schema)
    await db.commit()
    await db.refresh(schema)
    return schema

async def get_schema_by_id(db: AsyncSession, schema_id: UUID):
    result = await db.execute(select(SchemaMaintenance).where(SchemaMaintenance.id == schema_id))
    return result.scalars().first()

async def list_schemas(db: AsyncSession, skip: int = 0, limit: int = 10):
    result = await db.execute(
        select(SchemaMaintenance)
        .order_by(desc(SchemaMaintenance.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_schema_count(db: AsyncSession):
    result = await db.execute(select(func.count()).select_from(SchemaMaintenance))
    return result.scalar()

async def get_submission_count(db: AsyncSession, schema_id: UUID):
    result = await db.execute(
        select(func.count())
        .select_from(SubmissionMaintenance)
        .where(SubmissionMaintenance.schema_id == schema_id)
    )
    return result.scalar()

async def create_submission(db: AsyncSession, schema_id: UUID, form_data: dict):
    sub = SubmissionMaintenance(schema_id=schema_id, form_data=form_data)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub

async def list_submissions(db: AsyncSession, schema_id: UUID, skip: int = 0, limit: int = 10):
    result = await db.execute(
        select(SubmissionMaintenance)
        .where(SubmissionMaintenance.schema_id == schema_id)
        .order_by(desc(SubmissionMaintenance.submitted_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_submission_detail(db: AsyncSession, submission_id: UUID):
    result = await db.execute(
        select(SubmissionMaintenance, SchemaMaintenance)
        .join(SchemaMaintenance, SubmissionMaintenance.schema_id == SchemaMaintenance.id)
        .where(SubmissionMaintenance.id == submission_id)
    )
    return result.first()
