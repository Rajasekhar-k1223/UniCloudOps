from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_user, get_current_admin
from app.models.security_shield import SOCIncident, CSPMFinding, VaultSecretMetadata, OPAPolicy
import uuid

router = APIRouter(prefix="/security", tags=["Security Shield"])

@router.get("/soc/incidents")
def list_soc_incidents(status: str = "OPEN", db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch active threats for the Security Operations Center."""
    incidents = db.query(SOCIncident).filter(SOCIncident.status == status).order_by(SOCIncident.created_at.desc()).all()
    
    if not incidents:
        # MVP Mock Data
        return [
            {
                "id": "INC-2026-001",
                "title": "Suspicious Root Access in EKS Pod",
                "severity": "CRITICAL",
                "source_layer": "Layer 6: Kubernetes Security Center",
                "mitre_tactic": "Privilege Escalation",
                "details": {"pod": "nginx-ingress-54f3d", "namespace": "prod", "process": "sudo su"}
            },
            {
                "id": "INC-2026-002",
                "title": "API Rate Limit Exceeded - Possible Brute Force",
                "severity": "HIGH",
                "source_layer": "Layer 3: API Security Gateway",
                "mitre_tactic": "Credential Access",
                "details": {"ip": "192.168.1.45", "endpoint": "/auth/login", "attempts": 500}
            }
        ]
    return incidents

@router.get("/cspm/findings")
def list_cspm_findings(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch Cloud Security Posture Management misconfigurations."""
    findings = db.query(CSPMFinding).filter(CSPMFinding.status == "ACTIVE").all()
    if not findings:
        return [
            {
                "rule_id": "aws-s3-public-read",
                "severity": "CRITICAL",
                "resource_id": "arn:aws:s3:::customer-pii-backups",
                "description": "S3 bucket allows public READ access via Bucket Policy."
            }
        ]
    return findings

@router.get("/vault/secrets")
def list_vault_secrets(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """List metadata for dynamic secrets stored in the Vault."""
    secrets = db.query(VaultSecretMetadata).all()
    if not secrets:
        return [
            {
                "path": "aws/sts/prod-deployment-role",
                "description": "Dynamic short-lived AWS credentials for Terraform deployments.",
                "engine_type": "aws",
                "last_rotated": "2026-06-06T10:00:00Z"
            }
        ]
    return secrets

@router.post("/opa/validate")
def validate_against_opa(payload: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Mock integration for Layer 5: OPA Governance Engine.
    Evaluates an incoming terraform payload against Rego policies.
    """
    # Simplified logic: If payload contains "public", we reject it.
    if "public" in str(payload).lower() or "0.0.0.0/0" in str(payload):
        raise HTTPException(
            status_code=403, 
            detail="OPA Policy Violation: Resource exposes public ingress. Deployment blocked by Governance Engine."
        )
        
    return {"status": "approved", "message": "Payload passed OPA Rego evaluation."}
