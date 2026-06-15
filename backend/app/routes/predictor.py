from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.predictor_service import predictor_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/predictor", tags=["intelligence"])

@router.get("/forecast")
def get_neural_forecast(current_user = Depends(get_current_viewer)):
    """Retrieve the 24-hour neural traffic forecast."""
    return predictor_service.get_forecast()

@router.post("/provision")
def authorize_pre_provisioning(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Authorize a neural pre-provisioning action based on forecast."""
    region = payload.get("region", "global")
    node_count = payload.get("node_count", 0)
    
    if node_count <= 0:
        raise HTTPException(status_code=400, detail="Node count must be greater than zero.")
        
    return predictor_service.trigger_pre_provisioning(region, node_count)
