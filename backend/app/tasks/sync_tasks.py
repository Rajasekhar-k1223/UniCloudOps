import logging
from app.core.celery_app import celery_app
from app.db.session import SessionLocal, engine
from sqlalchemy.sql import func
from app.models.cloud_account import CloudAccount
from app.models.resource import Resource
from app.models.compliance import ComplianceResult
from datetime import datetime

logger = logging.getLogger(__name__)

def sync_cloud_resources_logic(account_id: int, db: SessionLocal):
    """Business logic for syncing resources using the Adapter system."""
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id).first()
    if not account:
        logger.error(f"Account {account_id} not found")
        return
    
    account.last_sync = func.now()
    
    from app.api.adapters import get_adapter
    adapter = get_adapter(account.provider)
    if not adapter:
        logger.warning(f"No adapter found for provider {account.provider}")
        return

    try:
        scanned_resources = adapter.sync_resources(account) or []
        # 🛸 Tactical Fleet Discovery: Fetch Kubernetes Clusters 🛸
        clusters = adapter.get_clusters(account) or []
        scanned_resources.extend(clusters)
        
        # 🌐 Topology Discovery: Fetch VPCs and VNets 🌐
        networks = adapter.get_networks(account) or []
        scanned_resources.extend(networks)
    except Exception as e:
        logger.error(f"Adapter sync failed for account {account_id} ({account.provider}): {e}")
        # Re-raise to be handled by the task wrapper (sets account status to error)
        raise e

    if scanned_resources is None:
        logger.error(f"Sync returned None for account {account_id}. Aborting update to preserve data.")
        return

    # 2. Update Resources table (Sovereign Upsert)
    # To maintain stability, we update existing resources and add new ones.
    # Resources no longer present in the cloud are removed to keep the dashboard accurate.
    
    existing_resources = {r.external_id: r for r in db.query(Resource).filter(Resource.cloud_account_id == account_id).all()}
    scanned_external_ids = set()
    processed_in_batch = set()

    for res_data in scanned_resources:
        ext_id = res_data['external_id']
        if ext_id in processed_in_batch:
            continue
        
        scanned_external_ids.add(ext_id)
        processed_in_batch.add(ext_id)
        
        if ext_id in existing_resources:
            # Update existing
            res_obj = existing_resources[ext_id]
            for key, val in res_data.items():
                if hasattr(res_obj, key):
                    setattr(res_obj, key, val)
        else:
            # Create new
            # Nuclear De-confliction to prevent "multiple values for keyword argument"
            res_data.pop('provider', None)
            res_data.pop('cloud_account_id', None)
            
            # Double-check database for race conditions with UniqueConstraint safety
            already_exists = db.query(Resource).filter(Resource.cloud_account_id == account_id, Resource.external_id == ext_id).first()
            if already_exists:
                continue

            db_resource = Resource(
                cloud_account_id=account_id,
                provider=account.provider,
                **res_data
            )
            db.add(db_resource)

    # Clean up orphaned resources (those in DB but not in latest scan)
    orphaned_ids = set(existing_resources.keys()) - scanned_external_ids
    if orphaned_ids:
        # Before deleting resources, clean up compliance results to avoid FK issues
        res_ids_to_del = [existing_resources[eid].id for eid in orphaned_ids]
        db.query(ComplianceResult).filter(ComplianceResult.resource_id.in_(res_ids_to_del)).delete(synchronize_session=False)
        db.query(Resource).filter(Resource.cloud_account_id == account_id, Resource.external_id.in_(orphaned_ids)).delete(synchronize_session=False)
    
    db.commit()
    
    account.status = "active"
    account.error_message = None
    db.commit()
    
    logger.info(f"Sync complete for account {account_id}. Found {len(scanned_resources)} resources.")
    
    # 📡 Invalidate Tactical Resource Caches for the project boundary 📡
    from app.services.cache_service import cache_service
    if account.project_id:
        cache_service.delete_pattern(f"res_v1_p{account.project_id}_*")
    
    # 🕵️ Continuous Governance Scan 🕵️
    from app.services.governance_service import governance_service
    try:
        governance_service.run_full_scan(db)
        logger.info(f"Background Compliance Scan complete for account {account_id}.")
    except Exception as ge:
        logger.error(f"Background Compliance Scan failed: {ge}")

    # 💰 Sovereign Fiscal Audit 💰
    if account.project_id:
        from app.services.billing_service import billing_service
        try:
            billing_service.update_project_spend(db, account.project_id)
            logger.info(f"Fiscal Guardrails synchronized for project {account.project_id}.")
        except Exception as be:
            logger.error(f"Fiscal Guardrail Synchronization failed: {be}")

@celery_app.task(name="sync_cloud_resources")
def sync_cloud_resources(account_id: int):
    """Scan and update resources for a specific cloud account."""
    db = SessionLocal()
    account = db.query(CloudAccount).filter(CloudAccount.id == account_id).first()
    try:
        sync_cloud_resources_logic(account_id, db)
    except Exception as e:
        db.rollback()
        logger.error(f"Error during sync for account {account_id}: {e}")
        if account:
            account.status = "error"
            account.error_message = str(e)
            db.commit()
    finally:
        db.close()

@celery_app.task(name="sync_all_accounts")
def sync_all_accounts():
    """Trigger sync for all linked cloud accounts."""
    db = SessionLocal()
    accounts = db.query(CloudAccount).all()
    for account in accounts:
        sync_cloud_resources.delay(account.id)
    db.close()
