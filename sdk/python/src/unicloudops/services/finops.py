from typing import List, Dict, Any, Optional
from unicloudops.core.client import UnicloudHTTPClient

class FinOpsService:
    def __init__(self, client: UnicloudHTTPClient):
        self._client = client

    def get_costs(self, time_range: str = "7d") -> Dict[str, Any]:
        """Retrieve aggregated cloud costs."""
        return self._client.request("GET", f"/api/v1/finops/analytics/costs?time_range={time_range}")

    def get_budgets(self) -> List[Dict[str, Any]]:
        """Retrieve active budgets and their consumption."""
        return self._client.request("GET", "/api/v1/finops/analytics/budgets")

    def get_recommendations(self) -> List[Dict[str, Any]]:
        """Retrieve AI-driven rightsizing and idle resource recommendations."""
        return self._client.request("GET", "/api/v1/finops/analytics/recommendations")
