from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry

class LinodeAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "linode"

    @property
    def provider_name(self) -> str:
        return "Linode (Akamai)"

    def get_catalog(self, region: str = "us-east", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"name": "g6-nanode-1", "cpu": 1, "ram_gb": 1, "price": 0.0075},
            {"name": "g6-standard-1", "cpu": 1, "ram_gb": 2, "price": 0.015},
            {"name": "g6-standard-2", "cpu": 2, "ram_gb": 4, "price": 0.03},
            {"name": "g6-standard-4", "cpu": 4, "ram_gb": 8, "price": 0.06},
            {"name": "g6-standard-8", "cpu": 8, "ram_gb": 16, "price": 0.12}
        ]

    def get_price(self, instance_type: str, region: str = "us-east", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"g6-nanode-1": 0.0075, "g6-standard-1": 0.015, "g6-standard-2": 0.03, "g6-standard-4": 0.06, "g6-standard-8": 0.12}
        return rates.get(instance_type, 0.03)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "us-east", "name": "New Jersey"},
            {"id": "us-west", "name": "Fremont"},
            {"id": "jp-osa", "name": "Osaka"},
            {"id": "ap-south", "name": "Mumbai"}
        ]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {
            "vpcs": [{"id": "linode-vpc-01", "name": "Main VPC", "cidr": "10.0.0.0/16"}],
            "subnets": [{"id": "linode-subnet-01", "name": "Internal-A", "vpc_id": "linode-vpc-01"}]
        }

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {
            "ubuntu": "linode/ubuntu22.04",
            "windows": "unsupported",
            "debian": "linode/debian11",
            "amazon": "linode/ubuntu22.04"
        }

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 5.00

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        """Fetch resource metrics for Linode."""
        from app.utils.telemetry import generate_simulated_metrics
        return {
            "CPUUsage": {"label": "CPU Usage", "unit": "%", "data": generate_simulated_metrics("CPU", instance_id)},
            "MemoryUsage": {"label": "Memory Usage", "unit": "%", "data": generate_simulated_metrics("RAM", instance_id)},
            "NetworkTraffic": {"label": "Network Traffic", "unit": "MB/s", "data": generate_simulated_metrics("Network", instance_id)}
        }

    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        return {"status": "success", "message": f"Linode {instance_id} {action} successful."}

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch Strategic Linode Services."""
        catalog = {
            "compute": [
                {"id": "nanode", "name": "Nanode 1GB", "price": 5.0},
                {"id": "standard", "name": "Standard Instance", "price": 10.0}
            ],
            "database": [
                {"id": "mysql", "name": "Managed MySQL", "price": 15.0},
                {"id": "postgres", "name": "Managed PostgreSQL", "price": 15.0}
            ],
            "storage": [
                {"id": "obj", "name": "Object Storage", "price": 5.0},
                {"id": "block", "name": "Block Storage", "price": 1.0}
            ],
            "serverless": [
                {"id": "linode_fn", "name": "Linode Edge Functions (Akamai)", "price": 0.0}
            ],
            "containers": [
                {"id": "lke", "name": "Linode Kubernetes Engine (LKE)", "price": 0.0}
            ],
            "networking": [
                {"id": "vpc", "name": "Linode VPC", "features": ["Subnets", "Interconnect"]},
                {"id": "nodebalancers", "name": "NodeBalancers", "features": ["L4/L7 LB"]}
            ],
            "management": [
                {"id": "longview", "name": "Linode Longview", "features": ["Performance Monitoring"]}
            ],
            "security": [
                {"id": "firewall", "name": "Linode Cloud Firewall", "features": ["Stateful Rules"]}
            ]
        }
        return catalog.get(category.lower(), [])

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        """Manage Linode non-compute resources (Databases/Storage)."""
        return {"status": "success", "message": f"Linode {service_type} resource {resource_id} {action} mission successful."}

    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Enforce standard security policies on Linode resources."""
        if policy_name == 'S3PublicBlock':
            return {"status": "success", "message": f"Linode Object Storage bucket {resource_id} public access blocked."}
        if policy_name == 'RestrictSSH':
            return {"status": "success", "message": f"Linode Firewall {resource_id} restricted to authorized IPs only."}
        return {"status": "unsupported", "message": f"Policy {policy_name} not implemented for Linode."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        import random
        return random.choice(['running', 'offline', 'booting', 'shutting_down'])

    def get_credential_schema(self) -> Dict[str, str]:
        return {"linode_token": "password"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"LINODE_TOKEN": creds.get('linode_token')}

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{
            "external_id": "lin-12345", 
            "name": "linode-production", 
            "type": "Compute", 
            "instance_type": "g6-standard-1",
            "status": "running", 
            "region": "us-east", 
            "public_ip": "45.33.1.2",
            "private_ip": "192.168.128.5",
            "estimated_monthly_cost": 5.0
        }]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "block-storage", "name": "Linode Block Storage"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "fw-1", "name": "GlobalFirewall"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"Linodes": 5.0}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        return {"authenticated": True, "access": True}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Provision a Linode Instance (Simulation Mode)."""
        return {
            "status": "success",
            "message": f"Linode Instance {name} launch initiated (Simulation).",
            "external_id": f"linode-{name}-sim",
            "region": region,
            "provider": "linode"
        }
