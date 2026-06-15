from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.policy_synthesis_service import policy_synthesis_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/policy", tags=["governance"])

@router.post("/synthesize")
async def synthesize_autonomous_policy(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Synthesize an autonomous Rego policy based on a regulatory standard."""
    standard = payload.get("standard")
    
    if not standard:
        raise HTTPException(status_code=400, detail="Regulatory standard name is required.")
        
    result = await policy_synthesis_service.synthesize_policy(standard)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result
