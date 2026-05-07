from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.services.rightsizing_service import rightsizing_engine

router = APIRouter(prefix="/rightsizing", tags=["rightsizing"])

@router.get("/recommendations/{project_id}")
def get_rightsizing_recommendations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Retrieve tactical cost-optimization recommendations for a specific project."""
    # In production, we'd verify project ownership here
    try:
        return rightsizing_engine.get_recommendations(db, project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply/{resource_id}")
def apply_rightsizing(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Initiate automated rightsizing action (Simulation of instance resize)."""
    # Logic to trigger provider-specific resize action
    return {"status": "success", "message": f"Rightsizing operation initiated for {resource_id}. Resource will be resized during next maintenance window."}
