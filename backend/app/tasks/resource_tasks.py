import logging
import time
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.resource import Resource
from app.api.adapters import get_adapter
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

@celery_app.task(name="poll_resource_lifecycle_status")
def poll_resource_lifecycle_status(resource_id: int, target_status: str, max_retries: int = 12):
    """
    Polls a cloud resource until it reaches the target status or max retries exceeded.
    Used for Start/Stop actions to ensure DB stays in sync.
    """
    db = SessionLocal()
    try:
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            logger.error(f"Resource {resource_id} not found for polling")
            return
            
        adapter = get_adapter(resource.provider)
        account = resource.cloud_account
        
        # Initial delay to allow cloud provider to initiate state change
        time.sleep(5)
        
        for i in range(max_retries):
            try:
                current_status = adapter.poll_instance_status(resource.external_id, resource.region, account)
                logger.info(f"Polling mission {resource_id}: state={current_status}, target={target_status}")
                
                # Check for state changes or target reach
                if resource.status != current_status:
                    resource.status = current_status
                    db.commit()
                    # 🧹 Refresh intelligence cache for the project 🧹
                    if resource.cloud_account:
                        cache_service.delete_pattern(f"res_v1_p{resource.cloud_account.project_id}_*")
                
                if current_status.lower() == target_status.lower():
                    logger.info(f"Resource {resource_id} successfully reached target: {target_status}")
                    break
                    
                if current_status.lower() in ['terminated', 'failed']:
                    logger.warning(f"Resource {resource_id} entered terminal state: {current_status}")
                    break
            except Exception as e:
                logger.error(f"Surveillance glitch for resource {resource_id}: {e}")
            
            # Wait 5 seconds before next orbital sweep
            time.sleep(5)
                
    finally:
        db.close()
