import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class ComplianceService:
    def run_guardrail_audit(self, db: Session, project_id: int) -> List[Dict]:
        """Perform a tactical security and compliance audit on project resources."""
        resources = db.query(Resource).filter(Resource.project_id == project_id).all()
        findings = []
        
        for res in resources:
            # Check for Unencrypted Volumes
            if res.type == 'Compute':
                metadata = res.cloud_metadata or {}
                # AWS-specific encryption check
                if res.provider == 'aws':
                    if not metadata.get('EbsOptimized', True):
                        findings.append({
                            "resource_id": res.external_id,
                            "resource_name": res.name,
                            "rule": "EBS-Optimization",
                            "severity": "low",
                            "status": "failed",
                            "message": "Instance is not EBS-optimized."
                        })
                
                # Check for Public IPs on internal-labeled resources
                if res.public_ip and res.public_ip != 'N/A' and 'internal' in res.name.lower():
                    findings.append({
                        "resource_id": res.external_id,
                        "resource_name": res.name,
                        "rule": "Isolation-Policy",
                        "severity": "critical",
                        "status": "failed",
                        "message": "Internal resource has a public IP address."
                    })
                    
        return findings

compliance_service = ComplianceService()
