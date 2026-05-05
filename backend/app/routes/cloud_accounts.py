from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.cloud_account import CloudAccount
from app.models.user import User
from app.schemas.cloud_account import CloudAccountCreate, CloudAccountResponse
from app.api.deps import get_current_user
from app.core.crypto import encrypt_credentials

router = APIRouter(prefix="/cloud-accounts", tags=["cloud_accounts"])

@router.get("/schemas")
def get_credential_schemas(current_user: User = Depends(get_current_user)):
    """Return required credential fields for all 10 providers in a UI-ready format."""
    from app.api.adapters import list_adapters
    
    def format_label(field_id: str) -> str:
        return field_id.replace('_', ' ').title()

    all_schemas = {}
    for adapter in list_adapters():
        raw_schema = adapter.get_credential_schema()
        formatted = []
        for fid, ftype in raw_schema.items():
            formatted.append({
                "id": fid,
                "name": format_label(fid),
                "type": ftype,
                "placeholder": f"Enter {format_label(fid)}..."
            })
        all_schemas[adapter.provider_id] = formatted
    return all_schemas

@router.post("/", response_model=CloudAccountResponse)
def add_cloud_account(account_in: CloudAccountCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Add a new cloud account (AWS, Azure, GCP)."""
    # Simply encrypt the raw payload of credentials.
    encrypted = encrypt_credentials(account_in.credentials)
    
    db_account = CloudAccount(
        user_id=current_user.id,
        provider=account_in.provider,
        name=account_in.name,
        encrypted_credentials=encrypted
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    # Trigger an initial sync in the background
    try:
        from app.tasks.sync_tasks import sync_cloud_resources
        sync_cloud_resources.delay(db_account.id)
    except Exception as e:
        print(f"Warning: Could not trigger initial sync: {e}")
        
    return db_account

@router.get("/", response_model=List[CloudAccountResponse])
def get_cloud_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all cloud accounts for current user."""
    accounts = db.query(CloudAccount).filter(CloudAccount.user_id == current_user.id).all()
    return accounts

@router.delete("/{account_id}")
def delete_cloud_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a cloud account."""
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id, CloudAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return {"ok": True}
@router.post("/{account_id}/sync")
def sync_cloud_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Manually trigger a sync for a specific cloud account."""
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id, CloudAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    from app.tasks.sync_tasks import sync_cloud_resources
    sync_cloud_resources.delay(account.id)
    return {"status": "sync_triggered"}
