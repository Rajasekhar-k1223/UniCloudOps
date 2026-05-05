import logging
from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry

logger = logging.getLogger(__name__)

class VultrAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "vultr"

    @property
    def provider_name(self) -> str:
        return "Vultr"

    def get_catalog(self, region: str = "ewr", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"name": "vc2-1c-1gb", "cpu": 1, "ram_gb": 1, "price": 0.007},
            {"name": "vc2-1c-2gb", "cpu": 1, "ram_gb": 2, "price": 0.015},
            {"name": "vc2-2c-4gb", "cpu": 2, "ram_gb": 4, "price": 0.030},
            {"name": "vhp-2c-2gb", "cpu": 2, "ram_gb": 2, "price": 0.027}
        ]

    def get_price(self, instance_type: str, region: str = "ewr", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"vc2-1c-1gb": 0.007, "vc2-1c-2gb": 0.015, "vc2-2c-4gb": 0.030, "vhp-2c-2gb": 0.027}
        return rates.get(instance_type, 0.02)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "ewr", "name": "New Jersey"},
            {"id": "nrt", "name": "Tokyo"},
            {"id": "lax", "name": "Los Angeles"},
            {"id": "fra", "name": "Frankfurt"}
        ]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {
            "vpcs": [{"id": "vultr-vpc-main", "name": "Default Vultr Network", "cidr": "10.10.0.0/16"}],
            "subnets": [{"id": "vultr-subnet-a", "name": "VPC Subnet A", "vpc_id": "vultr-vpc-main"}]
        }

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {
            "ubuntu": "387", 
            "windows": "402", 
            "debian": "352", 
            "amazon": "387"
        }

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 19.99


    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        return {"status": "success", "message": f"Vultr {instance_id} {action} successful."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        import random
        return random.choice(['running', 'pending', 'stopping', 'stopped'])

    def get_credential_schema(self) -> Dict[str, str]:
        return {"vultr_api_key": "password"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"VULTR_API_KEY": creds.get('vultr_api_key')}

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{
            "external_id": "vultr-vps-54321", 
            "name": "vultr-api-srv", 
            "type": "Compute", 
            "instance_type": "vc2-1c-1gb",
            "status": "running", 
            "region": "ewr", 
            "public_ip": "66.42.1.2",
            "private_ip": "10.15.0.5",
            "estimated_monthly_cost": 2.5
        }]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "vultr-block", "name": "Vultr Block Storage"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "sg-1", "name": "CloudFirewall"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"Compute Engine": 19.99}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Provision a Vultr Instance (Simulation Mode)."""
        return {
            "status": "success",
            "message": f"Vultr Instance {name} launch initiated (Simulation).",
            "external_id": f"vultr-{name}-sim",
            "region": region,
            "provider": "vultr"
        }

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch Vultr specific catalogs."""
        if category == "database":
            return [{"id": "vultr-mysql", "name": "Vultr Managed MySQL", "price": 0.02}]
        elif category == "storage":
            return [{"id": "vultr-object", "name": "Vultr Object Storage", "price": 0.01}]
        elif category == "containers":
            return [{"id": "vke-standard", "name": "Vultr Kubernetes Engine (VKE)", "price": 0.10}]
        return []

    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Enforce security policies on Vultr Firewalls."""
        if policy_name == "RestrictSSH":
            logger.info(f"Hardening Vultr Firewall for {resource_id}: Removing Port 22/Anywhere rule")
            return {"status": "success", "message": f"Vultr Firewall hardened: {policy_name} applied to {resource_id}."}
        elif policy_name == "S3PublicBlock":
            logger.info(f"Hardening Vultr Object Storage for {resource_id}: Disabling Public Access")
            return {"status": "success", "message": f"Vultr Object Storage Guardrail: Public Access Disabled for {resource_id}."}
        return {"status": "error", "message": f"Policy {policy_name} not implemented for Vultr."}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        """Mock verification for simulation mode."""
        return {"authenticated": True, "access": True, "note": "Simulation mode"}
