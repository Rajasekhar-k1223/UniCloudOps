from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.cost_sentinel_service import cost_sentinel_service
from app.routes.billing import get_project_billing_data
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/billing/sentinel", tags=["billing"])

@router.get("/spikes/{project_id}")
def check_cost_spikes(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_viewer)
):
    """Analyze project spend for cost spikes and anomalies."""
    # Re-use existing billing logic to get historical data
    billing_data = get_project_billing_data(project_id, db)
    history = billing_data.get("history", [])
    
    result = cost_sentinel_service.detect_spikes(history)
    return result
