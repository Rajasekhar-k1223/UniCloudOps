from typing import List, Dict, Any
from unicloudops.core.client import UnicloudHTTPClient

class IAMService:
    def __init__(self, client: UnicloudHTTPClient):
        self._client = client

    def generate_api_key(self, name: str, scopes: List[str] = None) -> Dict[str, Any]:
        """Generate a new API key for automation."""
        payload = {"name": name, "scopes": scopes or ["read"]}
        return self._client.request("POST", "/api/v1/iam/keys", json=payload)

    def list_roles(self) -> List[Dict[str, Any]]:
        """List all available RBAC roles."""
        return self._client.request("GET", "/api/v1/iam/roles")
