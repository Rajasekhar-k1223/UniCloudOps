from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.enterprise_evolution import APIKey, KeycloakMapping
import secrets
import hashlib
import datetime

router = APIRouter(prefix="/iam", tags=["IAM"])

@router.get("/apikeys")
def get_api_keys(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List API keys for the current user."""
    keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
    return keys

@router.post("/apikeys")
def create_api_key(name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new API key."""
    raw_key = secrets.token_urlsafe(32)
    prefix = raw_key[:8]
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    
    db_key = APIKey(
        name=name,
        prefix=prefix,
        hashed_key=hashed_key,
        user_id=current_user.id,
        is_active=True
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    return {
        "id": db_key.id,
        "name": db_key.name,
        "api_key": raw_key, # Only shown once!
        "prefix": prefix,
        "created_at": db_key.created_at
    }

@router.delete("/apikeys/{key_id}")
def delete_api_key(key_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete/Revoke an API key."""
    key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.user_id == current_user.id).first()
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
    db.delete(key)
    db.commit()
    return {"message": "API key revoked successfully."}

@router.get("/sso/mappings")
def get_sso_mappings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get Keycloak/SSO mappings for the current user."""
    mapping = db.query(KeycloakMapping).filter(KeycloakMapping.user_id == current_user.id).first()
    return mapping

