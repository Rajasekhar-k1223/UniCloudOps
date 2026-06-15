from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.voice_service import voice_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/voice", tags=["intelligence"])

@router.post("/command")
def process_voice_command(
    payload: Dict,
    current_user = Depends(get_current_viewer)
):
    """Process a voice transcript and execute the tactical action."""
    transcript = payload.get("transcript", "")
    
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript is required.")
        
    result = voice_service.process_transcript(transcript)
    return result
