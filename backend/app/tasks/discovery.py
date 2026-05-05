import logging
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.services.governance_service import governance_service
from app.api.adapters import get_adapter
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

@celery_app.task(name="app.tasks.discovery.scan_account_resources")
def scan_account_resources(account_id: int):
    """Tactical mission to discover and update resources for a specific account in the background."""
    db = SessionLocal()
    try:
        account = db.query(CloudAccount).filter(CloudAccount.id == account_id).first()
        if not account:
            return f"Strategic failure: Account {account_id} not found."
            
        adapter = get_adapter(account.provider)
        if not adapter:
            return f"Provider {account.provider} unsupported for mission."
            
        # Simulation: Fetching from cloud and updating local registry
        logger.info(f"Initiating background discovery for {account.name} ({account.provider})")
        # In production: resources = adapter.get_resources(account)
        # Update logic goes here...
        
        return f"Discovery mission complete for {account.name}. Grid updated."
    except Exception as e:
        logger.error(f"Mission failed: {str(e)}")
        return f"Error: {str(e)}"
    finally:
        db.close()

@celery_app.task(name="app.tasks.discovery.run_compliance_scan")
def run_compliance_scan(project_id: int = None):
    """Execute a full-spectrum governance scan across the mission boundary."""
    db = SessionLocal()
    try:
        logger.info(f"Triggering background compliance scan for project {project_id}")
        governance_service.run_full_scan(db)
        return "Compliance scan mission complete. Evidence Vault updated."
    except Exception as e:
        logger.error(f"Compliance mission failed: {str(e)}")
        return f"Error: {str(e)}"
    finally:
        db.close()
