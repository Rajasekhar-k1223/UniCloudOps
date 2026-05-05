import logging
import asyncio
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.models.resource import Resource
from app.models.deployment import Deployment
from app.api.adapters import get_adapter
from app.services.audit_service import audit_logger
from app.utils.connection_manager import manager

logger = logging.getLogger(__name__)

class RepairService:
    def __init__(self):
        self.max_restart_retries = 2

    async def audit_and_repair(self, db: Session, project_id: int):
        """Scans for failed resources and applies tiered autonomous recovery."""
        from app.models.cloud_account import CloudAccount
        
        # 1. Fetch Failed Resources in the mission boundary
        query = db.query(Resource).join(CloudAccount).filter(
            CloudAccount.project_id == project_id,
            Resource.status.in_(['error', 'stopped', 'failed'])
        )
        failed_resources = query.all()
        
        repaired = []
        for res in failed_resources:
            # 2. Determine Recovery Tier
            meta = res.cloud_metadata or {}
            retry_count = meta.get('repair_retries', 0)
            
            if retry_count < self.max_restart_retries:
                # TIER 1: Tactical Restart
                success = await self._remediate_restart(db, res, retry_count)
                if success:
                    repaired.append({"id": res.id, "name": res.name, "action": "RESTART"})
            else:
                # TIER 2: Mission Re-provisioning
                success = await self._remediate_reprovision(db, res)
                if success:
                    repaired.append({"id": res.id, "name": res.name, "action": "REPROVISION"})
        
        db.commit()
        return repaired

    async def _remediate_restart(self, db: Session, res: Resource, retry_count: int):
        """Attempt to recover the resource via power-cycle."""
        adapter = get_adapter(res.provider)
        if not adapter:
            return False

        logger.info(f"Self-Healing [Tier 1]: Restarting {res.name} (Retry: {retry_count + 1})")
        
        # Call adapter to start
        result = adapter.manage_instance(res.external_id, res.region, 'start', res.cloud_account)
        
        if result.get("status") == "success":
            # Update retry count in metadata
            new_meta = dict(res.cloud_metadata or {})
            new_meta['repair_retries'] = retry_count + 1
            res.cloud_metadata = new_meta
            res.status = 'running' # Optimistic update, sync will confirm
            
            # Audit log
            audit_logger.record_action(
                db, "SELF_HEAL_REPAIR", 
                user_id=1, # Default system user or owner
                resource_id=res.id, 
                message=f"Autonomous Self-Healing: Restarted {res.name} after detecting downtime (Attempt {retry_count + 1})."
            )
            return True
        return False

    async def _remediate_reprovision(self, db: Session, res: Resource):
        """Escalate to full re-provisioning if power-cycles fail."""
        # Find the latest successful deployment for this resource identity
        # NOTE: This requires a search by resource name/tags in the deployment history
        deployment = db.query(Deployment).filter(
            Deployment.cloud_account_id == res.cloud_account_id,
            Deployment.status == 'success'
        ).order_by(Deployment.created_at.desc()).first()

        if not deployment:
            logger.warning(f"Self-Healing: Escalation failed for {res.name}. No deployment history found.")
            return False

        logger.info(f"Self-Healing [Tier 2]: Initiating full re-provisioning mission for {res.name}")
        
        # Trigger the IaC task (Async)
        from app.tasks.iac_tasks import execute_iac_deployment
        execute_iac_deployment.delay(
            deployment.id, 
            res.cloud_account_id, 
            deployment.template_id, 
            deployment.variables
        )

        # Audit log
        audit_logger.record_action(
            db, "SELF_HEAL_REPROVISION", 
            user_id=1,
            resource_id=res.id, 
            message=f"Critical Escalation: Initiated autonomous re-provisioning mission for {res.name} after multiple repair failures."
        )
        
        # Broadcast via WebSocket
        try:
            await manager.broadcast_to_user(1, { # System or project owner
                "type": "SELF_HEAL_ESCALATION",
                "resource_name": res.name,
                "action": "FULL_REPROVISION_INITIATED"
            })
        except: pass

        return True

repair_service = RepairService()
