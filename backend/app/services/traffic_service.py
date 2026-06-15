import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class TrafficService:
    """
    Global Warp Traffic Controller Service.
    Orchestrates inter-cloud traffic shifting based on AI tactical signals.
    """
    
    def __init__(self):
        # Simulation state: percentages of traffic per provider
        self.current_weights = {
            "aws": 60,
            "azure": 30,
            "oci": 10
        }

    def get_current_traffic(self) -> Dict:
        """Retrieve current traffic distribution and health metrics."""
        return {
            "distribution": self.current_weights,
            "health": {
                "aws": "optimal",
                "azure": "degraded",
                "oci": "optimal"
            },
            "latency": {
                "aws": "12ms",
                "azure": "45ms",
                "oci": "18ms"
            }
        }

    def shift_traffic(self, provider: str, target_weight: int) -> Dict:
        """
        Dynamically shift traffic weight to a specific provider.
        Adjusts others proportionally.
        """
        if provider not in self.current_weights:
            return {"status": "error", "message": f"Provider {provider} not recognized in mission mesh."}

        target_weight = max(0, min(100, target_weight))
        old_weight = self.current_weights[provider]
        diff = target_weight - old_weight
        
        # Proportional adjustment for others
        others = [p for p in self.current_weights if p != provider]
        total_others = sum(self.current_weights[o] for o in others)
        
        if total_others > 0:
            for o in others:
                adjustment = (self.current_weights[o] / total_others) * diff
                self.current_weights[o] = max(0, self.current_weights[o] - adjustment)
        
        self.current_weights[provider] = target_weight
        
        # Normalize to 100
        total = sum(self.current_weights.values())
        for p in self.current_weights:
            self.current_weights[p] = round((self.current_weights[p] / total) * 100)

        return {
            "status": "success",
            "message": f"Global Warp engaged. Traffic shifted to {provider} ({target_weight}%).",
            "distribution": self.current_weights
        }

traffic_service = TrafficService()
