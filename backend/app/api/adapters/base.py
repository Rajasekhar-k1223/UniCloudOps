from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from app.models.cloud_account import CloudAccount

class BaseCloudAdapter(ABC):
    """Abstract Base Class for all Cloud Providers (AWS, GCP, DO, etc.)."""
    
    @property
    @abstractmethod
    def provider_id(self) -> str:
        """The machine-readable ID (e.g. 'aws', 'digitalocean')."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """The human-readable name (e.g. 'Amazon Web Services')."""
        pass

    @abstractmethod
    def get_catalog(self, region: str = "us-east-1", account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch available instance types/sizes."""
        pass

    @abstractmethod
    def get_price(self, instance_type: str, region: str = "us-east-1", account: Optional[CloudAccount] = None) -> Optional[float]:
        """Fetch hourly price for a specific instance."""
        pass

    @abstractmethod
    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch available data centers/regions."""
        pass

    @abstractmethod
    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        """Fetch VPCs and Subnets for the specified region."""
        pass

    @abstractmethod
    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        """Fetch recommended OS image IDs (ami/slug/family) for the provider."""
        pass

    @abstractmethod
    def get_monthly_spend(self, account: Optional[CloudAccount] = None) -> float:
        """Fetch current month spending for the account."""
        pass
    
    def get_daily_costs(self, days: int = 7, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch daily cost trend for the last N days (Default simulation)."""
        from datetime import datetime, timedelta
        import random
        trends = []
        for i in range(days, -1, -1):
            date_str = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            trends.append({
                "date": date_str,
                self.provider_id: 0.0
            })
        return trends

    def get_monthly_costs(self, months: int = 6, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch monthly cost history for the last N months (Default simulation)."""
        from datetime import datetime, timedelta
        import random
        history = []
        for i in range(months, -1, -1):
            # Calculate the first day of the month i months ago
            dt = datetime.now()
            for _ in range(i):
                dt = dt.replace(day=1) - timedelta(days=1)
            
            month_str = dt.strftime("%Y-%m")
            history.append({
                "month": month_str,
                self.provider_id: 0.0
            })
        return history

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        """Fetch resource metrics (CPU, Memory, Network) for the specified instance."""
        from app.utils.telemetry import get_standard_telemetry
        return get_standard_telemetry(instance_id)

    @abstractmethod
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None) -> Dict:
        """Lifecycle actions: start, stop, terminate."""
        pass
    
    @abstractmethod
    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        """Fetch the current execution state (e.g. 'running', 'stopped', 'pending')."""
        pass

    @abstractmethod
    def get_credential_schema(self) -> Dict[str, str]:
        """Return the required credential fields for this provider (e.g. {'api_key': 'text'})."""
        pass

    @abstractmethod
    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        """Map raw credentials to Terraform provider environment variables."""
        pass

    @abstractmethod
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        """Discover and import existing cloud resources for the account."""
        pass

    @abstractmethod
    def get_storage_options(self) -> List[Dict]:
        """Fetch available storage/volume types (e.g. gp2, gp3)."""
        pass

    @abstractmethod
    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch firewall/security policies for the region."""
        pass

    @abstractmethod
    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        """Fetch service-level billing breakdown for the current month."""
        pass

    @abstractmethod
    def verify_connectivity(self, account: CloudAccount) -> Dict[str, bool]:
        """Test authentication and connectivity for the account."""
        pass

    @abstractmethod
    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        """Directly provision a new cloud resource via Provider API (Quick Create)."""
        pass

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Fetch available services for a given category (Database, Storage, AI, etc.)."""
        return []

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        """Execute lifecycle actions on non-compute managed resources."""
        return {"status": "error", "message": f"Service management for {service_type} not implemented in this adapter."}

    def get_clusters(self, account: CloudAccount) -> List[Dict]:
        """Fetch managed Kubernetes clusters (Default: empty)."""
        return []

    def get_networks(self, account: CloudAccount) -> List[Dict]:
        """Fetch managed virtual networks and subnets (Default: empty)."""
        return []

    def get_functions(self, account: CloudAccount) -> List[Dict]:
        """Fetch managed serverless functions (Default: empty)."""
        return []
    
    def update_resource_tags(self, resource_id: str, tags: Dict[str, str], region: str, account: CloudAccount) -> Dict:
        """Apply or update tags on a specific cloud resource (Default: unsupported)."""
        return {"status": "unsupported", "message": f"{self.provider_name} adapter does not support tag remediation yet."}

    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        """Apply a predefined security policy to a resource (Default: unsupported)."""
        return {"status": "unsupported", "message": f"{self.provider_name} adapter does not support security policy remediation yet."}
