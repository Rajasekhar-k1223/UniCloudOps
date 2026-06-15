from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import GovernancePolicy, PolicyViolation
from typing import Dict

router = APIRouter(prefix="/governance/opa", tags=["Cloud Governance"])

@router.get("/policies")
def list_policies(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List all OPA Governance Policies."""
    return db.query(GovernancePolicy).all()

@router.post("/policies")
def create_policy(name: str, rego_code: str, severity: str = "medium", db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Create a new Open Policy Agent (OPA) policy written in Rego."""
    policy = GovernancePolicy(name=name, rego_code=rego_code, severity=severity)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@router.get("/violations")
def list_violations(status: str = "open", db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List policy violations."""
    return db.query(PolicyViolation).filter(PolicyViolation.status == status).all()

@router.post("/evaluate")
def evaluate_resource(policy_id: int, resource_payload: Dict, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Evaluate a resource payload against an OPA policy (Mocked for MVP)."""
    policy = db.query(GovernancePolicy).filter(GovernancePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # In production, we'd pass resource_payload to an actual OPA server or binary.
    # We will simulate a violation if the payload contains "public=true"
    is_violating = resource_payload.get("public") == True
    
    if is_violating:
        violation = PolicyViolation(
            policy_id=policy.id,
            resource_type=resource_payload.get("type", "unknown"),
            resource_id=resource_payload.get("id", "unknown-id"),
            violating_attributes=str(resource_payload)
        )
        db.add(violation)
        db.commit()
        return {"allowed": False, "reason": "Resource violates governance policy"}
        
    return {"allowed": True}
