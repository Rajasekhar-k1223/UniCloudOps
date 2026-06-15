from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class BidOffer(Base):
    __tablename__ = "bid_offers"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False) # 'aws', 'azure', 'gcp'
    resource_type = Column(String(100), nullable=False) # 'compute', 'database'
    instance_type = Column(String(100), nullable=False) # 't3.micro', 'e2-micro'
    price = Column(Float, nullable=False) # Current bid price
    status = Column(String(50), default="active") # 'active', 'won', 'lost'
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
