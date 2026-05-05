from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    action = Column(String(50), nullable=False, index=True) # e.g., AUTH_LOGIN, MISSION_LAUNCH, BUDGET_UPDATE
    resource_type = Column(String(50), nullable=True) # e.g., deployment, project, cloud_account
    resource_id = Column(String(100), nullable=True)
    
    status = Column(String(20), default="success") # success, failure
    message = Column(Text, nullable=True) # Human readable summary
    metadata_json = Column(JSON, nullable=True) # Detailed payload or diff
    
    ip_address = Column(String(45), nullable=True)
    integrity_hash = Column(String(128), nullable=True) # SHA-512 chain of previous log entry
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="audit_logs")
    project = relationship("Project", backref="audit_logs")
