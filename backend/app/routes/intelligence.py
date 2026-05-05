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

@router.post("/ask")
def ask_unios(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Communicate with the Strategic Intelligence Advisor via natural language."""
    if not request.query:
        raise HTTPException(status_code=400, detail="Tactical query cannot be empty.")
    
    result = intelligence_service.execute_strategic_query(db, current_user.id, request.query)
    return result
