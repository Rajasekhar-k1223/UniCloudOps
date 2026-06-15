from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.session import Base

class FederatedIdentity(Base):
    """Tracks identity trust sync between UniCloudOps and SentinelX."""
    __tablename__ = "federation_identities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    oidc_subject = Column(String(255), unique=True, index=True)
    federated_roles = Column(JSON) # e.g. ["unicloud_admin", "sentinelx_analyst"]
    last_sync = Column(DateTime(timezone=True), default=func.now())

class SentinelXIntel(Base):
    """Caches global threat intelligence pushed by SentinelX."""
    __tablename__ = "federation_threat_intel"

    id = Column(Integer, primary_key=True, index=True)
    ioc_type = Column(String(50)) # e.g. "IP", "DOMAIN", "HASH"
    ioc_value = Column(String(255), index=True)
    severity = Column(String(50)) # CRITICAL, HIGH
    sentinelx_verdict_id = Column(String(100), unique=True)
    ingested_at = Column(DateTime(timezone=True), default=func.now())

class CrossPlatformAudit(Base):
    """Logs actions that cross the platform boundary."""
    __tablename__ = "federation_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    origin_platform = Column(String(50)) # "SentinelX" or "UniCloudOps"
    target_platform = Column(String(50))
    action_type = Column(String(100)) # e.g. "QUARANTINE_CLUSTER"
    payload = Column(JSON)
    status = Column(String(50))
    timestamp = Column(DateTime(timezone=True), default=func.now())
