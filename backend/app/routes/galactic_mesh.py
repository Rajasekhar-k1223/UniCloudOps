from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.galactic_mesh_service import galactic_mesh_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/galactic", tags=["infrastructure"])

@router.get("/nodes")
def get_mesh_nodes(current_user = Depends(get_current_viewer)):
    """Retrieve all nodes in the galactic compute mesh."""
    return galactic_mesh_service.get_galactic_nodes()

@router.post("/warp")
def initiate_workload_warp(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Initiate a workload warp across the galactic fabric."""
    workload_id = payload.get("workload_id")
    target_node = payload.get("target_node")
    
    if not workload_id or not target_node:
        raise HTTPException(status_code=400, detail="Workload ID and Target Node are required.")
        
    return galactic_mesh_service.warp_workload(workload_id, target_node)
