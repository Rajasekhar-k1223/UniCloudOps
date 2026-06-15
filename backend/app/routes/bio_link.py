from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.bio_link_service import bio_link_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/biolink", tags=["security"])

@router.get("/telemetry")
def get_biolink_telemetry(current_user = Depends(get_current_viewer)):
    """Retrieve current operator behavioral and cognitive telemetry."""
    return bio_link_service.get_operator_telemetry()

@router.post("/lockdown")
def trigger_sovereign_lockdown(current_user = Depends(get_current_viewer)):
    """Initiate a Sovereign Lockdown based on behavioral variance detection."""
    return bio_link_service.trigger_lockdown()
