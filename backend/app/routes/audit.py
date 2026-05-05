from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/logs")
def get_audit_logs(
    limit: int = 50,
    offset: int = 0,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch a tactical forensic audit feed of all platform operations."""
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
        
    # Order by newest first
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset).all()
    total = query.count()
    
    return {
        "total": total,
        "logs": [
            {
                "id": l.id,
                "user_email": l.user.email if l.user else "System",
                "action": l.action,
                "resource_type": l.resource_type,
                "status": l.status,
                "message": l.message,
                "ip_address": l.ip_address,
                "created_at": l.created_at
            } for l in logs
        ]
    }

@router.get("/sealed/{project_id}")
def get_sealed_report(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Retrieve an immutable sealed forensic report for a specific mission project."""
    from app.services.audit_service import audit_logger
    report = audit_logger.seal_mission_report(db, project_id)
    return report
