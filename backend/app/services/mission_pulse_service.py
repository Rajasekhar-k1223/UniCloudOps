import logging
from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session
from app.db.mongo import db as mongo_db
from app.services.intelligence_service import intelligence_service

logger = logging.getLogger(__name__)

class MissionPulseService:
    """
    Tactical Mission Pulse Service.
    Synthesizes thousands of multi-cloud logs into high-level neural signals.
    """
    
    async def get_neural_signals(self, project_id: int) -> List[Dict]:
        """
        Fetch recent audit logs and use AI to synthesize tactical signals.
        """
        try:
            # 1. Fetch recent events from MySQL Audit Log
            from app.db.session import SessionLocal
            from app.models.audit_log import AuditLog
            
            events = []
            with SessionLocal() as db:
                logs = db.query(AuditLog).filter(
                    AuditLog.project_id == project_id
                ).order_by(
                    AuditLog.created_at.desc()
                ).limit(20).all()
                
                for log in logs:
                    events.append({
                        "timestamp": log.created_at.isoformat(),
                        "action": log.action,
                        "resource_type": log.resource_type,
                        "status": log.status,
                        "message": log.message
                    })
                    
            if not events:
                return [{"type": "system", "message": "Neural link established. Awaiting tactical events...", "severity": "info"}]

            # 2. Use AI/Rules to synthesize the "Ticker Tape"
            signals = intelligence_service.synthesize_neural_signals(events)
            return signals
        except Exception as e:
            logger.error(f"Neural signal synthesis failed: {e}")
            return [{"type": "error", "message": "Neural link interrupted. Re-syncing tactical feed...", "severity": "warning"}]

mission_pulse_service = MissionPulseService()
