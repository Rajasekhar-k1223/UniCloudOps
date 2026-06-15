from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(String(50), primary_key=True, index=True) # e.g. "aws-eks-blueprint"
    name = Column(String(100), index=True)
    description = Column(Text)
    category = Column(String(50), index=True) # Terraform, Helm, AI Agent
    publisher = Column(String(100), index=True)
    logo_url = Column(String(255))
    average_rating = Column(Float, default=0.0)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    versions = relationship("ItemVersion", back_populates="item", cascade="all, delete")
    reviews = relationship("ItemReview", back_populates="item", cascade="all, delete")

class ItemVersion(Base):
    __tablename__ = "marketplace_item_versions"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(50), ForeignKey("marketplace_items.id"))
    version_string = Column(String(20), index=True) # e.g. "v1.0.0"
    status = Column(String(20), default="Pending") # Draft, Pending, Published, Rejected
    asset_url = Column(String(500)) # URL to Git or S3
    digital_signature = Column(String(255)) # SHA256 of asset payload/metadata
    changelog = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    item = relationship("MarketplaceItem", back_populates="versions")

class ItemDependency(Base):
    __tablename__ = "marketplace_item_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    parent_item_id = Column(String(50), ForeignKey("marketplace_items.id"))
    dependent_item_id = Column(String(50), ForeignKey("marketplace_items.id"))
    version_constraint = Column(String(50)) # e.g. ">= 1.2.0"

class ItemReview(Base):
    __tablename__ = "marketplace_reviews"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(50), ForeignKey("marketplace_items.id"))
    user_id = Column(String(50), index=True)
    rating = Column(Integer) # 1-5
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    item = relationship("MarketplaceItem", back_populates="reviews")
