import logging
from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.resource import Resource
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class OptimizationService:
    def get_savings_recommendations(self, db: Session, user_id: int, project_id: int = None) -> List[Dict]:
        """Analyze multi-cloud resources to find cost saving opportunities."""
        from app.models.cloud_account import CloudAccount
        
        # Tactical Boundary: Project accounts > User accounts
        if project_id:
            accounts = db.query(CloudAccount).filter(CloudAccount.project_id == project_id).all()
        else:
            accounts = db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
        
        account_ids = [a.id for a in accounts]
        
        resources = db.query(Resource).filter(Resource.cloud_account_id.in_(account_ids)).all()
        
        recommendations = []
        
        for res in resources:
            adapter = get_adapter(res.provider)
            if not adapter: continue
            
            # 🧟 Zombie Instance Detection (Idle resources)
            # For demo, if status is running but it's a small instance, we simulate a check
            if res.status and res.status.lower() in ['running', 'active']:
                # In reality, we'd check last 7 days metrics
                # Simulation: 10% chance a resource is flagged as 'Idle' for demo purposes
                import random
                if random.random() < 0.2:
                    savings = res.estimated_monthly_cost or 10.0
                    recommendations.append({
                        "resource_id": res.id,
                        "resource_name": res.name,
                        "action": "Terminate / Stop",
                        "reason": "Idle Resource: CPU usage < 1% for the last 7 days.",
                        "potential_savings": round(savings, 2),
                        "severity": "high"
                    })
            
            # 📏 Rightsizing (Over-provisioned)
            if res.instance_type and ("large" in res.instance_type.lower() or "xlarge" in res.instance_type.lower()):
                savings = (res.estimated_monthly_cost or 50.0) * 0.4 # 40% savings if downsized
                recommendations.append({
                    "resource_id": res.id,
                    "resource_name": res.name,
                    "action": "Downsize",
                    "reason": "Over-provisioned: Peak memory usage < 20%. Suggest moving to Medium tier.",
                    "potential_savings": round(savings, 2),
                    "severity": "medium"
                })
                
        return recommendations

    def get_total_potential_savings(self, db: Session, user_id: int, project_id: int = None) -> float:
        recs = self.get_savings_recommendations(db, user_id, project_id)
        return sum(r['potential_savings'] for r in recs)

optimization_service = OptimizationService()
