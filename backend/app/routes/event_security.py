from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_admin
from app.models.event_security import EventAuditLog, EventThreatAlert
import uuid
import json
from app.core.event_crypto import event_crypto_controller

router = APIRouter(prefix="/event-security", tags=["Event Fabric Security"])

@router.get("/threats")
def get_recent_threats(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch recent Event Fabric threats (e.g. Replay Attacks)."""
    # MVP Mock Data - In reality, querying EventThreatAlert table
    return [
        {
            "id": "EVT-ALERT-101",
            "threat_type": "REPLAY_ATTACK",
            "severity": "CRITICAL",
            "event_uuid": "e830b561-2abc-4f90-8d9e-1234567890ab",
            "detected_at": "2026-06-06T14:15:00Z"
        },
        {
            "id": "EVT-ALERT-102",
            "threat_type": "INVALID_SIGNATURE",
            "severity": "HIGH",
            "event_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "detected_at": "2026-06-06T13:42:11Z"
        }
    ]

@router.get("/audit-logs")
def get_event_audit_logs(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch cryptographically verified event logs."""
    # MVP Mock Data - In reality, querying EventAuditLog table
    return [
        {
            "event_uuid": "9999b561-2abc-4f90-8d9e-111111111111",
            "source_system": "Healthcare Platform",
            "destination_subject": "unicloud.patients.telemetry",
            "signature_valid": True,
            "is_replayed": False,
            "timestamp": "2026-06-06T14:10:00Z"
        },
        {
            "event_uuid": "8888b561-2abc-4f90-8d9e-222222222222",
            "source_system": "SentinelX",
            "destination_subject": "unicloud.security.incidents",
            "signature_valid": True,
            "is_replayed": False,
            "timestamp": "2026-06-06T14:11:00Z"
        }
    ]

@router.post("/test-crypto")
def test_event_crypto(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Utility endpoint to demonstrate payload encryption and signing flow."""
    dummy_payload = {"patient_id": "P-101", "heart_rate": 88, "status": "Stable"}
    event_uuid = str(uuid.uuid4())
    
    # 1. Package it (Encrypt & Sign)
    envelope = event_crypto_controller.package_event("patient_telemetry", dummy_payload, event_uuid)
    
    # 2. Unpackage it (Verify & Decrypt)
    try:
        decrypted_payload = event_crypto_controller.unpackage_event(envelope)
        verification_status = "SUCCESS"
    except Exception as e:
        decrypted_payload = None
        verification_status = f"FAILED: {str(e)}"
        
    return {
        "original_payload": dummy_payload,
        "secured_envelope": envelope,
        "decrypted_payload": decrypted_payload,
        "verification_status": verification_status
    }
