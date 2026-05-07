from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer, get_current_operator
from app.models.user import User

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
    variables: Dict = {},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Trigger the provisioning mission for a marketplace service stack."""
    # 🛡️ Strategic Blueprint Resolution 🛡️
    # Support both Internal Integer ID (from UI) and Tactical String Stack ID (aws-eks-v1)
    template = None
    if stack_id.isdigit():
        template = db.query(Template).filter(Template.id == int(stack_id)).first()
    
    if not template:
        template = db.query(Template).filter(Template.stack_id == stack_id).first()

    if not template:
        logger.error(f"MARKETPLACE FAILURE: Blueprint '{stack_id}' not found in sovereign ledger.")
        raise HTTPException(status_code=404, detail="Strategic stack blueprint not found.")
    
    # Simulation: In production, trigger a Celery task that runs the Terraform template for this stack
    # We will simulate a deployment record
    from app.models.deployment import Deployment
    from app.models.cloud_account import CloudAccount
    
    account = db.query(CloudAccount).filter(CloudAccount.id == target_account_id).first()
    if not account:
        raise HTTPException(status_code=400, detail="Target cloud account not found.")

    new_deployment = Deployment(
        user_id=current_user.id,
        template_id=template.id,
        cloud_account_id=account.id,
        status="pending",
        variables={"stack_id": template.stack_id, **variables}
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

@router.put("/templates/{template_id}")
def update_marketplace_template(
    template_id: int,
    updates: Dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Refine an existing infrastructure blueprint (HCL, metadata, etc.)."""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    
    for key, value in updates.items():
        if hasattr(template, key):
            setattr(template, key, value)
    
    db.commit()
    return {"status": "success", "message": f"Blueprint {template.name} refined and authorized."}

@router.post("/templates")
def create_marketplace_template(
    data: Dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Forge a new infrastructure blueprint for the marketplace catalog."""
    new_template = Template(
        stack_id=data.get("stack_id"),
        name=data.get("name"),
        description=data.get("description"),
        iac_type=data.get("iac_type", "terraform"),
        content=data.get("content"),
        provider=data.get("provider"),
        services=data.get("services", []),
        complexity=data.get("complexity", "medium"),
        est_cost=data.get("est_cost", 0.0),
        icon=data.get("icon", "Box")
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return {"status": "success", "message": f"New mission blueprint forged: {new_template.name}", "id": new_template.id}
