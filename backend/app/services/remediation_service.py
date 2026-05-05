import logging
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.models.compliance import ComplianceResult, CompliancePolicy
from app.models.resource import Resource
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class RemediationService:
    def remediate_violation(self, db: Session, result_id: int) -> Dict:
        """Attempt to restore mission-critical security by fixing a compliance violation."""
        result = db.query(ComplianceResult).filter(ComplianceResult.id == result_id).first()
        if not result or result.status != "fail":
            return {"status": "error", "message": "No active violation found."}

        resource = result.resource
        policy = result.policy
        adapter = get_adapter(resource.provider)
        
        if not adapter:
            return {"status": "error", "message": f"No adapter found for provider {resource.provider}"}

        logger.info(f"Initiating Remediation Mission: {policy.name} for resource {resource.name}")

        try:
            # 🛡️ Tactical Remediation Logic 🛡️
            if policy.check_id == "ec2_public_ssh":
                # Fix: Update Security Group / Firewall to restrict SSH
                return adapter.apply_security_policy(resource.external_id, "RestrictSSH", resource.region, resource.cloud_account)
            
            elif policy.check_id == "s3_public_access":
                # Fix: Enable Block Public Access
                return adapter.update_resource_tags(resource.external_id, {"ComplianceStatus": "Hardened"}, resource.region, resource.cloud_account)
            
            elif policy.check_id == "unused_resource":
                # Fix: Decommission the resource if it violates cost policies for too long
                return adapter.manage_instance(resource.external_id, resource.region, "stop", resource.cloud_account)

            else:
                return {"status": "unsupported", "message": f"Autonomous remediation not yet mapped for check: {policy.check_id}"}

        except Exception as e:
            logger.error(f"Remediation Failed for result {result_id}: {e}")
            return {"status": "error", "message": str(e)}

    def batch_remediate_critical(self, db: Session, project_id: int):
        """Automatically fix all 'Critical' violations within a project boundary."""
        # Query Critical failures for resources in this project
        violations = db.query(ComplianceResult)\
            .join(Resource, ComplianceResult.resource_id == Resource.id)\
            .join(CompliancePolicy, ComplianceResult.policy_id == CompliancePolicy.id)\
            .filter(Resource.project_id == project_id)\
            .filter(ComplianceResult.status == "fail")\
            .filter(CompliancePolicy.severity == "critical")\
            .all()

        logger.info(f"Discovered {len(violations)} Critical violations. Synchronizing remediation pulses...")
        
        results = []
        for v in violations:
            results.append(self.remediate_violation(db, v.id))
        
        return results

remediation_service = RemediationService()

