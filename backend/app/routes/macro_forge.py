from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.macro_forge_service import macro_forge_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/macro-forge", tags=["intelligence"])

@router.post("/synthesize")
async def synthesize_macro_platform(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Synthesize a full multi-cloud platform ecosystem from natural language."""
    description = payload.get("description")
    
    if not description:
        raise HTTPException(status_code=400, detail="Platform description is required.")
        
    result = await macro_forge_service.synthesize_platform(description)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result
