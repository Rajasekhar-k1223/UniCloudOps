import random
import logging
from typing import List, Dict, Optional
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

class EdgeAdapter(BaseCloudAdapter):
    """Sovereign Mission Adapter for Edge and Bare-Metal nodes."""
    
    @property
    def provider_id(self) -> str:
        return "edge"

    @property
    def provider_name(self) -> str:
        return "Sovereign Edge Node"

    def get_catalog(self, region: str = "local", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [
            {"id": "rpi4", "name": "Raspberry Pi 4 (Sovereign)", "cpu": 4, "ram_gb": 8},
            {"id": "xeon-edge", "name": "Xeon Industrial Edge", "cpu": 16, "ram_gb": 64},
            {"id": "bare-metal-mission", "name": "Bare Metal Mission Node", "cpu": 32, "ram_gb": 128}
        ]

    def get_price(self, instance_type: str, region: str = "local", account: Optional[CloudAccount] = None) -> Optional[float]:
        return 0.0 # Sovereign ownership means no hourly rent

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "on-prem-hq", "name": "Main Sovereign HQ"}]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {"vpcs": [{"id": "internal-mesh", "name": "Sovereign Mesh Network"}], "subnets": []}

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {"ubuntu": "ubuntu-22.04-sovereign", "debian": "debian-11-hardened"}

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 0.0 # Owned hardware

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> Dict:
        """Fetch edge node metrics with standard telemetry parity."""
        from app.utils.telemetry import get_standard_telemetry
        return get_standard_telemetry(instance_id)

    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        logger.info(f"Edge Node Action: {action} initiated for {instance_id}")
        return {"status": "success", "message": f"Edge node {action} successful via sovereign agent."}
    
    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        return "running"

    def get_credential_schema(self) -> Dict[str, str]:
        return {"ssh_key": "text", "agent_token": "text", "internal_ip": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {} # Edge usually uses Ansible/Custom agents instead of Terraform

    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        # Simulation: Discovering nodes registered with the agent
        return [
            {
                "external_id": "edge-node-01",
                "name": "HQ-Industrial-Pi",
                "type": "Edge-Compute",
                "instance_type": "rpi4",
                "region": "on-prem-hq",
                "status": "running",
                "public_ip": "N/A",
                "private_ip": "192.168.1.50",
                "metadata": {"os_type": "linux"}
            }
        ]

    def get_storage_options(self) -> List[Dict]:
        return [{"id": "local-ssd", "name": "Local Industrial SSD"}]

    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "internal-only", "name": "Internal Mesh Boundary"}]

    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        return {"Hardware Amortization": 0.0}

    def verify_connectivity(self, account: CloudAccount) -> Dict[str, bool]:
        return {"agent_handshake": True, "ssh_tunnel": True}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        return {"status": "unsupported", "message": "Edge nodes are provisioned via manual enrollment."}

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Returns Sovereign Edge-specific services."""
        catalog = {
            "compute": [{"id": "edge_vm", "name": "Edge VM Instance", "description": "High-performance edge compute.", "icon": "cpu"}],
            "storage": [{"id": "edge_storage", "name": "Edge Object Storage", "description": "Local-latency object storage.", "icon": "archive"}],
            "networking": [{"id": "edge_lb", "name": "Edge Load Balancer", "description": "Distributed traffic management.", "icon": "globe"}],
        }
        return catalog.get(category.lower(), [])

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        return {"status": "success", "message": f"Edge {service_type} action {action} completed."}
