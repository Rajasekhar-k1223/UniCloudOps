from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import AIOpsIncident
import datetime

router = APIRouter(prefix="/aiops", tags=["AI Operations"])

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Retrieve AIOps Incidents."""
    incidents = db.query(AIOpsIncident).all()
    if not incidents:
        return [
            {
                "id": 1,
                "title": "Anomalous Latency Spike in Payment Gateway",
                "severity": "high",
                "status": "investigating",
                "ai_analysis": "Detected 400% latency increase correlated with a recent Terraform apply on the `aws_rds_cluster`. Suggested action: Rollback latest deployment or scale read replicas.",
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "title": "Unusual IAM Role Assumption",
                "severity": "critical",
                "status": "resolved",
                "ai_analysis": "IAM Role 'arn:aws:iam::123:role/prod-admin' assumed from unrecognized IP range. Auto-remediation triggered: Temporary credentials revoked.",
                "created_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).isoformat()
            }
        ]
    return incidents

@router.post("/incidents/{incident_id}/analyze")
def trigger_ai_analysis(incident_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Trigger an on-demand LLM analysis for an incident."""
    # In production, this would call an LLM API (OpenAI, Gemini, Anthropic) with incident telemetry.
    return {
        "incident_id": incident_id,
        "new_insights": "LLM Analysis: The issue appears to stem from a misconfigured connection pool in the Node.js backend. Increase `poolSize` from 10 to 50."
    }
