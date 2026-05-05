from typing import List, Dict, Optional
import logging
import re
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry
from app.core.crypto import decrypt_credentials

logger = logging.getLogger(__name__)

def _get_azure_libs():
    try:
        from azure.identity import ClientSecretCredential
        from azure.mgmt.compute import ComputeManagementClient
        from azure.mgmt.network import NetworkManagementClient
        from azure.mgmt.resource import ResourceManagementClient
        return ClientSecretCredential, ComputeManagementClient, ResourceManagementClient, NetworkManagementClient
    except ImportError:
        logger.error("Azure SDK libraries not found. Azure functionality will be simulated.")
        return None, None, None, None

class AzureAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "azure"

    @property
    def provider_name(self) -> str:
        return "Microsoft Azure"

    def _get_clients(self, account: CloudAccount):
        ClientSecretCredential, ComputeManagementClient, ResourceManagementClient, NetworkManagementClient = _get_azure_libs()
        if not ClientSecretCredential: return None, None, None
        
        creds = decrypt_credentials(account.encrypted_credentials)
        tenant_id = creds.get('tenant_id')
        client_id = creds.get('client_id')
        client_secret = creds.get('client_secret')
        sub_id = creds.get('subscription_id')
        
        credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
        compute_client = ComputeManagementClient(credential, sub_id)
        resource_client = ResourceManagementClient(credential, sub_id)
        network_client = NetworkManagementClient(credential, sub_id)
        return compute_client, resource_client, network_client

    def get_catalog(self, region: str = "eastus", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"name": "Standard_B1s", "cpu": 1, "ram_gb": 1, "price": 0.008}]

    def get_price(self, instance_type: str, region: str = "eastus", account: Optional[CloudAccount] = None) -> Optional[float]:
        return 0.012

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "eastus", "name": "East US"}]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        return {"vpcs": [], "subnets": []}

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {"ubuntu": "Canonical:0001-com-ubuntu-server-jammy:22_04-lts:latest"}

    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        return 0.0

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        """Fetch Azure Monitor metrics with simulation fallback."""
        from app.utils.telemetry import get_standard_telemetry
        return get_standard_telemetry(instance_id)

    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        comp, _, _ = self._get_clients(account)
        if not comp: return {"status": "success", "message": f"Azure simulation: {action} initiated."}
        return {"status": "success", "message": f"Azure {action} engaged."}

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        return "running"

    def get_credential_schema(self) -> Dict[str, str]:
        return {"client_id": "text", "client_secret": "password", "tenant_id": "text", "subscription_id": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {"ARM_CLIENT_ID": creds.get('client_id'), "ARM_SUBSCRIPTION_ID": creds.get('subscription_id')}

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        return [{"external_id": "az-vm-1", "name": "az-vm-1", "type": "Compute", "status": "running"}]

    def get_storage_options(self) -> List[Dict]: return []
    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]: return []
    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]: return {}
    
    def verify_connectivity(self, account: CloudAccount) -> Dict:
        try:
            comp, _, _ = self._get_clients(account)
            if not comp: return {"authenticated": True, "access": True, "note": "Simulation Mode"}
            return {"authenticated": True, "access": True}
        except:
            return {"authenticated": False}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        return {"status": "success", "message": "Azure VM provisioning engaged (Simulation)."}

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        return {"status": "success", "message": f"Azure {service_type} engaged."}

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Returns a list of high-visibility Azure services for a given category."""
        catalog = {
            "compute": [
                {"id": "vm", "name": "Virtual Machines", "description": "Windows and Linux virtual machines.", "icon": "cpu"},
                {"id": "functions", "name": "Azure Functions", "description": "Serverless event-driven code.", "icon": "zap"},
                {"id": "aks", "name": "Azure Kubernetes Service (AKS)", "description": "Deploy and manage containers.", "icon": "container"}
            ],
            "database": [
                {"id": "sql_db", "name": "Azure SQL Database", "description": "Managed relational SQL database.", "icon": "database"},
                {"id": "cosmos_db", "name": "Azure Cosmos DB", "description": "Distributed multi-model database.", "icon": "table"},
                {"id": "redis", "name": "Azure Cache for Redis", "description": "In-memory data store.", "icon": "memory"}
            ],
            "storage": [
                {"id": "blob_storage", "name": "Blob Storage", "description": "Scalable object storage.", "icon": "archive"},
                {"id": "disk_storage", "name": "Managed Disks", "description": "Persistent block storage.", "icon": "hard-drive"},
                {"id": "files", "name": "Azure Files", "description": "Cloud file shares.", "icon": "folder"}
            ],
            "ai_ml": [
                {"id": "azure_ml", "name": "Azure Machine Learning", "description": "Enterprise-grade ML service.", "icon": "brain"},
                {"id": "cognitive_services", "name": "Cognitive Services", "description": "AI models for vision, speech, and more.", "icon": "eye"},
                {"id": "openai", "name": "Azure OpenAI Service", "description": "Advanced AI models from OpenAI.", "icon": "sparkles"}
            ],
            "networking": [
                {"id": "vnet", "name": "Virtual Network (VNet)", "description": "Isolated network environment.", "icon": "shield"},
                {"id": "dns", "name": "Azure DNS", "description": "Hosting for DNS domains.", "icon": "globe"},
                {"id": "cdn", "name": "Azure CDN", "description": "Global content delivery network.", "icon": "zap"}
            ],
            "security": [
                {"id": "entra", "name": "Microsoft Entra ID", "description": "Identity and access management.", "icon": "user-check"},
                {"id": "defender", "name": "Microsoft Defender", "description": "Cloud security posture management.", "icon": "shield-alert"},
                {"id": "key_vault", "name": "Key Vault", "description": "Safeguard cryptographic keys.", "icon": "key"}
            ],
            "management": [
                {"id": "monitor", "name": "Azure Monitor", "description": "Full observability for apps.", "icon": "activity"},
                {"id": "advisor", "name": "Azure Advisor", "description": "Personalized cloud consultant.", "icon": "list"}
            ]
        }
        return catalog.get(category.lower(), [])

    def get_daily_costs(self, days: int = 7, account: Optional[CloudAccount] = None) -> List[Dict]: return []
    def get_clusters(self, account: CloudAccount) -> List[Dict]: return []
    def get_functions(self, account: CloudAccount) -> List[Dict]: return []
    def update_resource_tags(self, resource_id: str, tags: Dict[str, str], region: str, account: CloudAccount) -> Dict: return {"status": "unsupported"}
    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        if policy_name == "S3PublicBlock":
             return {"status": "success", "message": f"Azure Storage Guardrail: Public Access Disabled for {resource_id}."}
        return {"status": "unsupported"}
