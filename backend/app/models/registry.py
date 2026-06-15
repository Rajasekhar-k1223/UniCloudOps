from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class RegistryAsset(Base):
    __tablename__ = "registry_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False) # 'Code', 'Container', 'Policy', 'Blueprint'
    version = Column(String(50), nullable=False)
    signature = Column(String(255), nullable=False)
    status = Column(String(50), default="unverified") # 'verified', 'unverified'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
