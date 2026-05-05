from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry

class ContaboAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "contabo"

    @property
    def provider_name(self) -> str:
        return "Contabo"

    def get_catalog(self, region: str = "eur", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"name": "VPS S", "cpu": 4, "ram_gb": 8, "price": 0.0082},
            {"name": "VPS M", "cpu": 6, "ram_gb": 16, "price": 0.0157},
            {"name": "VPS L", "cpu": 8, "ram_gb": 30, "price": 0.0274},
            {"name": "VPS XL", "cpu": 10, "ram_gb": 60, "price": 0.0479}
        ]

    def get_price(self, instance_type: str, region: str = "eur", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"VPS S": 0.0082, "VPS M": 0.0157, "VPS L": 0.0274, "VPS XL": 0.0479}
        return rates.get(instance_type, 0.015)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "eur", "name": "European Union (Germany)"},
            {"id": "usa", "name": "United States (Central)"},
            {"id": "sin", "name": "Singapore"},
            {"id": "aus", "name": "Australia"}
        ]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {
            "vpcs": [{"id": "vps-network", "name": "Contabo Private Network", "cidr": "10.0.0.0/24"}],
            "subnets": [{"id": "vps-subnet", "name": "Main Subnet", "vpc_id": "vps-network"}]
        }

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {
            "ubuntu": "ubuntu-22.04",
            "windows": "windows-server-2022",
            "debian": "debian-11",
            "amazon": "ubuntu-22.04"
        }

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 5.99


    @universal_retry()
    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Returns a comprehensive Contabo service catalog."""
        catalog = {
            "compute": [
                {"id": "cloud_vps", "name": "Cloud VPS", "description": "High-performance virtual private servers.", "icon": "cpu"},
                {"id": "vds", "name": "Virtual Dedicated Server (VDS)", "description": "Dedicated resources with cloud flexibility.", "icon": "zap"}
            ],
            "storage": [
                {"id": "object_storage", "name": "Contabo Object Storage", "description": "S3-compatible object storage.", "icon": "archive"}
            ],
            "database": [
                {"id": "managed_mongodb", "name": "Managed MongoDB", "description": "Fully managed NoSQL database.", "icon": "database"}
            ],
            "networking": [
                {"id": "private_network", "name": "Private Networking", "description": "Isolated network for your instances.", "icon": "shield"}
            ]
        }
        return catalog.get(category.lower(), [])

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        return {"status": "success", "message": f"Contabo {service_type} action {action} completed."}

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        """Returns standardized simulated metrics for Contabo."""
        from app.utils.telemetry import get_standard_telemetry
        return get_standard_telemetry(instance_id)

    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        """Lifecycle actions for Contabo VPS (Simulation)."""
        return {"status": "success", "message": f"Contabo {action} initiated for {instance_id}."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        return 'running'

    def get_credential_schema(self) -> Dict[str, str]:
        return {
            "oauth_client_id": "text", 
            "oauth_client_secret": "password",
            "api_user": "text",
            "api_password": "password"
        }

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {
            "CONTABO_OAUTH_CLIENT_ID": creds.get('oauth_client_id'),
            "CONTABO_OAUTH_CLIENT_SECRET": creds.get('oauth_client_secret'),
            "CONTABO_API_USERNAME": creds.get('api_user'),
            "CONTABO_API_PASSWORD": creds.get('api_password')
        }

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{
            "external_id": "contabo-vps-999", 
            "name": "contabo-main", 
            "type": "Compute", 
            "instance_type": "vps-s",
            "status": "running", 
            "region": "eur", 
            "public_ip": "161.97.1.2",
            "private_ip": "10.2.0.5",
            "estimated_monthly_cost": 5.99
        }]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "ssd", "name": "NVMe Storage"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "default", "name": "Standard Policy"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"VPS S": 5.99}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        """Mock verification for simulation mode."""
        return {"authenticated": True, "access": True, "note": "Simulation mode"}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Provision a Contabo VPS (Simulation Mode)."""
        return {
            "status": "success",
            "message": f"Contabo VPS {name} creation initiated (Simulation).",
            "external_id": f"contabo-{name}-sim",
            "region": region,
            "provider": "contabo"
        }


    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Enforce security policies on Contabo Instances."""
        if policy_name == "RestrictSSH":
            return {"status": "success", "message": f"Contabo Instance hardened: {policy_name} applied to {resource_id}."}
        elif policy_name == "S3PublicBlock":
             return {"status": "success", "message": f"Contabo Storage Guardrail: {policy_name} enforced on {resource_id}."}
        return {"status": "error", "message": f"Policy {policy_name} not implemented for Contabo."}

    def get_daily_costs(self, days: int = 7, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch daily cost trend for Contabo missions (Simulated)."""
        from datetime import datetime, timedelta
        import random
        trends = []
        for i in range(days, -1, -1):
            date_str = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            # Contabo has very flat, predictable pricing
            cost = 5.99 / 30.0 + random.uniform(0.01, 0.05)
            trends.append({
                "date": date_str,
                "contabo": round(cost, 2)
            })
        return trends

    def get_clusters(self, account: CloudAccount) -> List[Dict]: return []
    def get_functions(self, account: CloudAccount) -> List[Dict]: return []
    def update_resource_tags(self, resource_id: str, tags: Dict[str, str], region: str, account: CloudAccount) -> Dict: return {"status": "unsupported"}
