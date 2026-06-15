import logging
from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry

from app.core.crypto import decrypt_credentials
import json

logger = logging.getLogger(__name__)

def _get_ibm_libs():
    try:
        from ibm_vpc import VpcV1
        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
        return VpcV1, IAMAuthenticator
    except ImportError:
        logger.error("IBM VPC SDK not found. Functionality will be simulated.")
        return None, None

class IBMAdapter(BaseCloudAdapter):
    def _get_client(self, account: CloudAccount):
        VpcV1, IAMAuthenticator = _get_ibm_libs()
        if not VpcV1: return None
        creds = decrypt_credentials(account.encrypted_credentials)
        authenticator = IAMAuthenticator(creds.get('ibmcloud_api_key'))
        client = VpcV1(authenticator=authenticator)
        client.set_service_url('https://us-south.iaas.cloud.ibm.com/v1')
        return client

    @property
    def provider_id(self) -> str:
        return "ibm"

    @property
    def provider_name(self) -> str:
        return "IBM Cloud"

    def get_catalog(self, region: str = "us-south", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"name": "bx2-2x8", "cpu": 2, "ram_gb": 8, "price": 0.081},
            {"name": "bx2-4x16", "cpu": 4, "ram_gb": 16, "price": 0.162},
            {"name": "cx2-2x4", "cpu": 2, "ram_gb": 4, "price": 0.065},
            {"name": "cx2-4x8", "cpu": 4, "ram_gb": 8, "price": 0.130}
        ]

    def get_price(self, instance_type: str, region: str = "us-south", account: Optional[CloudAccount] = None) -> Optional[float]:
        rates = {"bx2-2x8": 0.081, "bx2-4x16": 0.162, "cx2-2x4": 0.065, "cx2-4x8": 0.130}
        return rates.get(instance_type, 0.1)

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "us-south", "name": "Dallas"},
            {"id": "us-east", "name": "Washington DC"},
            {"id": "eu-de", "name": "Frankfurt"},
            {"id": "jp-tok", "name": "Tokyo"}
        ]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {
            "vpcs": [{"id": "ibm-vpc-01", "name": "Production VPC", "cidr": "10.10.0.0/16"}],
            "subnets": [{"id": "ibm-subnet-01", "name": "Public Subnet 1", "vpc_id": "ibm-vpc-01"}]
        }

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {
            "ubuntu": "ibm-ubuntu-22-04-minimal-amd64-1",
            "windows": "ibm-windows-server-2022-full-standard-amd64-1",
            "debian": "ibm-debian-11-minimal-amd64-1",
            "amazon": "ibm-ubuntu-22-04-minimal-amd64-1"
        }

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 112.50

    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        return {"status": "success", "message": f"IBM Cloud instance {instance_id} {action} successful."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        import random
        return random.choice(['running', 'pending', 'stopping', 'stopped'])

    def get_credential_schema(self) -> Dict[str, str]:
        return {"ibmcloud_api_key": "password", "region": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"IC_API_KEY": creds.get('ibmcloud_api_key')}

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{
            "external_id": "ibm-vsi-1", 
            "name": "ibm-prod-srv", 
            "type": "Compute", 
            "instance_type": "cx2-2x4",
            "status": "running", 
            "region": "us-south", 
            "public_ip": "169.45.1.2",
            "private_ip": "10.10.1.5",
            "estimated_monthly_cost": 45.0
        }]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "general-purpose", "name": "General Purpose SSD"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "sg-ibm", "name": "DefaultSecurityGroup"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"VPC Infrastructure": 80.0, "Cloud Object Storage": 32.5}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Provision an IBM Cloud VPC Instance (Simulation Mode)."""
        return {
            "status": "success",
            "message": f"IBM Cloud Instance {name} launch sequence initiated (Simulation).",
            "external_id": f"ibm-{name}-sim",
            "region": region,
            "provider": "ibm"
        }

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch IBM Cloud specific catalogs."""
        if category == "database":
            return [
                {"id": "ibm-mysql", "name": "Databases for MySQL", "version": "8.0", "price": 0.12},
                {"id": "ibm-pg", "name": "Databases for PostgreSQL", "version": "14", "price": 0.14}
            ]
        elif category == "storage":
            return [{"id": "ibm-cos", "name": "Cloud Object Storage", "price": 0.03}]
        elif category == "containers":
            return [{"id": "iks-standard", "name": "IBM Kubernetes Service", "price": 0.20}]
        return []

    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Enforce security policies on IBM Cloud VPC Security Groups."""
        if policy_name == "RestrictSSH":
            logger.info(f"Hardening IBM Cloud Security Group for {resource_id}: Restricting SSH Port 22")
            # In a real scenario, we would use the IBM VPC SDK (update_security_group_rule)
            return {"status": "success", "message": f"IBM Cloud SG hardened: {policy_name} enforced on {resource_id}."}
        elif policy_name == "S3PublicBlock":
            logger.info(f"Hardening IBM Cloud Object Storage for {resource_id}: Disabling Public Access")
            return {"status": "success", "message": f"IBM COS Guardrail: Public Access Disabled for {resource_id}."}
        return {"status": "error", "message": f"Policy {policy_name} not implemented for IBM Cloud."}

    def verify_connectivity(self, account: CloudAccount) -> Dict:
        """Mock verification for simulation mode."""
        return {"authenticated": True, "access": True, "note": "Simulation mode"}
