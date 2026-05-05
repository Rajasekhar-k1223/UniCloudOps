import json
from app.db.session import SessionLocal
from app.models.audit_log import AuditLog
from app.models.deployment import Deployment
from app.tasks.iac_tasks import execute_iac_deployment
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def restore_mission():
    """Extract mission parameters from audit logs and relaunch the deployment."""
    db = SessionLocal()
    logger.info("Initializing Mission Recovery Protocol...")
    
    try:
        # Find the latest MISSION_LAUNCH action
        audit_entry = db.query(AuditLog).filter(AuditLog.action == "MISSION_LAUNCH").order_by(AuditLog.created_at.desc()).first()
        
        if not audit_entry:
            logger.error("Critical Failure: No mission parameters found in Audit Logs.")
            return

        metadata = audit_entry.metadata_json
        if isinstance(metadata, str):
            metadata = json.loads(metadata)
            
        logger.info(f"Recovered Mission Profile: {metadata.get('variables', {}).get('instance_name')}")
        
        # 🏗️ Reconstruct Deployment Record 🏗️
        new_deployment = Deployment(
            user_id=audit_entry.user_id,
            template_id=metadata.get('template_id'),
            cloud_account_id=metadata.get('cloud_account_id'),
            project_id=audit_entry.project_id,
            variables=metadata.get('variables'),
            status="pending"
        )
        db.add(new_deployment)
        db.commit()
        db.refresh(new_deployment)
        
        logger.info(f"Restored Deployment Record: DEP-{new_deployment.id}")
        
        # 🚀 Manually Trigger Hardened Engine 🚀
        logger.info("Engaging IaC engine for re-provisioning...")
        execute_iac_deployment.delay(new_deployment.id)
        
        logger.info("Mission Relaunched Successfully.")
        
    except Exception as e:
        logger.error(f"Recovery Operation Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    restore_mission()
