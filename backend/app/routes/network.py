from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

router = APIRouter(prefix="/network", tags=["network"])

@router.get("/topology")
def get_network_topology(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Generate a tactical map of all VPCs, subnets, and inter-cloud connectivity tunnels."""
    from app.services.network_service import network_service
    return network_service.get_topology(db)

@router.post("/lb/attach")
def attach_to_lb(
    lb_id: str,
    target_group_arn: str,
    resource_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Initiate a mission to attach existing resources to a Load Balancer."""
    from app.services.network_service import network_service
    return network_service.attach_resources_to_lb(db, lb_id, target_group_arn, resource_ids)
