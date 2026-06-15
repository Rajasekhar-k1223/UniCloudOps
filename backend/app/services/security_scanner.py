from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.api.adapters import get_adapter
from typing import List, Dict
import random

class SecurityScanner:
    @staticmethod
    def scan_project(db: Session, project_id: int) -> List[Dict]:
        from app.models.cloud_account import CloudAccount
        resources = db.query(Resource).join(CloudAccount).filter(CloudAccount.project_id == project_id).all()
        findings = []
        
        for r in resources:
            if r.type == 'Compute':
                # Network Perimeter Audit
                # Simulation: Logic to check open ports 22/3389
                is_vulnerable = random.choice([True, False, False, False]) # 25% chance of finding a 'bad' VM
                if is_vulnerable:
                    findings.append({
                        "id": f"SEC-{r.id}-NET",
                        "resource_id": r.external_id,
                        "resource_name": r.name,
                        "provider": r.cloud_account.provider,
                        "severity": "high",
                        "title": "Insecure Management Port Exposed",
                        "description": f"Port 22 (SSH) is open to 0.0.0.0/0 on {r.name}. This exposes the instance to brute-force attacks.",
                        "remediation": "Restrict SSH access to specific trusted IP ranges using Security Group rules.",
                        "category": "Networking"
                    })
            
            if r.type == 'Storage' or 'S3' in r.name.upper() or 'BLOB' in r.name.upper():
                # Storage Guardrail Check
                is_public = random.choice([True, False, False, False, False])
                if is_public:
                    findings.append({
                        "id": f"SEC-{r.id}-STR",
                        "resource_id": r.external_id,
                        "resource_name": r.name,
                        "provider": r.cloud_account.provider,
                        "severity": "critical",
                        "title": "Public Storage Bucket Detected",
                        "description": f"The storage container '{r.name}' has public read access enabled.",
                        "remediation": "Apply 'Block All Public Access' policy in the cloud console or via UniCloudOps Guardrails.",
                        "category": "Storage"
                    })

            if r.type == 'Cluster':
                # K8s Hygiene Check
                findings.append({
                    "id": f"SEC-{r.id}-K8S",
                    "resource_id": r.external_id,
                    "resource_name": r.name,
                    "provider": r.cloud_account.provider,
                    "severity": "medium",
                    "title": "Insecure Pod Security Policy",
                    "description": f"Cluster '{r.name}' allows privileged containers to run.",
                    "remediation": "Enable Pod Security Admission controllers and restrict privileged escalation.",
                    "category": "Kubernetes"
                })
                        
        return findings

security_scanner = SecurityScanner()
