from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.quantum_service import quantum_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/quantum", tags=["security"])

@router.get("/status")
def get_quantum_shield_status(current_user = Depends(get_current_viewer)):
    """Retrieve the current health of the post-quantum integrity shield."""
    return quantum_service.get_shield_status()

@router.post("/rotate")
def rotate_orbit_keys(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Initiate a post-quantum key rotation for a mission orbit."""
    orbit_name = payload.get("orbit_name")
    if not orbit_name:
        raise HTTPException(status_code=400, detail="Orbit name is required.")
        
    return quantum_service.rotate_quantum_keys(orbit_name)
