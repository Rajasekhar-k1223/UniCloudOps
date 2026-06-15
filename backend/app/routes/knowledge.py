from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.knowledge_service import knowledge_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/knowledge", tags=["intelligence"])

@router.get("/mesh")
def get_mesh_status(current_user = Depends(get_current_viewer)):
    """Retrieve the current state of the global knowledge mesh."""
    return knowledge_service.get_mesh_intelligence()

@router.post("/broadcast")
def initiate_broadcast(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Initiate a manual intelligence broadcast across the mesh."""
    signal_id = payload.get("signal_id")
    if not signal_id:
        raise HTTPException(status_code=400, detail="Signal ID is required.")
        
    return knowledge_service.broadcast_intelligence(signal_id)
