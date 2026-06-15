from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.quantum_bridge_service import quantum_bridge_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/quantum-bridge", tags=["security"])

@router.get("/threats")
def get_quantum_threat_analysis(current_user = Depends(get_current_viewer)):
    """Retrieve the current global quantum threat levels and orbit protection status."""
    return quantum_bridge_service.get_global_threats()

@router.post("/upgrade")
def initiate_cryptographic_upgrade(current_user = Depends(get_current_viewer)):
    """Trigger an autonomous global cryptographic upgrade to post-quantum standards."""
    return quantum_bridge_service.trigger_global_upgrade()
