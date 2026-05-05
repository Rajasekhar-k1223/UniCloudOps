from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

router = APIRouter(prefix="/kubernetes", tags=["kubernetes"])

@router.get("/clusters")
def get_all_clusters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Aggregate managed Kubernetes clusters across all integrated multi-cloud accounts."""
    accounts = db.query(CloudAccount).filter(CloudAccount.user_id == current_user.id).all()
    
    all_clusters = []
    for acc in accounts:
        adapter = get_adapter(acc.provider)
        if adapter:
            try:
                clusters = adapter.get_clusters(acc)
                # Enforce consistent structure and attach account info
                for c in clusters:
                    c['account_name'] = acc.name
                    all_clusters.append(c)
            except Exception as e:
                # Log but continue to other accounts
                print(f"Failed to fetch clusters for {acc.provider}: {e}")
                
    return all_clusters
