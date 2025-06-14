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

@router.post("/submit-form", summary="Submit Form", description="Validate and submit form data based on a JSON Schema. If no schema_id is provided, a new schema will be created and associated with the submission.")
async def submit_form(payload: SubmissionIn, db: AsyncSession = Depends(get_db)):
    if(payload.schema_id is not None):
        schema_obj = await crud.get_schema_by_id(db, payload.schema_id)
        if not schema_obj:
            raise HTTPException(status_code=404, detail="Schema not found")
        
        validate_json_schema(schema_obj.schema_json, payload.form_data)
        submission = await crud.create_submission(db, payload.schema_id, payload.form_data)
        return {"submission_id": submission.id}
    
    validate_json_schema(payload.schema_json, payload.form_data)
    schema_obj = await crud.create_schema(db, payload.schema_json.get('title', 'Untitled Form'), payload.schema_json)
    submission = await crud.create_submission(db, schema_obj.id, payload.form_data)
    return {"submission_id": submission.id}

@router.get("/list-schemas", response_model=list[SchemaOut], summary="List Schemas", description="Fetch a paginated list of previously submitted schemas.")
async def list_schemas(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.list_schemas(db, skip, limit)

@router.get("/schemas-count", response_model=CountOut, summary="Get Schema Count", description="Returns the total number of schemas stored.")
async def get_schemas_count(db: AsyncSession = Depends(get_db)):
    schemas = await crud.get_schema_count(db)
    return {"totalRecords": schemas}

@router.get("/submissions-count", response_model=CountOut, summary="Get Submission Count", description="Returns the number of submissions associated with a specific schema ID.")
async def get_schemas_count(schema_id: UUID, db: AsyncSession = Depends(get_db)):
    submissions = await crud.get_submission_count(db, schema_id=schema_id)
    return {"totalRecords": submissions}

@router.get("/submissions/{schema_id}", response_model=list[SubmissionOut], summary="List Submissions", description="Fetch all submissions linked to a particular schema.")
async def get_all_submissions(schema_id: UUID, skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await crud.list_submissions(db, schema_id, skip, limit)

@router.get("/submission-details/{submission_id}", response_model=SubmissionDetailOut, summary="Get Submission Detail", description="Fetch detailed form submission and its associated schema by submission ID.")
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

@router.post("/ai-response", summary="Generate Schema with AI", description="Generate a valid JSON Schema using AI based on the user's prompt. Returns structured JSON if successful.")
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
