from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Financial Guardrails
    budget_limit = Column(Float, default=100.0) # Hard monthly limit in USD
    current_spend_mtd = Column(Float, default=0.0) # Current Month-To-Date spend
    alert_threshold = Column(Float, default=0.8) # Alert owners at 80% usage
    last_budget_alert_sent_at = Column(DateTime, nullable=True) # Anti-fatigue timestamp
    webhook_url = Column(String(500), nullable=True) # External integration (Slack/Teams)
    notify_on_lifecycle = Column(Boolean, default=True) # Broadcast lifecycle events
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="project")
    cloud_accounts = relationship("CloudAccount", back_populates="project")
