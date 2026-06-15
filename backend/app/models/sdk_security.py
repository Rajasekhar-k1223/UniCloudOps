from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class ServiceAccount(Base):
    """M2M identity specifically designed for SDK API access"""
    __tablename__ = "sdk_service_accounts"

    id = Column(String(50), primary_key=True, index=True) # e.g. "sa-12345"
    name = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    # We could link this to specific roles/policies in a full RBAC model
    api_keys = relationship("APIKey", back_populates="service_account")

class APIKey(Base):
    """The physical credentials used by the SDKs to sign HMAC requests"""
    __tablename__ = "sdk_api_keys"

    access_key = Column(String(100), primary_key=True, index=True) # e.g. "AKIA..."
    secret_key_hash = Column(String(255)) # We store the hash, never the plaintext secret
    service_account_id = Column(String(50), ForeignKey("sdk_service_accounts.id"))
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True) # Max 90 days usually
    last_used = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    service_account = relationship("ServiceAccount", back_populates="api_keys")
