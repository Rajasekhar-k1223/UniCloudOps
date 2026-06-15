from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.multiversal_service import multiversal_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/multiversal", tags=["infrastructure"])

@router.get("/realities")
def get_parallel_realities(current_user = Depends(get_current_viewer)):
    """Retrieve the current parallel reality orbits and their stability status."""
    return multiversal_service.get_realities()

@router.post("/switch")
def initiate_reality_takeover(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Initiate a reality switch to move the entire mission control to a parallel architecture."""
    target_id = payload.get("target_reality_id")
    if not target_id:
        raise HTTPException(status_code=400, detail="Target reality ID is required.")
        
    return multiversal_service.initiate_reality_switch(target_id)
