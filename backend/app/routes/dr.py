from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.services.dr_service import dr_service

router = APIRouter(prefix="/dr", tags=["dr"])

@router.get("/status/{project_id}")
def get_dr_status(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Retrieve the real-time status of all disaster recovery missions."""
    try:
        return dr_service.get_dr_status(db, project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/failover/{dr_pair_id}")
def initiate_failover(
    dr_pair_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Engage the 'Big Red Button' for a tactical failover mission."""
    # In production, this would require a second 'Commander' approval (MFA)
    return dr_service.initiate_failover(dr_pair_id)
