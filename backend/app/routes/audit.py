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
    include_provider: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch a tactical forensic audit feed merging platform and provider operations."""
    from app.services.audit_aggregator import audit_aggregator
    
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
        
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset).all()
    
    unified_feed = [
        {
            "id": f"PLAT-{l.id}",
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "resource_type": l.resource_type,
            "status": l.status,
            "message": l.message,
            "ip_address": l.ip_address,
            "timestamp": l.created_at,
            "provider": "UniOS"
        } for l in logs
    ]
    
    if include_provider:
        provider_events = audit_aggregator.get_provider_events(db, current_user.id, limit=limit)
        unified_feed.extend(provider_events)
        # Sort by timestamp descending
        unified_feed = sorted(unified_feed, key=lambda x: str(x['timestamp']), reverse=True)[:limit]
    
    return {
        "total": len(unified_feed),
        "logs": unified_feed
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
