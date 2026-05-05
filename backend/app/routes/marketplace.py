from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer, get_current_operator
from app.models.user import User

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

from app.models.template import Template

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.get("/stacks")
def get_marketplace_stacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Retrieve the global catalog of strategic infrastructure stacks from the database."""
    return db.query(Template).all()

@router.post("/deploy/{stack_id}")
def deploy_marketplace_stack(
    stack_id: str,
    target_account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Trigger the provisioning mission for a marketplace service stack."""
    # Find stack in DB
    template = db.query(Template).filter(Template.stack_id == stack_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Strategic stack blueprint not found.")
    
    # Simulation: In production, trigger a Celery task that runs the Terraform template for this stack
    # We will simulate a deployment record
    from app.models.deployment import Deployment
    from app.models.cloud_account import CloudAccount
    
    account = db.query(CloudAccount).filter(CloudAccount.id == target_account_id).first()
    if not account:
        raise HTTPException(status_code=400, detail="Target cloud account not found.")

    new_deployment = Deployment(
        name=f"MS-{template.name}-{target_account_id}",
        user_id=current_user.id,
        template_id=template.id,
        cloud_account_id=account.id,
        status="PROVISIONING",
        variables={"stack_id": template.stack_id}
    )
    db.add(new_deployment)
    db.commit()
    
    # 🚀 Launch actual multi-cloud provisioning mission 🚀
    from app.tasks.iac_tasks import execute_iac_deployment
    execute_iac_deployment.delay(new_deployment.id)
    
    return {
        "status": "success",
        "message": f"Marketplace mission initiated: {template.name} is being provisioned on {account.provider.upper()}.",
        "deployment_id": new_deployment.id
    }
