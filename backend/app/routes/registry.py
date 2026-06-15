from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from app.services.registry_service import registry_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/registry", tags=["infrastructure"])

@router.get("/assets", response_model=List[Dict])
def list_sovereign_assets(current_user = Depends(get_current_viewer)):
    """Retrieve all versioned and signed mission assets in the universal registry."""
    return registry_service.get_signed_assets()

@router.post("/verify")
def verify_sovereign_asset(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Verify the cryptographic integrity of a mission asset."""
    asset_id = payload.get("asset_id")
    if not asset_id:
        raise HTTPException(status_code=400, detail="Asset ID is required.")
        
    return registry_service.verify_asset(asset_id)
