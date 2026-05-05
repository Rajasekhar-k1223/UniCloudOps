from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

router = APIRouter(prefix="/serverless", tags=["serverless"])

@router.get("/functions")
def get_all_functions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Aggregate all managed serverless functions (Lambda, Azure Functions, GCF) across the multi-cloud portfolio."""
    accounts = db.query(CloudAccount).filter(CloudAccount.user_id == current_user.id).all()
    
    all_functions = []
    for acc in accounts:
        adapter = get_adapter(acc.provider)
        if adapter:
            try:
                functions = adapter.get_functions(acc)
                for f in functions:
                    f['account_name'] = acc.name
                    f['provider'] = acc.provider
                    all_functions.append(f)
            except Exception as e:
                print(f"Failed to fetch functions for {acc.provider}: {e}")
                
    return all_functions
