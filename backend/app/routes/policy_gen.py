from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.intelligence_service import intelligence_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/policy", tags=["governance"])

@router.post("/generate")
def generate_policy(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Generate an OPA Rego policy from a natural language prompt."""
    prompt = payload.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="Requirement prompt is missing")
        
    result = intelligence_service.synthesize_policy(prompt)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result
