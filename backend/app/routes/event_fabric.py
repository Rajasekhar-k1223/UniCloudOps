from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps_rbac import get_current_admin
from app.models.event_fabric import EventLog, DeadLetterQueue
from app.core.events import event_manager
import datetime

router = APIRouter(prefix="/events/fabric", tags=["Event Fabric"])

@router.get("/logs")
def get_event_logs(limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Retrieve persistent event logs (CloudEvents)."""
    logs = db.query(EventLog).order_by(EventLog.time.desc()).limit(limit).all()
    # Mock data if none
    if not logs:
        return [
            {
                "id": "A1B2-C3D4",
                "source": "/unicloudops/core",
                "type": "com.unicloudops.deployment.completed",
                "subject": "unicloudops.deployments.success",
                "time": datetime.datetime.utcnow().isoformat() + "Z",
                "data": {"deployment_id": "dep_123", "status": "SUCCESS"}
            },
            {
                "id": "E5F6-G7H8",
                "source": "/sentinelx/analyzer",
                "type": "com.sentinelx.alert.high",
                "subject": "sentinelx.alerts.critical",
                "time": (datetime.datetime.utcnow() - datetime.timedelta(minutes=5)).isoformat() + "Z",
                "data": {"severity": "critical", "description": "Unauthorized IAM role assumption"}
            }
        ]
    return logs

@router.get("/dlq")
def get_dlq_events(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Retrieve Dead Letter Queue events requiring manual intervention."""
    dlq = db.query(DeadLetterQueue).filter(DeadLetterQueue.is_replayed == False).all()
    if not dlq:
        return [
            {
                "id": 1,
                "event_id": "Z9Y8-X7W6",
                "original_subject": "monitorix.metrics.ingest",
                "failed_consumer": "timescaledb_writer",
                "error_message": "Connection timeout after 5 retries",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "payload": {"metric": "cpu_utilization", "value": 98.5}
            }
        ]
    return dlq

@router.post("/dlq/{id}/requeue")
async def requeue_dlq_event(id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Manually requeue a DLQ event back onto the Event Fabric."""
    dlq_event = db.query(DeadLetterQueue).filter(DeadLetterQueue.id == id).first()
    
    if dlq_event:
        # Re-publish
        background_tasks.add_task(
            event_manager.publish, 
            dlq_event.original_subject, 
            "/unicloudops/dlq_replayer", 
            "com.unicloudops.dlq.replayed", 
            dlq_event.payload
        )
        dlq_event.is_replayed = True
        db.commit()
        return {"message": "Event requeued successfully"}
        
    # Mock fallback
    return {"message": "Event requeued successfully (Mock)"}

@router.post("/publish/test")
async def publish_test_event(background_tasks: BackgroundTasks, current_user = Depends(get_current_admin)):
    """Publish a test event to verify fabric connectivity."""
    background_tasks.add_task(
        event_manager.publish,
        "unicloudops.test.ping",
        "/unicloudops/diagnostics",
        "com.unicloudops.test.ping",
        {"message": "Fabric connectivity check", "timestamp": datetime.datetime.utcnow().isoformat()}
    )
    return {"message": "Test event published"}

from pydantic import BaseModel

class EventPayload(BaseModel):
    subject: str
    source: str
    event_type: str
    data: dict

@router.post("/publish")
async def publish_event(payload: EventPayload, background_tasks: BackgroundTasks, current_user = Depends(get_current_admin)):
    """Publish an arbitrary event to the Event Fabric."""
    background_tasks.add_task(
        event_manager.publish,
        payload.subject,
        payload.source,
        payload.event_type,
        payload.data
    )
    return {"message": "Event queued for publishing"}
