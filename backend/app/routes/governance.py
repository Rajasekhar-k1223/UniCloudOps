from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.deps_rbac import get_current_operator, get_current_viewer
from app.services.governance_service import governance_service
from typing import List, Dict

router = APIRouter(prefix="/governance", tags=["governance"])

@router.post("/remediate/{result_id}")
def remediate_violation(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Trigger an autonomous remediation mission for a specific compliance violation."""
    try:
        result = governance_service.remediate(db, result_id)
        if result['status'] == 'error':
            raise HTTPException(status_code=500, detail=result['message'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results")
def get_compliance_results(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Fetch all tactical compliance results for the mission boundary."""
    from app.models.compliance import ComplianceResult
    results = db.query(ComplianceResult).all()
    return [
        {
            "id": r.id,
            "policy_name": r.policy.name,
            "resource_name": r.resource.name,
            "resource_type": r.resource.type,
            "provider": r.resource.provider,
            "status": r.status,
            "message": r.message,
            "severity": r.policy.severity,
            "timestamp": r.updated_at or r.created_at
        } for r in results
    ]

@router.get("/policies")
def get_active_policies(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Fetch all active tactical policies from the sovereign registry."""
    from app.models.compliance import CompliancePolicy
    return db.query(CompliancePolicy).all()

@router.post("/scan")
def trigger_compliance_scan(db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Initiate a high-priority tactical governance scan across the mission boundary."""
    try:
        governance_service.run_full_scan(db)
        return {"status": "success", "message": "Global compliance scan mission initiated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/repair")
async def trigger_self_healing(db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Initiate a global self-healing audit and repair mission."""
    from app.services.repair_service import repair_service
    results = await repair_service.audit_and_repair(db, current_user.id)
    return {"status": "success", "repaired_count": len(results), "details": results}

@router.get("/repair/history")
def get_repair_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Fetch forensic history of autonomous repair missions."""
    from app.models.audit_log import AuditLog
    logs = db.query(AuditLog).filter(
        AuditLog.action == "SELF_HEAL_REPAIR",
        AuditLog.user_id == current_user.id
    ).order_by(AuditLog.id.desc()).all()
    
    return [
       {
           "id": l.id, "action": l.action, "status": l.status, 
           "message": l.message, "timestamp": l.created_at
       } for l in logs
    ]
