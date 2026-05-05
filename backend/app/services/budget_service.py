import logging
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.models.resource import Resource
from app.models.cloud_account import CloudAccount
from app.services.audit_service import audit_logger

logger = logging.getLogger(__name__)

class BudgetService:
    def __init__(self):
        # Simulated tactical budget registry
        # In a real app, this would be a DB model 'Budget'
        self.budgets = {} # {account_id: {"limit": float, "is_kill_switch_active": bool}}

    def set_budget(self, account_id: int, limit: float, kill_switch: bool):
        self.budgets[account_id] = {
            "limit": limit,
            "is_kill_switch_active": kill_switch
        }
        return {"status": "success", "message": f"Budget tactical threshold set to {limit} for account {account_id}."}

    def check_budgets(self, db: Session, user_id: int):
        """Analyze current spending across the mission boundary and apply safeguards."""
        accounts = db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
        results = []
        
        for acc in accounts:
            current_spend = db.query(Resource).filter(
                Resource.cloud_account_id == acc.id
            ).all()
            total_cost = sum(r.estimated_monthly_cost for r in current_spend if r.estimated_monthly_cost)
            
            budget_config = self.budgets.get(acc.id, {"limit": 1000.0, "is_kill_switch_active": False})
            
            status = "nominal"
            if total_cost > budget_config['limit']:
                status = "critical"
                if budget_config['is_kill_switch_active']:
                    # Trigger simulated Kill-Switch
                    self.trigger_kill_switch(db, acc, total_cost, budget_config['limit'])
                    status = "kill_switch_triggered"
                else:
                    audit_logger.record_action(
                        db, "BUDGET_ALARM", user_id=user_id, 
                        message=f"Budget exceeded for {acc.name}: {total_cost} > {budget_config['limit']}"
                    )
            
            results.append({
                "account_id": acc.id,
                "account_name": acc.name,
                "spend": total_cost,
                "limit": budget_config['limit'],
                "status": status
            })
            
        return results

    def trigger_kill_switch(self, db: Session, account: CloudAccount, actual: float, limit: float):
        """Execute autonomous mission containment to prevent cost overflows."""
        logger.warning(f"KILL-SWITCH TRIGGERED for {account.name}. {actual} > {limit}")
        
        # Simulation: Stop non-essential resources
        resources = db.query(Resource).filter(
            Resource.cloud_account_id == account.id,
            Resource.status == 'running'
        ).limit(5).all()
        
        for r in resources:
            r.status = 'stopped'
            audit_logger.record_action(
                db, "KILL_SWITCH_STOP", 
                resource_type="Compute", resource_id=r.id, 
                message=f"Autonomous containment: Stopped {r.name} due to budget breach."
            )
        
        db.commit()

budget_service = BudgetService()
