from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.pricing_service import PricingService
import boto3
from app.core.crypto import decrypt_credentials

from app.api.deps_rbac import get_current_operator, get_current_viewer, restrict_to_project
from app.api.adapters import list_adapters, get_adapter
from app.models.resource import Resource

router = APIRouter()

@router.get("/providers")
def get_supported_providers(
    current_user: User = Depends(get_current_viewer)
):
    """List all supported cloud providers in the system."""
    adapters = list_adapters()
    return [{"id": a.provider_id, "name": a.provider_name} for a in adapters]

@router.get("/instances")
def get_catalog_instances(
    provider: str,
    region: str = "us-east-1",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch instance catalog for a specific cloud provider."""
    # Find a relevant account within the user's sovereign project
    query = db.query(CloudAccount).filter(CloudAccount.provider == provider)
    account = restrict_to_project(query, current_user).first()
    
    pricing = PricingService(db)
    catalog = pricing.get_cloud_catalog(provider, region, account)
    
    if not catalog and provider == 'aws' and not account:
        raise HTTPException(status_code=400, detail=f"Please link a PROJECT-associated {provider.upper()} account to fetch dynamic catalogs.")
        
    return catalog

@router.get("/regions")
def get_provider_regions(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch availability zones/regions for specific provider."""
    adapter = get_adapter(provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Provider adapter not found")
    
    return adapter.get_regions()

@router.get("/images")
def get_provider_images(
    provider: str,
    region: str = "us-east-1",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch mapped Image IDs for standard OS types."""
    adapter = get_adapter(provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Provider adapter not found")
    
    return adapter.get_images(region)

@router.get("/storage-options")
def get_provider_storage_options(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch available storage/volume types (EBS, gp3, Premium_LRS, etc.)."""
    adapter = get_adapter(provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Provider adapter not found")
    
    return adapter.get_storage_options()

@router.get("/security-groups")
def get_provider_security_groups(
    provider: str,
    region: str = "us-east-1",
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch firewall/security policies for the selected provider and region within project boundary."""
    adapter = get_adapter(provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Provider adapter not found")
    
    account = None
    if account_id:
        query = db.query(CloudAccount).filter(CloudAccount.id == account_id)
        account = restrict_to_project(query, current_user).first()
        if not account:
            raise HTTPException(status_code=404, detail="Associated project account not found for security rules")

    return adapter.get_security_groups(region, account)

@router.post("/sync/{account_id}")
async def sync_account_resources(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_operator)
):
    """Trigger background discovery to import cloud resources into the sovereign boundary."""
    import logging
    logger = logging.getLogger(__name__)

    query = db.query(CloudAccount).filter(CloudAccount.id == account_id)
    account = restrict_to_project(query, current_user).first()
    
    if not account:
        logger.warning(f"Sovereign Access Denied: User {current_user.id} tried to sync account {account_id} but it is not in project {current_user.project_id}")
        raise HTTPException(
            status_code=404, 
            detail=f"Cloud account {account_id} not found in your sovereign project boundary ({current_user.project_id or 'None'})."
        )

    adapter = get_adapter(account.provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="No adapter for this provider")

    from app.tasks.sync_tasks import sync_cloud_resources
    sync_cloud_resources.delay(account_id)
    return {"status": "sync_initiated", "message": "High-velocity background discovery mission launched."}

@router.get("/network-options")
def get_network_options(
    account_id: Optional[int] = None,
    provider: Optional[str] = None,
    region: str = "us-east-1",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Fetch VPCs and Subnets for an active cloud account or provider mock."""
    account = None
    if account_id:
        query = db.query(CloudAccount).filter(CloudAccount.id == account_id)
        account = restrict_to_project(query, current_user).first()
        if not account:
            raise HTTPException(status_code=404, detail="Cloud account not found within project")
        provider = account.provider

    if not provider:
        raise HTTPException(status_code=400, detail="Missing provider context")

    adapter = get_adapter(provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Provider adapter not found")

    try:
        return adapter.get_network_options(region, account)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch {provider} network info: {str(e)}")

@router.get("/instance-status/{resource_id}")
def get_resource_polling_status(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Fetch the latest live status directly from the provider (Sovereign Project Check Required)."""
    # Ensure resource belongs to project via its cloud account relation
    query = db.query(Resource).join(CloudAccount).filter(Resource.id == resource_id)
    resource = restrict_to_project(query, current_user).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found in your sovereign project")
        
    account = resource.cloud_account
    adapter = get_adapter(account.provider)
    if not adapter:
        raise HTTPException(status_code=404, detail="Adapter not found")
        
    status = adapter.poll_instance_status(resource.external_id, resource.region, account)
    
    # Update DB with fresh status for consistency
    if resource.status != status:
        resource.status = status
        db.commit()
        
    return {"status": status}
