from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# Association table for User <-> CloudAccount permissions
user_account_assoc = Table(
    "user_account_assoc",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("account_id", Integer, ForeignKey("cloud_accounts.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # RBAC & Sovereignty
    role = Column(String(50), default="VIEWER") # 'ADMIN', 'OPERATOR', 'VIEWER'
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    project = relationship("Project", back_populates="users")
    # Mission boundaries: Specific accounts this user can access
    accounts = relationship("CloudAccount", secondary=user_account_assoc, back_populates="authorized_users")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
