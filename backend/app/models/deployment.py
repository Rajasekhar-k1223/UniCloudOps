from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

from app.models.template import Template

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    cloud_account_id = Column(Integer, ForeignKey("cloud_accounts.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    variables = Column(JSON, nullable=True) # Input variables for the mission (CPU, RAM, AMI, etc.)
    status = Column(String(50), default="pending") # pending, running, success, failed
    logs = Column(Text, nullable=True) # Full execution output
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="deployments")
    template = relationship("Template", backref="deployments")
    cloud_account = relationship("CloudAccount")
    project = relationship("Project", backref="deployments")
