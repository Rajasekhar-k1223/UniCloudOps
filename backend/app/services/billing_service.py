import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class BillingService:
    def update_project_spend(self, db: Session, project_id: int):
        """Analyze and synchronize fiscal spend across all project cloud missions."""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        total_spend = 0.0
        accounts = db.query(CloudAccount).filter(CloudAccount.project_id == project_id).all()

        for account in accounts:
            adapter = get_adapter(account.provider)
            if adapter:
                try:
                    # Fetch monthly spend from adapter (summarized by resource costs)
                    account_spend = adapter.get_monthly_spend(account)
                    total_spend += account_spend
                    logger.info(f"Fiscal Audit: Account {account.name} spend identified at ${account_spend}")
                except Exception as e:
                    logger.error(f"Fiscal Audit Failed for account {account.name}: {e}")

        # Update Project Spend Matrix
        project.current_spend_mtd = round(total_spend, 2)
        db.commit()

        # 🛡️ Trigger Fiscal Guardrails 🛡️
        self.check_budget_guardrails(db, project)

    def check_budget_guardrails(self, db: Session, project: Project):
        """Evaluate project spend against defined budget thresholds."""
        if not project.budget_limit or project.budget_limit <= 0:
            return

        threshold_amount = project.budget_limit * project.alert_threshold
        
        if project.current_spend_mtd >= threshold_amount:
            # Check for anti-fatigue (only alert once every 24 hours per project)
            if not project.last_budget_alert_sent_at or \
               (datetime.now() - project.last_budget_alert_sent_at) > timedelta(hours=24):
                
                self.trigger_budget_alert(project)
                project.last_budget_alert_sent_at = datetime.now()
                db.commit()

    def trigger_budget_alert(self, project: Project):
        """Broadcast mission-critical budget alerts to defined webhook endpoints."""
        percentage = (project.current_spend_mtd / project.budget_limit) * 100
        msg = (
            f"🚨 [FISCAL GUARDRAIL] Project '{project.name}' has exceeded {project.alert_threshold*100}% of monthly budget. "
            f"Current Spend: ${project.current_spend_mtd} / Budget: ${project.budget_limit} ({percentage:.1f}%)."
        )
        
        logger.warning(msg)
        
        if project.webhook_url:
            try:
                import requests
                # Industrial notification payload (Slack/Teams compatible)
                payload = {
                    "text": msg,
                    "attachments": [{
                        "title": "Fiscal Mission Advisory",
                        "text": "Please review your infrastructure missions to ensure cost-compliance.",
                        "color": "#e11d48", # Rose-600
                        "fields": [
                            {"title": "Project", "value": project.name, "short": True},
                            {"title": "Status", "value": "Budget Threshold Exceeded", "short": True}
                        ]
                    }]
                }
                requests.post(project.webhook_url, json=payload, timeout=5)
                logger.info(f"Budget Alert broadcast successfully to {project.webhook_url}")
            except Exception as e:
                logger.error(f"Failed to broadcast budget alert: {e}")

billing_service = BillingService()
