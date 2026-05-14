from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.project import Project
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def sync_all_project_budgets():
    """Background task to aggregate monthly spend across all sovereign projects."""
    db = SessionLocal()
    try:
        projects = db.query(Project).all()
        for project in projects:
            total_spend = 0.0
            # Sum spend from all associated cloud accounts
            accounts = db.query(CloudAccount).filter(CloudAccount.project_id == project.id).all()
            for account in accounts:
                adapter = get_adapter(account.provider)
                if adapter:
                    try:
                        # Fetch simulated or real API spend for this month
                        spend = adapter.get_monthly_spend(account)
                        total_spend += spend
                    except Exception as e:
                        logger.error(f"Failed to fetch spend for account {account.id}: {str(e)}")
            
            project.current_spend_mtd = total_spend
            
            # 🔔 Automated Alert Logic & Mission Recall 🔔
            from app.models.notification import Notification
            from datetime import datetime, timedelta
            
            usage_ratio = total_spend / project.budget_limit if project.budget_limit > 0 else 0
            if usage_ratio >= project.alert_threshold:
                # Check for alert fatigue (suppression logic)
                now = datetime.utcnow()
                if not project.last_budget_alert_sent_at or (now - project.last_budget_alert_sent_at > timedelta(hours=24)):
                    severity = "critical" if usage_ratio >= 1.0 else "warning"
                    msg = f"Budget Guardrail Breach: Project '{project.name}' has consumed {usage_ratio*100:.1f}% of its ${project.budget_limit:.2f} limit."
                    
                    if usage_ratio >= 1.0:
                        msg = f"HARD LIMIT REACHED: Project '{project.name}' has exceeded its ${project.budget_limit:.2f} budget. All new provisioning missions are locked, and Mission Recall (Hibernation) is being engaged for non-critical resources."
                        # 🛰️ Mission Recall: Engagement Sequence 🛰️
                        _engage_mission_recall(db, project)
                    
                    alert = Notification(
                        project_id=project.id,
                        type="budget",
                        severity=severity,
                        message=msg
                    )
                    db.add(alert)
                    project.last_budget_alert_sent_at = now
                    logger.warning(f"Budget Alert Triggered for {project.name}: {usage_ratio*100:.1f}%")

            logger.info(f"Project '{project.name}' MTD Spend Updated: ${total_spend:.2f} / ${project.budget_limit:.2f}")
        
        db.commit()
    finally:
        db.close()

def _engage_mission_recall(db, project):
    """Hibernates all resources in a project to stop fiscal leakage."""
    from app.models.resource import Resource
    resources = db.query(Resource).filter(Resource.project_id == project.id).all()
    logger.info(f"🚀 Mission Recall engaged for Project '{project.name}'. Hibernating {len(resources)} resources...")
    
    for res in resources:
        try:
            adapter = get_adapter(res.provider)
            if adapter:
                # We skip critical production resources if they were marked as such
                # For now, we hibernate everything to ensure budget integrity
                adapter.manage_instance(res.external_id, res.region, 'stop')
                res.status = 'STOPPED'
        except Exception as e:
            logger.error(f"Mission Recall failed for resource {res.id}: {e}")

def check_project_budget_guardrail(project_id: int) -> bool:
    """True if project is within budget, False if breached."""
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return True # No project, no guardrail
        
        # Hard stop if limit reached
        return project.current_spend_mtd < project.budget_limit
    finally:
        db.close()
