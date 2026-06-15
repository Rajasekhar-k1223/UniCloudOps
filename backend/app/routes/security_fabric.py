from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_admin
from app.models.security_fabric import SecurityGraphNode, RiskScore, ThreatIntelFeed

router = APIRouter(prefix="/fabric", tags=["Security Fabric"])

@router.get("/graph")
def get_security_graph(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch nodes for the Security Topology Graph."""
    # MVP Mock Data - In reality, querying SecurityGraphNode table
    return {
        "nodes": [
            {"id": "user-alice", "label": "Alice (Dev)", "type": "USER", "risk": 15},
            {"id": "role-admin", "label": "Admin Role", "type": "IAM_ROLE", "risk": 45},
            {"id": "res-s3-prod", "label": "Production S3", "type": "CLOUD_RESOURCE", "risk": 90},
            {"id": "vuln-public", "label": "Public Read Access", "type": "INCIDENT", "risk": 100}
        ],
        "edges": [
            {"source": "user-alice", "target": "role-admin"},
            {"source": "role-admin", "target": "res-s3-prod"},
            {"source": "res-s3-prod", "target": "vuln-public"}
        ]
    }

@router.get("/threat-intel")
def get_threat_intelligence(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch active global threat intelligence feeds."""
    # MVP Mock Data - In reality, querying ThreatIntelFeed table
    return [
        {
            "indicator": "CVE-2026-9999",
            "type": "VULNERABILITY",
            "severity": "CRITICAL",
            "source": "Wazuh / NVD",
            "description": "Zero-day RCE in popular ingress controller."
        },
        {
            "indicator": "198.51.100.42",
            "type": "MALICIOUS_IP",
            "severity": "HIGH",
            "source": "AlienVault OTX",
            "description": "Known Tor exit node attempting brute force."
        }
    ]

@router.get("/risk-dashboard")
def get_high_risk_entities(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch top entities sorted by their Risk Score."""
    # MVP Mock Data - In reality, querying RiskScore table
    return [
        {
            "entity_id": "res-s3-prod",
            "entity_type": "CLOUD_RESOURCE",
            "score": 90.0,
            "level": "CRITICAL",
            "factors": ["public_s3", "critical_cve"]
        },
        {
            "entity_id": "user-bob",
            "entity_type": "USER",
            "score": 65.0,
            "level": "HIGH",
            "factors": ["suspicious_ip", "failed_login"]
        }
    ]
