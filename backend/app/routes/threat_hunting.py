from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.threat_hunting_service import threat_hunting_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/threats", tags=["security"])

@router.get("/active")
def get_proactive_threats(current_user = Depends(get_current_viewer)):
    """Retrieve the status of proactive threat hunts and patched vulnerabilities."""
    return threat_hunting_service.get_active_hunts()

@router.post("/simulate")
def initiate_zero_day_hunt(current_user = Depends(get_current_viewer)):
    """Initiate a proactive zero-day simulation to discover and patch vulnerabilities."""
    return threat_hunting_service.simulate_zero_day()
