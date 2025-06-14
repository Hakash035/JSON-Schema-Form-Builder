from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json

from ..db.session import get_db
from ..schemas.types import *
from ..core.validator import validate_json_schema
from ..crud import submission as crud
from ..crud import gemini

router = APIRouter()

@router.post("/submit-form")
async def submit_form(payload: SubmissionIn, db: AsyncSession = Depends(get_db)):
    validate_json_schema(payload.schema_json, payload.form_data)
    if(payload.schema_id is not None):
        schema_obj = await crud.get_schema_by_id(db, payload.schema_id)
        if not schema_obj:
            raise HTTPException(status_code=404, detail="Schema not found")
        submission = await crud.create_submission(db, payload.schema_id, payload.form_data)
        return {"submission_id": submission.id}
    
    schema_obj = await crud.create_schema(db, payload.schema_json.get('title', 'Untitled Form'), payload.schema_json)
    submission = await crud.create_submission(db, schema_obj.id, payload.form_data)
    return {"submission_id": submission.id}

@router.get("/list-schemas", response_model=list[SchemaOut])
async def list_schemas(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.list_schemas(db, skip, limit)

@router.get("/schemas-count", response_model=CountOut)
async def get_schemas_count(db: AsyncSession = Depends(get_db)):
    schemas = await crud.get_schema_count(db)
    return {"totalRecords": schemas}

@router.get("/submissions-count", response_model=CountOut)
async def get_schemas_count(schema_id: UUID, db: AsyncSession = Depends(get_db)):
    submissions = await crud.get_submission_count(db, schema_id=schema_id)
    return {"totalRecords": submissions}

@router.get("/submissions/{schema_id}", response_model=list[SubmissionOut])
async def get_all_submissions(schema_id: UUID, skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.list_submissions(db, schema_id, skip, limit)

@router.get("/submission/{submission_id}", response_model=SubmissionDetailOut)
async def get_submission_detail(submission_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await crud.get_submission_detail(db, submission_id)
    if not result:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    sub, schema = result
    return {
        "id": sub.id,
        "schema_id": sub.schema_id,
        "form_data": sub.form_data,
        "submitted_at": sub.submitted_at,
        "schema_json": schema.schema_json,
        "name": schema.name
    }

@router.post("/ai-response")
async def get_ai_response(payload: AIResponseIn, db: AsyncSession = Depends(get_db)):
    user_msg = payload.prompt
    response = gemini.call_gemini(user_msg)
    try:
        response = json.loads(response)
    except:
        print("Not a Proper JSON, trying string replace")
        response = response.replace("```json", '').replace("```", '')
        try:
            response = json.loads(response)
        except:
            print("Not a Proper JSON")
        pass


    if type(response) is not dict:
        raise HTTPException(status_code=400, detail="Failed to Generate AI response")
    if (type(response) is str and ("{", "[") not in response) or "error" in response :
        print("Gaurd Rail Hit") # This is not exact - simple fix
        raise HTTPException(status_code=400, detail="AI Does not know how to respond to this prompt, Try something Else")
    return {"response": response}
