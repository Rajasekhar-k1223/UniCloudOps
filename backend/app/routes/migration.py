from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_operator
from app.models.user import User
from app.services.migration_service import migration_service

router = APIRouter(prefix="/migration", tags=["migration"])

@router.get("/plan/{resource_id}")
def get_migration_plan(
    resource_id: int,
    target_account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Analyze a resource and generate a migration plan to a target cloud."""
    result = migration_service.prepare_migration_plan(db, resource_id, target_account_id)
    if result['status'] == 'error':
        raise HTTPException(status_code=400, detail=result['message'])
    return result

@router.post("/execute/{resource_id}")
def execute_migration(
    resource_id: int,
    target_account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Trigger a tactical cross-cloud cloning operation."""
    result = migration_service.execute_migration(db, resource_id, target_account_id)
    if result['status'] == 'error':
        raise HTTPException(status_code=500, detail=result['message'])
    return result
