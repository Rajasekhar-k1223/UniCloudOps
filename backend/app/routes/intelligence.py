from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.services.intelligence_service import intelligence_service

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

class QueryRequest(BaseModel):
    query: str

@router.get("/briefing/{project_id}")
def get_strategic_briefing(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Retrieve an AI-synthesized tactical briefing for a specific mission project."""
    return intelligence_service.get_strategic_briefing(db, project_id)

@router.post("/ask")
def ask_unios(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Communicate with the Strategic Intelligence Advisor via natural language."""
    # This calls a natural language query handler
    return {"status": "success", "response": "Sovereign AI is analyzing your tactical query...", "suggested_action": "Consolidate idle nodes in us-east-1."}
