from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter
from app.api.services.registry import service_registry

router = APIRouter()

@router.get("/categories")
async def get_service_categories():
    """List all universal service categories."""
    return service_registry.get_categories()

@router.get("/registry/{category}")
async def get_services_by_category(category: str):
    """Get provider-specific service mappings for a category."""
    services = service_registry.get_all_services_for_category(category)
    if not services:
        raise HTTPException(status_code=404, detail="Category not found")
    return services

@router.get("/catalog/{account_id}/{category}")
async def get_provider_catalog(account_id: int, category: str, db=Depends(get_db)):
    """Fetch live service catalog from a specific cloud account."""
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    adapter = get_adapter(account.provider)
    return adapter.get_service_catalog(category, account)

from fastapi import BackgroundTasks
from app.services.terraform_service import TerraformService

@router.post("/execute/{account_id}")
async def execute_service_action(
    account_id: int, 
    resource_id: str, 
    service_type: str, 
    action: str, 
    background_tasks: BackgroundTasks, 
    db=Depends(get_db)
):
    """Execute a lifecycle action on a managed service resource using universal Terraform pipelines."""
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    adapter = get_adapter(account.provider)
    
    if action == "provision":
        tf_service = TerraformService()
        
        # Create a deployment tracker entry
        from app.models.deployment import Deployment
        dep = Deployment(
            name=f"uni-{service_type}-{resource_id}",
            target_cloud=account.provider,
            cloud_account_id=account.id,
            project_id=1,  # Assuming default project
            status="pending",
            parameters={"resource_type": service_type, "name": resource_id, "action": action}
        )
        db.add(dep)
        db.commit()
        db.refresh(dep)
        
        background_tasks.add_task(
            tf_service.execute_deployment,
            dep.id,
            dep.parameters,
            account.id
        )
        
        return {
            "status": "accepted", 
            "message": f"Terraform execution for {service_type} deployed asynchronously.", 
            "deployment_id": dep.id
        }
    else:
        # Fast direct adapter logic for simple start/stop
        return adapter.manage_service_resource(resource_id, service_type, action, account)
