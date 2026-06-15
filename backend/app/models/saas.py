from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Tenant(Base):
    """Represents a SaaS Customer or an MSP Client"""
    __tablename__ = "saas_tenants"

    id = Column(String(50), primary_key=True, index=True) # e.g. "tenant-abc"
    name = Column(String(100), index=True)
    domain = Column(String(100), unique=True, index=True)
    tier = Column(String(20), default="Community") # Community, Professional, Enterprise, MSP
    is_msp_child = Column(Boolean, default=False)
    parent_msp_id = Column(String(50), ForeignKey("saas_tenants.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    subscription = relationship("Subscription", back_populates="tenant", uselist=False)
    usage_records = relationship("UsageRecord", back_populates="tenant")
    white_label = relationship("WhiteLabelConfig", back_populates="tenant", uselist=False)

class Subscription(Base):
    __tablename__ = "saas_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("saas_tenants.id"), unique=True)
    status = Column(String(20), default="Active") # Active, Past_Due, Canceled, Trial
    billing_cycle = Column(String(20), default="Monthly")
    current_period_end = Column(DateTime(timezone=True))
    stripe_customer_id = Column(String(100), nullable=True)
    
    tenant = relationship("Tenant", back_populates="subscription")

class UsageRecord(Base):
    """Metered billing events for true SaaS economics"""
    __tablename__ = "saas_usage_records"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("saas_tenants.id"))
    metric_name = Column(String(50)) # e.g. "managed_vms", "ai_tokens", "api_calls"
    quantity = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), default=func.now())

    tenant = relationship("Tenant", back_populates="usage_records")

class WhiteLabelConfig(Base):
    """Custom branding for MSPs and Enterprise clients"""
    __tablename__ = "saas_whitelabel"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("saas_tenants.id"), unique=True)
    company_name = Column(String(100))
    logo_url = Column(String(255), nullable=True)
    primary_color = Column(String(20), default="#10b981") # Hex code
    support_email = Column(String(100), nullable=True)
    
    tenant = relationship("Tenant", back_populates="white_label")
