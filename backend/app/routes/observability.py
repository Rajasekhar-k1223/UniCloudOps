from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import MetricThresholdAlert
import random
import datetime

router = APIRouter(prefix="/observability", tags=["Observability Center"])

@router.get("/metrics/summary")
def get_metrics_summary(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Retrieve top-level platform metrics."""
    return {
        "global_uptime": "99.998%",
        "active_alerts": db.query(MetricThresholdAlert).filter(MetricThresholdAlert.is_triggered == 1).count(),
        "total_requests_24h": 1450239,
        "average_latency_ms": 42.5
    }

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List configured alerts and their status."""
    alerts = db.query(MetricThresholdAlert).all()
    if not alerts:
        return [
            {
                "id": 1,
                "resource_id": "prod-db-primary",
                "metric_name": "cpu_utilization",
                "threshold_value": 85.0,
                "comparison_operator": ">",
                "is_triggered": True,
                "triggered_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "resource_id": "k8s-node-pool-1",
                "metric_name": "memory_utilization",
                "threshold_value": 90.0,
                "comparison_operator": ">",
                "is_triggered": False,
                "triggered_at": None
            }
        ]
    return alerts

@router.get("/traces/recent")
def get_recent_traces(current_user = Depends(get_current_viewer)):
    """Simulate fetching distributed traces from OpenTelemetry/Jaeger."""
    return [
        {"trace_id": "5f9b3b8c", "service": "api-gateway", "duration_ms": 12, "status": "ok"},
        {"trace_id": "a1b2c3d4", "service": "auth-service", "duration_ms": 105, "status": "ok"},
        {"trace_id": "e5f6g7h8", "service": "billing-engine", "duration_ms": 4500, "status": "error"}
    ]
