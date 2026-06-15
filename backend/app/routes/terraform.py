from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import logging
import os
from app.db.session import get_db
from app.models.deployment import Deployment
from app.tasks.iac_tasks import run_terraform_in_docker
from app.api.deps_rbac import get_current_viewer
from app.core.crypto import decrypt_credentials
from app.api.adapters import get_adapter

router = APIRouter(prefix="/terraform", tags=["terraform"])
logger = logging.getLogger(__name__)

@router.get("/drift/{deployment_id}")
def check_terraform_drift(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_viewer)
):
    """Run a terraform plan to detect drift between code and cloud."""
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
        
    template = deployment.template
    account = deployment.cloud_account
    creds = decrypt_credentials(account.encrypted_credentials)
    
    adapter = get_adapter(account.provider)
    env_vars = adapter.get_terraform_provider_vars(creds)
    
    # Inject variables
    if deployment.variables:
        for key, value in deployment.variables.items():
            env_vars[f"TF_VAR_{key}"] = str(value)

    try:
        logs = run_terraform_in_docker(template.content, env_vars, deployment_id, op="plan")
        
        # 🕵️ Drift Detection Logic 🕵️
        # Look for "No changes. Your infrastructure matches the configuration."
        has_drift = "No changes." not in logs and ("to add" in logs or "to change" in logs or "to destroy" in logs)
        
        deployment.has_drift = 1 if has_drift else 0
        deployment.drift_summary = logs[-1000:] # Save the last 1000 chars as summary
        db.commit()
        
        return {
            "status": "success",
            "has_drift": has_drift,
            "logs": logs,
            "summary": "Drift detected" if has_drift else "Configuration synchronized"
        }
    except Exception as e:
        logger.error(f"Drift check failed: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/heal/{deployment_id}")
def heal_terraform_drift(
    deployment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_viewer)
):
    """Run a terraform apply to resolve drift."""
    from app.tasks.iac_tasks import execute_iac_deployment
    # This triggers the same logic as a deployment, which uses 'apply'
    execute_iac_deployment.delay(deployment_id)
    return {"status": "success", "message": "Heal mission initiated. Re-applying blueprints..."}
