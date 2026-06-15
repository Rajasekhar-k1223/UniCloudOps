from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.temporal_service import temporal_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/temporal", tags=["intelligence"])

@router.get("/states")
def get_temporal_history(current_user = Depends(get_current_viewer)):
    """Retrieve the historical and predicted temporal states of the galactic mesh."""
    return temporal_service.get_temporal_states()
