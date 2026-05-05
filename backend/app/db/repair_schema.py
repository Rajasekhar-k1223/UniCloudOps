from app.db.session import engine, Base
from app.models.compliance import ComplianceResult
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_compliance_schema():
    """Drop and recreate the compliance_results table to apply the CASCADE delete constraint."""
    logger.info("Initiating Schema Repair Mission for Compliance Vault...")
    try:
        # Drop only the specific table
        ComplianceResult.__table__.drop(engine, checkfirst=True)
        logger.info("Legacy table decommissioned.")
        
        # Recreate it
        ComplianceResult.__table__.create(engine)
        logger.info("Autonomous schema reinforced with CASCADE integrity.")
    except Exception as e:
        logger.error(f"Schema Repair Failed: {e}")

if __name__ == "__main__":
    fix_compliance_schema()
