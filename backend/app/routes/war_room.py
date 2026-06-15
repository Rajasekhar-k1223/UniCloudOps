from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.war_room_service import war_room_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/war-room", tags=["intelligence"])

@router.post("/simulate")
def initiate_simulation(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Initiate a high-fidelity mission scenario simulation."""
    scenario_type = payload.get("scenario_type")
    
    if not scenario_type:
        raise HTTPException(status_code=400, detail="Scenario type is required.")
        
    return war_room_service.simulate_scenario(scenario_type)
