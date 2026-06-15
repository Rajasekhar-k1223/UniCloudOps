from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.traffic_service import traffic_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/traffic", tags=["governance"])

@router.get("/status")
def get_traffic_status(current_user = Depends(get_current_viewer)):
    """Retrieve the current global traffic distribution."""
    return traffic_service.get_current_traffic()

@router.post("/shift")
def shift_traffic(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Execute a global traffic warp shift."""
    provider = payload.get("provider")
    weight = payload.get("weight")
    
    if provider is None or weight is None:
        raise HTTPException(status_code=400, detail="Provider and Target Weight are required.")
        
    result = traffic_service.shift_traffic(provider, weight)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result
