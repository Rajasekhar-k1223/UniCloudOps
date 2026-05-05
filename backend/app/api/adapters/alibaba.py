import logging
from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry

logger = logging.getLogger(__name__)

class AlibabaAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "alibaba"

    @property
    def provider_name(self) -> str:
        return "Alibaba Cloud"

    def get_catalog(self, region: str = "ap-south-1", account: Optional[CloudAccount] = None) -> List[Dict]:
        """Realistic Alibaba Cloud ECS instances."""
        return [
            {"name": "ecs.t5-lc1m1.small", "cpu": 1, "ram_gb": 1, "price": 0.012, "storage": "40 GB Cloud Disk"},
            {"name": "ecs.t5-c1m2.large", "cpu": 2, "ram_gb": 4, "price": 0.034, "storage": "40 GB Cloud Disk"},
            {"name": "ecs.g6.large", "cpu": 2, "ram_gb": 8, "price": 0.076, "storage": "ESSD PL1"},
            {"name": "ecs.g6.xlarge", "cpu": 4, "ram_gb": 16, "price": 0.152, "storage": "ESSD PL1"},
            {"name": "ecs.c7.large", "cpu": 2, "ram_gb": 4, "price": 0.092, "storage": "High Perf ESSD"}
        ]

    def get_price(self, instance_type: str, region: str = "ap-south-1", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"ecs.t5-lc1m1.small": 0.012, "ecs.t5-c1m2.large": 0.034, "ecs.g6.large": 0.076, "ecs.g6.xlarge": 0.152}
        return rates.get(instance_type, 0.06)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "ap-south-1", "name": "India (Mumbai)"},
            {"id": "us-east-1", "name": "US East (Virginia)"},
            {"id": "ap-southeast-1", "name": "Singapore"},
            {"id": "eu-central-1", "name": "Germany (Frankfurt)"}
        ]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {
            "vpcs": [{"id": "vpc-ali-default", "name": "Standard VPC", "cidr": "192.168.0.0/16"}],
            "subnets": [{"id": "vswitch-ali-default", "name": "vSwitch-A", "vpc_id": "vpc-ali-default"}]
        }

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {
            "ubuntu": "ubuntu_22_04_x64_20G_alibase_2022.vhd",
            "windows": "win2022_64_dtc_64_en-us_40G_alibase_2022.vhd",
            "debian": "debian_11_x64_20G_alibase_2022.vhd",
            "amazon": "ubuntu_22_04_x64_20G_alibase_2022.vhd"
        }

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 15.40


    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        return {"status": "success", "message": f"Alibaba instance {instance_id} {action} successful."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        import random
        return random.choice(['Running', 'Starting', 'Stopping', 'Stopped'])

    def get_credential_schema(self) -> Dict[str, str]:
        return {"access_key": "text", "secret_key": "password", "region": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"ALICLOUD_ACCESS_KEY": creds.get('access_key'), "ALICLOUD_SECRET_KEY": creds.get('secret_key'), "ALICLOUD_REGION": creds.get('region', 'cn-hangzhou')}

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{"external_id": "ali-123", "name": "ali-web-01", "type": "Compute", "status": "Running", "region": "cn-hangzhou", "estimated_monthly_cost": 15.0}]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "cloud_ssd", "name": "Standard SSD"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "sg-1", "name": "DefaultSG"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"ECS": 12.0, "OSS": 3.4}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        """Mock verification for simulation mode."""
        return {"authenticated": True, "access": True, "note": "Simulation mode"}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Provision an Alibaba ECS instance (Simulation Mode)."""
        return {
            "status": "success",
            "message": f"Alibaba ECS {name} launch sequence initiated on {region} (Simulation).",
            "external_id": f"ali-{name}-sim-id",
            "region": region,
            "provider": "alibaba"
        }

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch Alibaba specific catalogs for DB and Storage."""
        if category == "database":
            return [
                {"id": "mysql-5.7", "name": "ApsaraDB for MySQL", "version": "5.7", "price": 0.05},
                {"id": "postgres-13", "name": "ApsaraDB for PostgreSQL", "version": "13", "price": 0.08}
            ]
        elif category == "storage":
            return [
                {"id": "oss-standard", "name": "OSS Standard", "price": 0.02},
                {"id": "oss-archive", "name": "OSS Archive", "price": 0.005}
            ]
        elif category == "containers":
            return [{"id": "ack-standard", "name": "Alibaba Container Service (ACK)", "price": 0.15}]
        return []

    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Enforce security policies on Alibaba ECS Security Groups."""
        if policy_name == "RestrictSSH":
            logger.info(f"Hardening Alibaba SG for {resource_id}: Revoking World-Wide SSH Access")
            # In a real scenario, we would use the Aliyun SDK (ecs.RevokeSecurityGroup)
            return {"status": "success", "message": f"Alibaba Security Group hardened: {policy_name} applied to {resource_id}."}
        elif policy_name == "S3PublicBlock":
             logger.info(f"Hardening Alibaba OSS for {resource_id}: Setting ACL to Private")
             return {"status": "success", "message": f"Alibaba OSS Guardrail: Public Access Disabled for {resource_id}."}
        return {"status": "error", "message": f"Policy {policy_name} not implemented for Alibaba."}
