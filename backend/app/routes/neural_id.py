from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.neural_id_service import neural_id_service
from app.api.deps_rbac import get_current_viewer
from app.models.user import User

router = APIRouter(prefix="/neural-id", tags=["security"])

@router.get("/risk")
def get_neural_risk(current_user: User = Depends(get_current_viewer)):
    """Retrieve behavioral risk analysis for the current operator."""
    return neural_id_service.get_user_risk_analysis(current_user.email)

@router.post("/challenge")
def issue_neural_challenge(
    payload: Dict,
    current_user: User = Depends(get_current_viewer)
):
    """Issue a security challenge based on neural risk detection."""
    user_email = payload.get("user_email", current_user.email)
    return neural_id_service.trigger_neural_challenge(user_email)
