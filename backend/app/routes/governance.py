from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.governance_service import governance_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/governance", tags=["governance"])

@router.get("/laws")
def get_galactic_laws(current_user = Depends(get_current_viewer)):
    """Retrieve the current sovereign laws and their enforcement status."""
    return governance_service.get_sovereign_laws()

@router.post("/synthesize")
async def synthesize_sovereign_law(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Synthesize a new sovereign law from description."""
    description = payload.get("description")
    if not description:
        raise HTTPException(status_code=400, detail="Law description is required.")
        
    return await governance_service.synthesize_law(description)
