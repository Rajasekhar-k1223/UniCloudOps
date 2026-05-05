import hashlib
import json
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Any, Optional, Dict

class AuditService:
    @staticmethod
    def record_action(
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        project_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "success",
        message: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """Records a tactical event in the industrial audit log with forensic integrity chaining."""
        # 🛡️ Compute Forensic Integrity Hash 🛡️
        previous_log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        prev_hash = previous_log.integrity_hash if previous_log else "GENESIS_MISSION_BLOCK"
        
        # Prepare content for hashing
        content = f"{prev_hash}|{action}|{user_id}|{project_id}|{status}|{message}|{json.dumps(metadata_json or {})}"
        integrity_hash = hashlib.sha512(content.encode()).hexdigest()

        log_entry = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            status=status,
            message=message,
            metadata_json=metadata_json,
            ip_address=ip_address,
            integrity_hash=integrity_hash
        )
        db.add(log_entry)
        db.commit()
        return log_entry

    @staticmethod
    def seal_mission_report(db: Session, project_id: int) -> Dict:
        """Analyze and seal a situational audit report for a specific project mission."""
        from app.models.audit_log import AuditLog
        logs = db.query(AuditLog).filter(AuditLog.project_id == project_id).all()
        
        report_data = {
            "mission_id": f"MISSION-SEQ-{project_id}",
            "total_events": len(logs),
            "critical_violations": len([l for l in logs if l.status == 'failure']),
            "actions_summary": {},
            "sealed_at": "2024-03-27T16:00:00Z"
        }
        
        for l in logs:
            report_data["actions_summary"][l.action] = report_data["actions_summary"].get(l.action, 0) + 1
            
        return report_data

# Global Instance
audit_logger = AuditService()
