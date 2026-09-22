from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.assistant_tools import execute_assistant_query, WHITELISTED_TOOLS

router = APIRouter(prefix="/v1/assistant", tags=["assistant"])

class AssistantQuery(BaseModel):
    query: str

@router.post("/chat")
def chat_with_assistant(data: AssistantQuery, db: Session = Depends(get_db)):
    result = execute_assistant_query(data.query, db)
    return result

@router.get("/tools")
def list_tools():
    return WHITELISTED_TOOLS
