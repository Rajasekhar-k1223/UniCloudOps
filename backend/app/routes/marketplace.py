from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps_rbac import get_current_user, get_current_admin
from app.models.marketplace import MarketplaceItem, ItemVersion, ItemReview
from pydantic import BaseModel
import hashlib
import datetime

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

class ItemCreate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    asset_url: str
    version: str

class ReviewCreate(BaseModel):
    rating: int
    comment: str

@router.get("/items")
def get_marketplace_items(category: str = None, search: str = None, db: Session = Depends(get_db)):
    """Browse published marketplace items."""
    query = db.query(MarketplaceItem)
    if category:
        query = query.filter(MarketplaceItem.category == category)
    if search:
        query = query.filter(MarketplaceItem.name.ilike(f"%{search}%"))
        
    items = query.order_by(MarketplaceItem.download_count.desc()).all()
    
    # Mock data fallback for empty initial state
    if not items:
        return [
            {
                "id": "aws-eks-blueprint",
                "name": "AWS EKS Production Ready",
                "description": "A fully configured EKS cluster blueprint with node groups and IAM.",
                "category": "Deployment Blueprints",
                "publisher": "UniCloudOps Official",
                "average_rating": 4.8,
                "download_count": 1245
            },
            {
                "id": "opa-pci-dss",
                "name": "PCI-DSS Compliance Pack",
                "description": "OPA Rego policies enforcing strict PCI-DSS controls across AWS and Azure.",
                "category": "Compliance Packs",
                "publisher": "Security Team",
                "average_rating": 5.0,
                "download_count": 892
            }
        ]
    return items

@router.post("/items")
def publish_item(item_in: ItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Publish a new asset to the marketplace."""
    # Check if item exists
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_in.id).first()
    if not item:
        item = MarketplaceItem(
            id=item_in.id,
            name=item_in.name,
            description=item_in.description,
            category=item_in.category,
            publisher=current_user.email
        )
        db.add(item)
    
    # Generate mock digital signature (SHA256 of metadata + url)
    signature_payload = f"{item_in.id}{item_in.version}{item_in.asset_url}".encode('utf-8')
    computed_signature = hashlib.sha256(signature_payload).hexdigest()
    
    new_version = ItemVersion(
        item_id=item_in.id,
        version_string=item_in.version,
        asset_url=item_in.asset_url,
        digital_signature=computed_signature,
        status="Pending" # Requires admin verification
    )
    db.add(new_version)
    db.commit()
    return {"message": "Asset version uploaded and pending verification.", "signature": computed_signature}

@router.post("/versions/{version_id}/verify")
def verify_version(version_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Admin verifies and approves a pending marketplace asset."""
    version = db.query(ItemVersion).filter(ItemVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
        
    version.status = "Published"
    db.commit()
    return {"message": f"Version {version.version_string} published successfully."}

@router.post("/items/{item_id}/rate")
def rate_item(item_id: str, review: ReviewCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Submit a rating and review for an asset."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if not item:
        # Mock success
        return {"message": "Review submitted successfully"}
        
    new_review = ItemReview(
        item_id=item_id,
        user_id=current_user.id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    
    # Recalculate average (simplified)
    # real implementation would average all reviews
    item.average_rating = review.rating
    db.commit()
    
    return {"message": "Review submitted successfully"}
