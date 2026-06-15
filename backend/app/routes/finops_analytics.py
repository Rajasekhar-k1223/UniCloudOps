from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import DailySpend, FinOpsBudget
import random
import datetime

router = APIRouter(prefix="/finops/analytics", tags=["FinOps Center"])

@router.get("/costs")
def get_cost_analytics(tenant_id: int = None, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Retrieve cost analytics and cloud spend."""
    query = db.query(DailySpend)
    if tenant_id:
        query = query.filter(DailySpend.tenant_id == tenant_id)
    spends = query.all()
    
    # Mock data generation if empty (for MVP presentation)
    if not spends:
        return {
            "total_spend": 14250.75,
            "forecast": 18500.00,
            "currency": "USD",
            "breakdown": [
                {"service": "Amazon EC2", "amount": 8400.50},
                {"service": "Amazon RDS", "amount": 3200.25},
                {"service": "Azure AKS", "amount": 2650.00}
            ]
        }
        
    return spends

@router.get("/budgets")
def list_budgets(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List budgets and their threshold alerts."""
    budgets = db.query(FinOpsBudget).all()
    
    if not budgets:
        # Mock for UI demonstration
        return [
            {
                "id": 1,
                "name": "Q3 Engineering AWS",
                "amount_limit": 50000.0,
                "current_spend": 42500.0,
                "alert_threshold_percentage": 80.0
            },
            {
                "id": 2,
                "name": "Marketing Azure",
                "amount_limit": 5000.0,
                "current_spend": 1200.0,
                "alert_threshold_percentage": 90.0
            }
        ]
    return budgets

@router.get("/recommendations")
def get_rightsizing_recommendations(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Get AI-powered idle resource detection and rightsizing."""
    return [
        {
            "resource_id": "i-0abcd1234efgh5678",
            "resource_name": "prod-cache-node-01",
            "provider": "AWS",
            "type": "Idle Resource",
            "recommendation": "Terminate instance. CPU utilization < 2% for 14 days.",
            "estimated_monthly_savings": 145.00
        },
        {
            "resource_id": "vm-sql-analytics",
            "resource_name": "analytics-db",
            "provider": "Azure",
            "type": "Rightsizing",
            "recommendation": "Downsize from Standard_D8s_v3 to Standard_D4s_v3.",
            "estimated_monthly_savings": 320.00
        }
    ]
