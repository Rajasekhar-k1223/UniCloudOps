from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_admin
from app.models.sdk_security import ServiceAccount, APIKey
import secrets
import hashlib
from datetime import datetime, timedelta

router = APIRouter(prefix="/sdk-auth", tags=["SDK Security Framework"])

def _generate_api_keys():
    """Generates a secure Access Key and Secret Key pair."""
    # Prefix helps in identifying key types quickly (e.g., GitHub's ghp_)
    access_key = "UCO_" + secrets.token_hex(16)
    secret_key = secrets.token_urlsafe(64)
    return access_key, secret_key

@router.post("/service-accounts")
def create_service_account(name: str, description: str = None, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Create a new M2M Service Account for SDK integrations."""
    sa_id = "sa-" + secrets.token_hex(8)
    new_sa = ServiceAccount(id=sa_id, name=name, description=description)
    db.add(new_sa)
    db.commit()
    db.refresh(new_sa)
    return {"message": "Service Account created.", "sa_id": new_sa.id}

@router.post("/keys/provision")
def provision_api_key(service_account_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Generates a new AccessKey/SecretKey pair for a Service Account."""
    sa = db.query(ServiceAccount).filter(ServiceAccount.id == service_account_id).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Service Account not found.")

    access_key, secret_key = _generate_api_keys()
    
    # In production, we hash the secret_key before storing it.
    secret_key_hash = hashlib.sha256(secret_key.encode()).hexdigest()
    
    # Keys expire automatically in 90 days
    expiration = datetime.utcnow() + timedelta(days=90)
    
    new_key = APIKey(
        access_key=access_key,
        secret_key_hash=secret_key_hash,
        service_account_id=sa.id,
        expires_at=expiration
    )
    db.add(new_key)
    db.commit()

    # The Secret Key is returned exactly ONCE.
    return {
        "message": "Key provisioned successfully. Store the Secret Key immediately. It will not be shown again.",
        "access_key": access_key,
        "secret_key": secret_key,
        "expires_at": expiration
    }

@router.post("/keys/rotate")
def rotate_api_key(service_account_id: str, old_access_key: str, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """
    CI/CD friendly key rotation endpoint. 
    Revokes the old key and instantly issues a new one.
    """
    old_key_record = db.query(APIKey).filter(APIKey.access_key == old_access_key, APIKey.service_account_id == service_account_id).first()
    if not old_key_record:
        raise HTTPException(status_code=404, detail="Old API Key not found for this Service Account.")
        
    old_key_record.is_active = False
    
    # Provision new pair
    access_key, secret_key = _generate_api_keys()
    secret_key_hash = hashlib.sha256(secret_key.encode()).hexdigest()
    expiration = datetime.utcnow() + timedelta(days=90)
    
    new_key = APIKey(
        access_key=access_key,
        secret_key_hash=secret_key_hash,
        service_account_id=service_account_id,
        expires_at=expiration
    )
    db.add(new_key)
    db.commit()
    
    return {
        "message": "Key rotated. Old key revoked.",
        "new_access_key": access_key,
        "new_secret_key": secret_key
    }
