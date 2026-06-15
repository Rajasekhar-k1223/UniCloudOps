from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from app.services.evolution_service import evolution_service
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/evolution", tags=["intelligence"])

@router.get("/status")
def get_code_evolution_status(current_user = Depends(get_current_viewer)):
    """Retrieve the current state of source code evolution and class-level immunity."""
    return evolution_service.get_evolution_state()

@router.post("/refactor")
def initiate_genetic_refactor(current_user = Depends(get_current_viewer)):
    """Initiate a genetic refactoring cycle to evolve the platform's source code."""
    return evolution_service.trigger_genetic_refactor()
