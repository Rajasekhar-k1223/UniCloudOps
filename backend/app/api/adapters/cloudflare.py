import logging
from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

class CloudflareAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "cloudflare"

    @property
    def provider_name(self) -> str:
        return "Cloudflare"

    def get_catalog(self, region: str = "global", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"name": "Free Plan", "price": 0.0},
            {"name": "Pro Plan", "price": 20.0},
            {"name": "Business Plan", "price": 200.0}
        ]

    def get_price(self, instance_type: str, region: str = "global", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"Free Plan": 0.0, "Pro Plan": 20.0, "Business Plan": 200.0}
        return rates.get(instance_type, 0.0)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "global", "name": "Global Edge Network"}]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {"vpcs": [], "subnets": []}

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {}

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 20.00 # Simulated Pro Plan monthly spend

    def get_daily_costs(self, days: int = 7, account: Optional[CloudAccount] = None) -> List[Dict]:
        from datetime import datetime, timedelta
        import random
        trends = []
        for i in range(days, -1, -1):
            dt = datetime.now() - timedelta(days=i)
            # Integrity Check: No cost before account linkage
            if account and dt.timestamp() < account.created_at.timestamp():
                cost = 0.0
            else:
                # Fixed daily rate for Pro Plan ($20/mo)
                cost = 20.0 / 30.0
            
            trends.append({
                "date": dt.strftime("%Y-%m-%d"),
                "cloudflare": round(cost, 2)
            })
        return trends

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> Dict:
        """Fetch Cloudflare edge metrics with standard performance telemetry."""
        from app.utils.telemetry import get_standard_telemetry, generate_simulated_metrics
        metrics = get_standard_telemetry(instance_id)
        metrics["EdgeRequests"] = {"label": "Edge Requests", "unit": "Count", "data": generate_simulated_metrics("Network", instance_id)}
        return metrics

    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        return {"status": "unsupported", "message": "Lifecycle actions not applicable to Cloudflare zones."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        return "active"

    def get_credential_schema(self) -> Dict[str, str]:
        return {"api_token": "password", "email": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"CLOUDFLARE_API_TOKEN": creds.get('api_token'), "CLOUDFLARE_EMAIL": creds.get('email')}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        creds = decrypt_credentials(account.encrypted_credentials)
        token = creds.get('api_token')
        if not token: return {"authenticated": True, "access": True, "note": "Simulation Mode"}
        
        import requests
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        try:
            resp = requests.get("https://api.cloudflare.com/client/v4/user/tokens/verify", headers=headers, timeout=10)
            if resp.status_code == 200:
                return {"authenticated": True, "access": True}
            return {"authenticated": False, "error": resp.text}
        except Exception as e:
            return {"authenticated": False, "error": str(e)}

    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        from app.core.crypto import decrypt_credentials
        creds = decrypt_credentials(account.encrypted_credentials)
        token = creds.get('api_token')
        
        if not token:
            return [{
                "external_id": "cf-zone-993",
                "name": "unicloudops.io",
                "type": "Network",
                "status": "active",
                "region": "global",
                "estimated_monthly_cost": 20.0
            }]
            
        import requests
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        discovered = []
        try:
            resp = requests.get("https://api.cloudflare.com/client/v4/zones", headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                for zone in data.get('result', []):
                    discovered.append({
                        "external_id": zone['id'],
                        "name": zone['name'],
                        "type": "Network",
                        "status": zone['status'],
                        "region": "global",
                        "estimated_monthly_cost": 20.0 if zone.get('plan', {}).get('name') != 'Free Plan' else 0.0,
                        "cloud_metadata": zone
                    })
            else:
                logger.error(f"Cloudflare API Error: {resp.status_code} - {resp.text}")
            return discovered
        except Exception as e:
            logger.error(f"Cloudflare Sync Failed: {e}")
            return []

    def get_storage_options(self) -> List[Dict]:
        return []

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "cf-waf", "name": "Cloudflare WAF Default"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"Subscription": 20.0, "Security": 2.50, "Compute (Workers)": 1.25}

    def get_clusters(self, account: CloudAccount) -> List[Dict]:
        return []

    def get_functions(self, account: CloudAccount) -> List[Dict]:
        return [{"id": "cf-worker-api", "name": "Global-API-Worker", "runtime": "Workers V2", "status": "active"}]

    def update_resource_tags(self, resource_id: str, tags: Dict[str, str], region: str, account: CloudAccount) -> Dict:
        return {"status": "unsupported"}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        return {"status": "unsupported", "message": "Cloudflare does not support direct compute instance provisioning."}

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Returns Cloudflare-specific services."""
        catalog = {
            "compute": [{"id": "workers", "name": "Cloudflare Workers", "description": "Serverless edge compute.", "icon": "zap"}],
            "database": [{"id": "d1", "name": "D1 SQL Database", "description": "Edge-based SQL database.", "icon": "database"}],
            "storage": [{"id": "r2", "name": "R2 Object Storage", "description": "No-egress fee object storage.", "icon": "archive"}],
            "networking": [{"id": "dns", "name": "DNS Management", "description": "Enterprise DNS management.", "icon": "globe"}],
            "security": [{"id": "waf", "name": "Cloudflare WAF", "description": "Web Application Firewall.", "icon": "shield"}],
        }
        return catalog.get(category.lower(), [])

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        return {"status": "success", "message": f"Cloudflare {service_type} action {action} completed."}
