from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import SecureSecret
import secrets
import datetime
import base64

router = APIRouter(prefix="/vault/secrets", tags=["Secrets Vault"])

# Note: In a true production app we'd use HashiCorp Vault APIs or KMS.
# We are doing AES-GCM simulation via simple base64 for MVP demonstration.

def encrypt_mock(val: str) -> str:
    return base64.b64encode(f"ENCRYPTED_{val}".encode()).decode()

def decrypt_mock(val: str) -> str:
    dec = base64.b64decode(val).decode()
    return dec.replace("ENCRYPTED_", "")

@router.get("/")
def list_secrets(project_id: int = None, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List stored secrets (metadata only)."""
    query = db.query(SecureSecret)
    if project_id:
        query = query.filter(SecureSecret.project_id == project_id)
    secrets = query.all()
    # Mask payload
    return [
        {
            "id": s.id,
            "secret_path": s.secret_path,
            "last_rotated_at": s.last_rotated_at,
            "created_at": s.created_at
        } for s in secrets
    ]

@router.post("/")
def create_secret(secret_path: str, payload: str, project_id: int = None, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Store a new secure secret."""
    existing = db.query(SecureSecret).filter(SecureSecret.secret_path == secret_path).first()
    if existing:
        raise HTTPException(status_code=400, detail="Secret path already exists")
        
    new_secret = SecureSecret(
        secret_path=secret_path,
        encrypted_payload=encrypt_mock(payload),
        project_id=project_id,
        kms_key_arn="arn:aws:kms:us-east-1:123456789:key/mock-kms-key"
    )
    db.add(new_secret)
    db.commit()
    return {"message": "Secret stored securely."}

@router.get("/{secret_id}")
def read_secret(secret_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Read a decrypted secret."""
    s = db.query(SecureSecret).filter(SecureSecret.id == secret_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Secret not found")
        
    return {
        "secret_path": s.secret_path,
        "payload": decrypt_mock(s.encrypted_payload)
    }

@router.post("/{secret_id}/rotate")
def rotate_secret(secret_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Auto-rotate a dynamic secret."""
    s = db.query(SecureSecret).filter(SecureSecret.id == secret_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Secret not found")
        
    new_value = secrets.token_hex(32)
    s.encrypted_payload = encrypt_mock(new_value)
    s.last_rotated_at = datetime.datetime.utcnow()
    db.commit()
    
    return {"message": "Secret rotated successfully.", "new_payload": new_value}
