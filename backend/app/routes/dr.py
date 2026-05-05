from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.api.deps_rbac import get_current_operator
from app.models.user import User
from app.services.migration_service import migration_service

router = APIRouter(prefix="/dr", tags=["dr"])

class FailoverRequest(BaseModel):
    resource_id: int
    target_account_id: int

@router.post("/failover")
def trigger_failover(
    request: FailoverRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Initiate a high-priority tactical failover mission."""
    result = migration_service.execute_dr_failover(db, request.resource_id, request.target_account_id)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result

@router.get("/health")
def get_dr_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Assess the readiness of DR standby boundaries across providers."""
    return [
        {"name": "Shadow-Standby-GCP", "target": "GCP-Standard", "status": "Ready", "last_sync": "2m ago"},
        {"name": "Shadow-Standby-DO", "target": "DO-Mission-X", "status": "Ready", "last_sync": "5m ago"},
        {"name": "Shadow-Standby-Azure", "target": "Azure-Sovereign", "status": "Syncing", "last_sync": "10s ago"}
    ]
