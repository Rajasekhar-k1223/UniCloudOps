from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.immersive_service import immersive_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/immersive", tags=["intelligence"])

@router.get("/mesh")
def get_spatial_mesh(current_user = Depends(get_current_viewer)):
    """Retrieve the 3D spatial mesh for immersive command mode."""
    return immersive_service.get_spatial_mesh()
