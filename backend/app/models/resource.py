from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Resource(Base):
    __tablename__ = "resources"
    __table_args__ = (UniqueConstraint('cloud_account_id', 'external_id', name='_account_external_uc'),)

    id = Column(Integer, primary_key=True, index=True)
    cloud_account_id = Column(Integer, ForeignKey("cloud_accounts.id"), nullable=False)
    
    cloud_account = relationship("CloudAccount")
    
    # Provider-specific ID (e.g. i-12345678, arn:aws:s3:::my-bucket)
    external_id = Column(String(255), nullable=False, index=True)
    aws_account_id = Column(String(50), nullable=True) # The real AWS Account ID
    name = Column(String(255), nullable=True)
    provider = Column(String(50), nullable=False) # 'aws', 'azure', 'gcp'
    type = Column(String(50), nullable=False) # 'Compute', 'Storage', 'Database'
    instance_type = Column(String(50), nullable=True) # e.g. t2.medium
    os_type = Column(String(50), nullable=True) # e.g. Linux, Windows
    status = Column(String(50), nullable=True) # 'running', 'active', etc.
    region = Column(String(50), nullable=True)
    
    public_ip = Column(String(50), nullable=True)
    private_ip = Column(String(50), nullable=True)
    launch_time = Column(String(100), nullable=True)
    
    # Store full AWS JSON metadata for detailed views (Security, Networking, etc.)
    cloud_metadata = Column(JSON, nullable=True)
    estimated_monthly_cost = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
