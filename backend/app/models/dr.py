from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class DRPair(Base):
    __tablename__ = "dr_pairs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    primary_resource_id = Column(String(255), nullable=False)
    primary_provider = Column(String(50), nullable=False)
    primary_region = Column(String(50), nullable=False)
    
    standby_resource_id = Column(String(255), nullable=False)
    standby_provider = Column(String(50), nullable=False)
    standby_region = Column(String(50), nullable=False)
    
    type = Column(String(50), default="Multi-Cloud Mirror") # Multi-Cloud Mirror, Cross-Cloud Storage, etc.
    sync_status = Column(String(50), default="synced")
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project")
