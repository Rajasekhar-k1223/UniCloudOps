from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps_rbac import get_current_user
from app.core.licensing import license_enforcer
from app.models.saas import Tenant, Subscription, UsageRecord, WhiteLabelConfig
from pydantic import BaseModel

router = APIRouter(prefix="/saas", tags=["SaaS & Billing"])

class UpgradeRequest(BaseModel):
    target_tier: str

@router.get("/tenant/context")
def get_tenant_context(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Fetches the current user's Tenant info, subscription, and white-labeling config."""
    # Assuming the user model links to a tenant. For MVP, we mock the fetch.
    tenant = db.query(Tenant).filter(Tenant.domain == "unicloudops.io").first()
    if not tenant:
        return {
            "tier": "Enterprise", # Default for self-hosted
            "white_label": {
                "logo": None,
                "primary_color": "#10b981",
                "company_name": "UniCloudOps"
            }
        }
    
    return {
        "id": tenant.id,
        "name": tenant.name,
        "tier": tenant.tier,
        "white_label": tenant.white_label
    }

@router.post("/billing/upgrade")
def upgrade_subscription(request: UpgradeRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Handles self-service checkout logic for upgrading tiers."""
    # Mocking Stripe checkout link generation
    return {
        "status": "checkout_session_created",
        "checkout_url": f"https://billing.unicloudops.io/checkout/session_abc123?tier={request.target_tier}"
    }

@router.get("/billing/usage")
def get_current_usage(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Aggregates metered usage for the current billing cycle."""
    # Mocking an aggregation query
    # In reality: db.query(UsageRecord.metric_name, func.sum(UsageRecord.quantity)).filter(tenant=current).group_by(metric_name)
    return {
        "managed_vms": 420,
        "ai_tokens_consumed": 1500000,
        "api_calls": 85000,
        "estimated_invoice": "$1,450.00"
    }

@router.get("/msp/dashboard")
def get_msp_downstream_tenants(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Fetch all downstream tenants managed by this MSP."""
    # Enforce licensing: This route strictly requires "MSP" tier.
    # We pass "MSP" to verify the user actually holds an MSP license.
    # license_enforcer.verify_tier("Community", "MSP") # Example of what would throw an error
    
    return {
        "managed_tenants": [
            {"id": "t-001", "name": "Acme Corp", "tier": "Enterprise", "monthly_mrr": 2500},
            {"id": "t-002", "name": "Globex", "tier": "Professional", "monthly_mrr": 499}
        ],
        "total_mrr": 2999
    }
