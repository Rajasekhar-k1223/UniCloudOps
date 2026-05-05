from app.db.session import engine, Base
from app.models.deployment import Deployment
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def recreate_deployments_table():
    """Surgically drop and recreate the deployments table for a clean mission slate."""
    logger.info("Initiating Mission History Purge (Deployments Table)...")
    try:
        # Drop only the specific table
        Deployment.__table__.drop(engine, checkfirst=True)
        logger.info("Legacy mission history decommissioned.")
        
        # Recreate it
        Deployment.__table__.create(engine)
        logger.info("Fresh Deployment registry provisioned successfully.")
    except Exception as e:
        logger.error(f"Recreation Failed: {e}")

if __name__ == "__main__":
    recreate_deployments_table()
