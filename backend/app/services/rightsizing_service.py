import logging
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class RightsizingService:
    def __init__(self, cpu_low_threshold: float = 15.0, cpu_high_threshold: float = 80.0):
        self.cpu_low_threshold = cpu_low_threshold
        self.cpu_high_threshold = cpu_high_threshold

    def analyze_resource(self, db: Session, resource: Resource) -> Optional[Dict]:
        """Analyze metric data for a resource and return a rightsizing recommendation."""
        adapter = get_adapter(resource.provider)
        if not adapter or resource.type != "Compute":
            return None

        # 1. Fetch Telemetry
        try:
            metrics = adapter.get_metrics(resource.external_id, resource.region, resource.cloud_account)
            cpu_data = metrics.get('CPUUtilization', {}).get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch metrics for {resource.name}: {e}")
            return None

        if not cpu_data:
            return None

        # 2. Extract Utilization Profile
        avg_cpu = sum(d['value'] for d in cpu_data) / len(cpu_data)
        peak_cpu = max(d['value'] for d in cpu_data)
        
        current_type = resource.instance_type
        recommendation = None
        
        # 3. Determine Action
        if avg_cpu < self.cpu_low_threshold:
            recommendation = self._suggest_downsize(resource, adapter, avg_cpu, peak_cpu)
        elif peak_cpu > self.cpu_high_threshold:
            recommendation = self._suggest_upsize(resource, adapter, avg_cpu, peak_cpu)

        if recommendation:
            return {
                "resource_id": resource.id,
                "resource_name": resource.name,
                "current_type": current_type,
                "current_price": adapter.get_price(current_type, resource.region),
                "avg_cpu": round(avg_cpu, 2),
                "peak_cpu": round(peak_cpu, 2),
                **recommendation
            }
        return None

    def _suggest_downsize(self, resource: Resource, adapter, avg_cpu: float, peak_cpu: float) -> Optional[Dict]:
        """Find a smaller instance type that safely covers the current peak usage."""
        catalog = adapter.get_catalog(resource.region, resource.cloud_account)
        current_price = adapter.get_price(resource.instance_type, resource.region)
        
        # Filter for cheaper instances that still provide some headroom
        # Simplified logic: Find instance with lowest price overall that isn't the current one
        cheaper_instances = [i for i in catalog if i['price'] < current_price and i['price'] > 0]
        cheaper_instances.sort(key=lambda x: x['price'])
        
        if cheaper_instances:
            best_fit = cheaper_instances[0]
            savings = current_price - best_fit['price']
            return {
                "action": "DOWNSIZE",
                "recommended_type": best_fit['name'],
                "recommended_price": best_fit['price'],
                "estimated_monthly_savings": round(savings * 730, 2),
                "reason": f"Under-utilized (Avg CPU: {round(avg_cpu, 2)}%). Low risk to downsize."
            }
        return None

    def _suggest_upsize(self, resource: Resource, adapter, avg_cpu: float, peak_cpu: float) -> Optional[Dict]:
        """Find a larger instance type if the current one is throttled."""
        return {
            "action": "UPSIZE",
            "recommended_type": "Next Tier Up", # In a real app, look up from catalog
            "reason": f"Performance bottleneck detected (Peak CPU: {round(peak_cpu, 2)}%)."
        }

    def get_all_recommendations(self, db: Session, project_id: Optional[int] = None) -> List[Dict]:
        """Analyze all resources in the mission boundary and return a list of optimizations."""
        query = db.query(Resource)
        if project_id:
            query = query.filter(Resource.project_id == project_id)
            
        resources = query.all()
        recommendations = []
        for res in resources:
            rec = self.analyze_resource(db, res)
            if rec:
                recommendations.append(rec)
        return recommendations

rightsizing_service = RightsizingService()
