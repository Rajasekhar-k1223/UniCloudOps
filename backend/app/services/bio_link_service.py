import logging
from typing import List, Dict
import random
from datetime import datetime
from app.db.session import SessionLocal
from app.models.bio_link import OperatorBioLink

logger = logging.getLogger(__name__)

class BioLinkService:
    """
    Neural Bio-Link Service.
    Analyzes operator behavioral telemetry and enforces sovereign cognitive lockdown.
    """
    def __init__(self):
        self.fallback_lockdown_status = "Unlocked"
    
    def get_operator_telemetry(self) -> Dict:
        """Retrieve current operator behavioral and cognitive telemetry."""
        db = SessionLocal()
        try:
            op = db.query(OperatorBioLink).filter(OperatorBioLink.operator_id == "COMMANDER-ALPHA").first()
            if op:
                return {
                    "status": "biolink_active",
                    "operator_id": op.operator_id,
                    "cognitive_stability": op.cognitive_stability if op.lockdown_status == "Unlocked" else 12.5,
                    "command_rhythm": op.command_rhythm if op.lockdown_status == "Unlocked" else "Disrupted",
                    "decision_latency": op.decision_latency if op.lockdown_status == "Unlocked" else "5800ms",
                    "stress_marker": op.stress_marker if op.lockdown_status == "Unlocked" else "Critical",
                    "lockdown_status": op.lockdown_status,
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            logger.warning(f"Database offline: reading vitals from fallback cache. Error: {e}")
        finally:
            db.close()

        return {
            "status": "biolink_active",
            "operator_id": "COMMANDER-ALPHA",
            "cognitive_stability": 98.4 if self.fallback_lockdown_status == "Unlocked" else 12.5,
            "command_rhythm": "Stable" if self.fallback_lockdown_status == "Unlocked" else "Disrupted",
            "decision_latency": "140ms" if self.fallback_lockdown_status == "Unlocked" else "5800ms",
            "stress_marker": "Low" if self.fallback_lockdown_status == "Unlocked" else "Critical",
            "lockdown_status": self.fallback_lockdown_status,
            "timestamp": datetime.now().isoformat()
        }

    def trigger_lockdown(self) -> Dict:
        """Initiate a Sovereign Lockdown across all mission orbits."""
        db = SessionLocal()
        try:
            op = db.query(OperatorBioLink).filter(OperatorBioLink.operator_id == "COMMANDER-ALPHA").first()
            if op:
                op.lockdown_status = "Locked"
                db.commit()
        except Exception as e:
            logger.warning(f"Database offline: locking fallback cache. Error: {e}")
            self.fallback_lockdown_status = "Locked"
        finally:
            db.close()

        return {
            "status": "lockdown_active",
            "scope": "Global-Galactic-Mesh",
            "authentication_required": "Multi-Factor-Biometric",
            "timestamp": datetime.now().isoformat(),
            "message": "SOVEREIGN LOCKDOWN INITIATED. Behavioral variance detected. All mission control interfaces are now secured."
        }

bio_link_service = BioLinkService()
