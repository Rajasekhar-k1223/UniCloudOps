from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.db.session import Base

class EventAuditLog(Base):
    """Tracks the cryptographic validation status of events crossing the fabric."""
    __tablename__ = "event_security_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_uuid = Column(String(50), index=True, unique=True)
    source_system = Column(String(50)) # e.g. "Healthcare Platform"
    destination_subject = Column(String(100)) # e.g. "unicloud.telemetry.metrics"
    signature_valid = Column(Boolean)
    is_replayed = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), default=func.now())

class EventThreatAlert(Base):
    """Generated when the Controller detects spoofed or replayed events."""
    __tablename__ = "event_security_threat_alerts"

    id = Column(String(50), primary_key=True, index=True) # e.g. "EVT-ALERT-001"
    threat_type = Column(String(50)) # e.g. "REPLAY_ATTACK", "INVALID_SIGNATURE"
    severity = Column(String(20)) # CRITICAL, HIGH, MEDIUM
    event_uuid = Column(String(50))
    raw_payload_dump = Column(Text) # The intercepted bad payload for forensics
    detected_at = Column(DateTime(timezone=True), default=func.now())
