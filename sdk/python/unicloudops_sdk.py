import requests
from typing import Dict, List, Optional

class UniCloudOpsClient:
    """
    UniCloudOps Client SDK.
    Provides standard programmatic integration to query multi-cloud assets,
    billing trends, security vectors, and neural intelligence.
    """

    def __init__(self, base_url: str = "http://localhost:8085/api/v1"):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.token: Optional[str] = None

    def authenticate(self, email: str, password: str) -> bool:
        """Authenticate user with credentials and store bearer token."""
        url = f"{self.base_url}/auth/login"
        payload = {
            "username": email,
            "password": password
        }
        try:
            # OAuth2 Form encoding
            response = self.session.post(url, data=payload)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                return True
            else:
                raise Exception(f"Auth failed [{response.status_code}]: {response.text}")
        except Exception as e:
            print(f"Authentication Error: {e}")
            return False

    def get_resources(self) -> List[Dict]:
        """Fetch active multi-cloud infrastructure resources."""
        url = f"{self.base_url}/resources"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def get_daily_costs(self, days: int = 7) -> List[Dict]:
        """Fetch historical cost trends across clouds."""
        url = f"{self.base_url}/billing/daily-costs"
        response = self.session.get(url, params={"days": days})
        response.raise_for_status()
        return response.json()

    def get_active_threats(self) -> Dict:
        """Query active threat hunting telemetry."""
        url = f"{self.base_url}/threats/active"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def simulate_zero_day(self) -> Dict:
        """Trigger an autonomous zero-day exploit hunt and patch."""
        url = f"{self.base_url}/threats/simulate"
        response = self.session.post(url)
        response.raise_for_status()
        return response.json()

    def get_operator_telemetry(self) -> Dict:
        """Query real-time biometric and bio-link vitals."""
        url = f"{self.base_url}/biolink/telemetry"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def trigger_lockdown(self) -> Dict:
        """Initiate emergency Sovereign Cognitive Lockdown."""
        url = f"{self.base_url}/biolink/lockdown"
        response = self.session.post(url)
        response.raise_for_status()
        return response.json()

    def chat_with_advisor(self, query: str) -> Dict:
        """Consult Neural Advisor for multi-cloud strategic planning."""
        url = f"{self.base_url}/advisor/chat"
        response = self.session.post(url, json={"query": query})
        response.raise_for_status()
        return response.json()
