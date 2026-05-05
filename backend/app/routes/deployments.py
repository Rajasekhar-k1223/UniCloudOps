from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.deployment import Deployment, Template
from app.models.user import User
from app.schemas.deployment import DeploymentCreate, DeploymentResponse, TemplateResponse
from app.api.deps import get_current_active_user
from app.api.deps_rbac import get_current_operator, get_current_viewer, restrict_to_project
from pydantic import BaseModel
import logging
logger = logging.getLogger(__name__)

from app.tasks.iac_tasks import execute_iac_deployment

router = APIRouter(prefix="/deployments", tags=["deployments"])

@router.get("/templates", response_model=List[TemplateResponse])
def get_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Get all available IaC blueprints."""
    return db.query(Template).all()

@router.post("/", response_model=DeploymentResponse)
def create_deployment(deploy_in: DeploymentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Launch a new infrastructure mission (Operator Authority Required)."""
    # Ensure template exists
    template = db.query(Template).filter(Template.id == deploy_in.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Blueprint not found")
        
    # 🛡️ Mission Guardrail: Cross-Cloud Compatibility Check 🛡️
    from app.models.cloud_account import CloudAccount
    account = db.query(CloudAccount).filter(CloudAccount.id == deploy_in.cloud_account_id).first()
    
    if account and template.provider != account.provider:
        logger.warning(f"MISSION ABORT: Cross-Cloud Mismatch detected for User {current_user.id}. Blueprint '{template.name}' ({template.provider.upper()}) is incompatible with Account '{account.name}' ({account.provider.upper()}).")
        raise HTTPException(
            status_code=400, 
            detail=f"Tactical Mismatch: Blueprint '{template.name}' requires an {template.provider.upper()} account. Current selection '{account.name}' is {account.provider.upper()}."
        )

    deployment = Deployment(
        user_id=current_user.id,
        template_id=deploy_in.template_id,
        cloud_account_id=deploy_in.cloud_account_id,
        project_id=current_user.project_id, # Link deployment to the user's project
        variables=deploy_in.variables, # Persist wizard selections (CPU, RAM, OS, etc.)
        status="pending"
    )
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    
    # 🛡️ Record Tactical Audit Event 🛡️
    from app.services.audit_service import audit_logger
    audit_logger.record_action(
        db, 
        action="MISSION_LAUNCH", 
        user_id=current_user.id, 
        project_id=deployment.project_id, 
        resource_type="deployment",
        resource_id=str(deployment.id),
        message=f"Infrastructure Mission Launched: DEP-{deployment.id}",
        metadata_json={
            "template_id": deployment.template_id,
            "cloud_account_id": deployment.cloud_account_id,
            "variables": deployment.variables
        }
    )

    from app.tasks.iac_tasks import execute_iac_deployment
    execute_iac_deployment.delay(deployment.id)
    return deployment

@router.get("/", response_model=List[DeploymentResponse])
def get_deployments(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Get all missions within use's sovereign project boundary."""
    query = db.query(Deployment)
    return restrict_to_project(query, current_user).all()

@router.get("/{deployment_id}", response_model=DeploymentResponse)
def get_deployment_status(deployment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Check status of a specific mission."""
    query = db.query(Deployment).filter(Deployment.id == deployment_id)
    deployment = restrict_to_project(query, current_user).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Mission not found in your sovereign project")
    return deployment

@router.get("/{deployment_id}/logs")
def get_deployment_logs(deployment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Fetch real-time telemetry from project's deployment stream."""
    query = db.query(Deployment).filter(Deployment.id == deployment_id)
    deployment = restrict_to_project(query, current_user).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Mission logs inaccessible or outside sovereign project")
    return {
        "id": deployment.id,
        "status": deployment.status,
        "logs": deployment.logs or ""
    }

@router.post("/{deployment_id}/redeploy", response_model=DeploymentResponse)
def redeploy_mission(deployment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Re-trigger an existing mission (Operator Authority Required)."""
    query = db.query(Deployment).filter(Deployment.id == deployment_id)
    deployment = restrict_to_project(query, current_user).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    deployment.status = "pending"
    deployment.logs = "--- Tactical Redeploy Initiated ---\n"
    db.commit()
    
    from app.tasks.iac_tasks import execute_iac_deployment
    execute_iac_deployment.delay(deployment.id)
    return deployment

@router.delete("/{deployment_id}")
def decommission_mission(deployment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Trigger an industrial-grade destruction sequence (Terraform Destroy) for a mission."""
    query = db.query(Deployment).filter(Deployment.id == deployment_id)
    deployment = restrict_to_project(query, current_user).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    if deployment.status in ["running", "decommissioning"]:
        raise HTTPException(status_code=400, detail=f"Mission currently in {deployment.status} state. Interference prohibited.")

    deployment.status = "decommissioning"
    deployment.logs = "🚨 DESTRUCTION SEQUENCE INITIATED: Engaging Cloud Decommissioning Engine...\n"
    db.commit()
    
    from app.tasks.iac_tasks import execute_iac_deployment
    execute_iac_deployment.delay(deployment.id, destroy=True)
    return {"status": "success", "message": "Decommissioning task launched"}

@router.delete("/{deployment_id}/scrub")
def scrub_mission_record(deployment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Permanently remove a mission record from the sovereign ledger (Housekeeping)."""
    query = db.query(Deployment).filter(Deployment.id == deployment_id)
    deployment = restrict_to_project(query, current_user).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    if deployment.status in ["running", "decommissioning"]:
        raise HTTPException(status_code=400, detail="Cannot scrub a mission that is actively executing.")

    db.delete(deployment)
    db.commit()
    return {"status": "success", "message": f"Mission DEP-{deployment_id} scrubbed from ledger"}

class BulkScrubRequest(BaseModel):
    ids: List[int]

@router.post("/bulk-scrub")
def bulk_scrub_missions(request: BulkScrubRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_operator)):
    """Mass removal of mission records from the ledger."""
    query = db.query(Deployment).filter(Deployment.id.in_(request.ids))
    deployments = restrict_to_project(query, current_user).all()
    
    scrubbed_count = 0
    errors = []
    
    for d in deployments:
        if d.status in ["running", "decommissioning"]:
            errors.append(f"MISSION-{d.id}: Active state prevents scrubbing")
            continue
        db.delete(d)
        scrubbed_count += 1
    
    db.commit()
    return {
        "status": "success", 
        "scrubbed_total": scrubbed_count, 
        "errors": errors
    }
