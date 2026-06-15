from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from app.services.mission_pulse_service import mission_pulse_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/mission", tags=["intelligence"])

@router.get("/pulse/{project_id}")
async def get_mission_pulse(
    project_id: int,
    current_user = Depends(get_current_viewer)
):
    """Retrieve synthesized neural signals for the project."""
    signals = await mission_pulse_service.get_neural_signals(project_id)
    return signals
