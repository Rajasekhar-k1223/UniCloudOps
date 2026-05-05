import logging
from typing import Dict, List, Optional
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter, list_adapters

logger = logging.getLogger(__name__)

class PricingService:
    def __init__(self, db_session=None):
        self.db = db_session

    def get_cloud_catalog(self, provider: str, region: str = "us-east-1", account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch instance catalog for a specific provider using its adapter."""
        adapter = get_adapter(provider)
        if not adapter:
            logger.warning(f"No adapter found for provider: {provider}")
            return []
        
        try:
            return adapter.get_catalog(region, account)
        except Exception as e:
            logger.error(f"Error fetching catalog for {provider}: {e}")
            return []

    def get_global_catalog(self, region_map: Optional[Dict[str, str]] = None, accounts: List[CloudAccount] = []) -> Dict[str, List[Dict]]:
        """Fetch catalogs from all registered providers simultaneously."""
        global_catalog = {}
        for adapter in list_adapters():
            pid = adapter.provider_id
            region = region_map.get(pid, "us-east-1") if region_map else "us-east-1"
            account = next((a for a in accounts if a.provider == pid), None)
            global_catalog[pid] = self.get_cloud_catalog(pid, region, account)
        return global_catalog

    def compare_compute_rates(self, accounts: List[CloudAccount]) -> List[Dict]:
        """Generate a comparison matrix across all 10+ registered cloud providers."""
        profiles = [
            {"tier": "Micro", "specs": "1 vCPU, 1GB RAM", "target": {"cpu": 1, "ram": 1}},
            {"tier": "Small", "specs": "2 vCPU, 2GB-4GB RAM", "target": {"cpu": 2, "ram": 2}},
            {"tier": "Medium", "specs": "2 vCPU, 8GB RAM", "target": {"cpu": 2, "ram": 8}},
            {"tier": "Large", "specs": "4 vCPU, 16GB RAM", "target": {"cpu": 4, "ram": 16}},
            {"tier": "X-Large", "specs": "8 vCPU, 32GB RAM", "target": {"cpu": 8, "ram": 32}},
        ]

        results = []
        adapters = list_adapters()

        for p in profiles:
            row = {
                "tier": p['tier'],
                "specs": p['specs'],
                "rates": {},
                "details": {}
            }
            
            for adapter in adapters:
                pid = adapter.provider_id
                account = next((a for a in accounts if a.provider == pid), None)
                
                # Fetch catalog to find best match
                catalog = adapter.get_catalog(account=account)
                
                # Simple matching logic: first instance that meets or exceeds specs
                match = next((
                    item for item in catalog 
                    if item.get('cpu', 0) >= p['target']['cpu'] and 
                    (item.get('ram_gb') or item.get('ram', 0)) >= p['target']['ram']
                ), None)
                
                if match:
                    row["rates"][pid] = round(match.get('price', 0), 4)
                    row["details"][pid] = {
                        "type": match['name'],
                        "region": "default",
                        "match_quality": "exact" if match['cpu'] == p['target']['cpu'] else "upsized"
                    }
                else:
                    row["rates"][pid] = "N/A"

            results.append(row)
        
        return results
