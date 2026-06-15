from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.advisor_service import advisor_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/advisor", tags=["intelligence"])

@router.post("/chat")
async def advisor_strategic_chat(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Chat with the neural advisor for strategic mission reasoning."""
    query = payload.get("query")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query prompt is required.")
        
    result = await advisor_service.chat_with_advisor(query)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result
