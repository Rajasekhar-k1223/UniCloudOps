import os
from unicloudops.core.client import UnicloudHTTPClient
from unicloudops.services.finops import FinOpsService
from unicloudops.services.iam import IAMService
from unicloudops.services.events import EventsService

class UnicloudClient:
    """Main client for the UniCloudOps Enterprise SDK."""
    
    def __init__(self, base_url: str = None, api_key: str = None, token: str = None):
        """
        Initialize the UniCloudOps SDK client.
        
        Args:
            base_url: The base URL of the UniCloudOps instance. Defaults to UNICLOUD_BASE_URL env var.
            api_key: The API Key for machine-to-machine authentication. Defaults to UNICLOUD_API_KEY.
            token: A JWT token for user authentication. Defaults to UNICLOUD_TOKEN.
        """
        self.base_url = base_url or os.environ.get("UNICLOUD_BASE_URL", "http://localhost:8085")
        self.api_key = api_key or os.environ.get("UNICLOUD_API_KEY")
        self.token = token or os.environ.get("UNICLOUD_TOKEN")
        
        if not self.api_key and not self.token:
            raise ValueError("Authentication requires either an api_key or a token.")

        self._http_client = UnicloudHTTPClient(self.base_url, api_key=self.api_key, token=self.token)
        
        # Initialize services
        self.finops = FinOpsService(self._http_client)
        self.iam = IAMService(self._http_client)
        self.events = EventsService(self._http_client)
        # Note: Add remaining services here (kubernetes, governance, observability) as implemented
