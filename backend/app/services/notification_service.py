import httpx
import logging
import asyncio
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.project import Project

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def notify(db: Session, project_id: int, type: str, severity: str, message: str, broadcast: bool = False):
        """
        Record internal notification and conditionally dispatch to an external webhook.
        
        Args:
            project_id: ID of the Sovereign Project boundary.
            type: Category of alert (e.g. 'budget', 'system', 'lifecycle', 'mission')
            severity: 'info', 'warning', 'critical'
            message: The human-readable notification body.
            broadcast: If True, forces external webhook dispatch even for non-critical lifecycle events (if project Opt-In enabled).
        """
        if not project_id:
            logger.warning("Notification blocked: No project_id provided.")
            return None

        # 1. Create Internal Telemetry Record
        notif = Notification(
            project_id=project_id,
            type=type,
            severity=severity,
            message=message,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        
        # 2. Check for Webhook Configuration
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return notif
            
        # 3. Determine if Webhook Dispatch is required
        should_dispatch = False
        if project.webhook_url:
            # Always dispatch critical/warning alerts
            if severity in ["critical", "warning"]:
                should_dispatch = True
            # Conditionally dispatch lifecycle/info broadcasts if user opted in
            elif broadcast and project.notify_on_lifecycle:
                should_dispatch = True
                
        if should_dispatch:
            # Using Slack/Teams compatible basic payload structure
            payload = {
                "text": f"*{severity.upper()} Alert* - Project: {project.name}\n{message}"
            }
            # Fire-and-forget async request to avoid blocking the API thread
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(NotificationService._dispatch_webhook(project.webhook_url, payload))
                else:
                    asyncio.run(NotificationService._dispatch_webhook(project.webhook_url, payload))
            except Exception as loop_e:
                logger.error(f"Failed to schedule webhook async task: {loop_e}")
            
        return notif

    @staticmethod
    async def _dispatch_webhook(url: str, payload: dict):
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(url, json=payload, timeout=5.0)
                res.raise_for_status()
                logger.info(f"Notification orchestrated successfully to external webhook.")
        except httpx.HTTPError as e:
            logger.error(f"HTTP Exception while dispatching webhook: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to dispatch webhook to {url}: {str(e)}")

notification_service = NotificationService()
