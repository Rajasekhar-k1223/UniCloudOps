from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class SecurityGraphNode(Base):
    """Stores nodes for the topology graph (Users, Roles, Resources, Findings)"""
    __tablename__ = "fabric_graph_nodes"

    id = Column(String(100), primary_key=True, index=True) # e.g. "user-alice", "role-admin", "res-s3-123"
    node_type = Column(String(50)) # USER, IAM_ROLE, CLOUD_RESOURCE, INCIDENT
    label = Column(String(200))
    properties = Column(JSON) # Additional context

class RiskScore(Base):
    """Dynamic risk scoring for entities"""
    __tablename__ = "fabric_risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String(100), index=True) # Links to SecurityGraphNode.id
    entity_type = Column(String(50))
    current_score = Column(Float, default=0.0) # 0 to 100
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    last_calculated = Column(DateTime(timezone=True), default=func.now())
    contributing_factors = Column(JSON) # e.g. ["Failed Login", "Public S3 Bucket"]

class ThreatIntelFeed(Base):
    """External threat intelligence data (CVEs, Malicious IPs)"""
    __tablename__ = "fabric_threat_intel"

    id = Column(Integer, primary_key=True, index=True)
    indicator_value = Column(String(255), unique=True, index=True) # e.g. "192.168.1.100" or "CVE-2026-1234"
    indicator_type = Column(String(50)) # IP, HASH, DOMAIN, CVE
    severity = Column(String(20))
    source = Column(String(100)) # e.g. "AlienVault OTX", "Wazuh"
    description = Column(Text)
    first_seen = Column(DateTime(timezone=True), default=func.now())
