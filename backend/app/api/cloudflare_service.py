import requests
import logging
from typing import List, Dict
from app.core.crypto import decrypt_credentials
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

class CloudflareService:
    def __init__(self, account: CloudAccount):
        creds = decrypt_credentials(account.encrypted_credentials)
        self.api_token = creds.get('api_token')
        self.api_base_url = "https://api.cloudflare.com/client/v4"

    def _get_headers(self):
        return {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }

    def get_zones(self) -> List[Dict]:
        """Fetch all Cloudflare Zones (domains)."""
        url = f"{self.api_base_url}/zones"
        try:
            response = requests.get(url, headers=self._get_headers())
            if response.status_code != 200:
                logger.error(f"Cloudflare API Error (get_zones): {response.text}")
                return []
                
            data = response.json()
            zones = []
            for item in data.get('result', []):
                zones.append({
                    "external_id": item['id'],
                    "name": item['name'],
                    "type": "Network", # Cloudflare zones are network/DNS resources
                    "instance_type": "Zone",
                    "os_type": "DNS",
                    "status": "active" if item['status'] == 'active' else "pending",
                    "region": "global",
                    "public_ip": item.get('name_servers', [ 'N/A' ])[0], # Use first NS as a sample identifier
                    "private_ip": "N/A",
                    "launch_time": item.get('created_on', ''),
                    "cloud_metadata": item,
                    "estimated_monthly_cost": 0.0 # Cloudflare is free/fixed per tier
                })
            return zones
        except Exception as e:
            logger.error(f"Cloudflare API Exception: {e}")
            return []

    def get_dns_records(self, zone_id: str) -> List[Dict]:
        """Fetch DNS records for a specific zone."""
        url = f"{self.api_base_url}/zones/{zone_id}/dns_records"
        try:
            response = requests.get(url, headers=self._get_headers())
            if response.status_code != 200:
                return []
            return response.json().get('result', [])
        except Exception:
            return []
