from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class SOCIncident(Base):
    """Layer 8: Security Operations Center Incidents"""
    __tablename__ = "security_incidents"

    id = Column(String(50), primary_key=True, index=True) # e.g. "INC-2026-001"
    title = Column(String(200))
    severity = Column(String(20)) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(20), default="OPEN")
    source_layer = Column(String(50)) # e.g. "Layer 7: Runtime Threat Detection"
    mitre_tactic = Column(String(50)) # e.g. "Privilege Escalation"
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class CSPMFinding(Base):
    """Layer 4: Cloud Security Posture Management Findings"""
    __tablename__ = "security_cspm_findings"

    id = Column(Integer, primary_key=True, index=True)
    cloud_account_id = Column(String(50))
    resource_id = Column(String(200))
    rule_id = Column(String(100)) # e.g. "aws-s3-public-read"
    description = Column(Text)
    severity = Column(String(20))
    status = Column(String(20), default="ACTIVE") # ACTIVE, SUPPRESSED, RESOLVED
    detected_at = Column(DateTime(timezone=True), default=func.now())

class VaultSecretMetadata(Base):
    """Layer 2: Secrets & Vault Center - Stores metadata, NOT the actual secret"""
    __tablename__ = "security_vault_metadata"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(200), unique=True, index=True) # e.g. "aws/sts/prod-role"
    description = Column(String(200))
    engine_type = Column(String(50)) # kv, aws, database
    last_rotated = Column(DateTime(timezone=True), default=func.now())
    rotation_schedule = Column(String(50)) # e.g. "30d"

class OPAPolicy(Base):
    """Layer 5: Governance & Policy Engine"""
    __tablename__ = "security_opa_policies"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100))
    rego_code = Column(Text)
    enforcement_mode = Column(String(20)) # AUDIT, ENFORCE
    created_at = Column(DateTime(timezone=True), default=func.now())
