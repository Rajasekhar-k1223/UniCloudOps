import logging
from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.resource import Resource
from app.api.adapters import get_adapter
from app.models.notification import Notification

logger = logging.getLogger(__name__)

class RemediationService:
    def execute_mission(self, db: Session, resource_id: int, policy_name: str) -> Dict:
        """Execute a tactical remediation mission to fix a security gap."""
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return {"status": "error", "message": "Target resource not found in mission parameters."}

        logger.info(f"🛡️ Remediation Mission Engaged: {policy_name} on {resource.name} ({resource.provider})")
        
        adapter = get_adapter(resource.provider)
        if not adapter:
            return {"status": "error", "message": f"Adapter for {resource.provider} is offline."}

        try:
            # 🔨 Apply the Policy 🔨
            result = adapter.apply_security_policy(
                resource_id=resource.external_id,
                policy_name=policy_name,
                region=resource.region,
                account=resource.cloud_account
            )

            if result['status'] == 'success':
                # Log success notification
                db.add(Notification(
                    project_id=resource.project_id,
                    type="security",
                    severity="low",
                    message=f"AUTONOMOUS REMEDIATION: {policy_name} enforced on {resource.name}."
                ))
                db.commit()
            
            return result
        except Exception as e:
            logger.error(f"Remediation Mission Failed: {e}")
            return {"status": "error", "message": str(e)}

remediation_service = RemediationService()
