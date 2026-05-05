from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class CompliancePolicy(Base):
    __tablename__ = "compliance_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    provider = Column(String(50), nullable=True) # 'all', 'aws', 'azure', etc
    category = Column(String(100), default="security") # 'security', 'cost', 'governance'
    severity = Column(String(50), default="medium") # 'low', 'medium', 'high', 'critical'
    
    # Internal code for the check
    check_id = Column(String(100), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("compliance_policies.id", ondelete="CASCADE"))
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"))
    
    status = Column(String(50), nullable=False) # 'pass', 'fail', 'error'
    message = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True) # Specific details about the violation
    
    last_scanned = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    policy = relationship("CompliancePolicy")
    resource = relationship("Resource", backref="compliance_results")
