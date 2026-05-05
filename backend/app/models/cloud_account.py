from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class CloudAccount(Base):
    __tablename__ = "cloud_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String(50), nullable=False) # 'aws', 'azure', 'gcp'
    name = Column(String(255), nullable=False) # Friendly name like "Production AWS"
    
    # Encrypted credentials JSON
    encrypted_credentials = Column(Text, nullable=False)
    
    status = Column(String(50), default="pending") # 'active', 'error', 'pending'
    last_sync = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Project Sovereignty
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="cloud_accounts_owner") # Owner of the account
    project = relationship("Project", back_populates="cloud_accounts")
    
    # Authorized mission participants
    from app.models.user import user_account_assoc
    authorized_users = relationship("User", secondary=user_account_assoc, back_populates="accounts")
