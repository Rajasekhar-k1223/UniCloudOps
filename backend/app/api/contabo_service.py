import requests
import logging
import time
import uuid
from typing import List, Dict
from app.core.crypto import decrypt_credentials
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

class ContaboService:
    def __init__(self, account: CloudAccount):
        creds = decrypt_credentials(account.encrypted_credentials)
        self.client_id = creds.get('client_id')
        self.client_secret = creds.get('client_secret')
        self.username = creds.get('api_user')
        self.password = creds.get('api_password')
        
        self.token_url = "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token"
        self.api_base_url = "https://api.contabo.com/v1"
        
        self._access_token = None
        self._token_expiry = 0

    def _get_token(self):
        """Fetch or refresh OAuth2 token."""
        if self._access_token and time.time() < self._token_expiry:
            return self._access_token

        logger.info(f"Attempting Contabo Auth for Client ID: {self.client_id[:4]}... with Username: {self.username[:3]}...")
        
        # Method 1: Standards-compliant Basic Auth for Client Credentials
        # This is often required by Keycloak/Contabo
        payload = {
            'grant_type': 'password',
            'username': self.username,
            'password': self.password
        }
        
        try:
            # First attempt: Client ID/Secret in Authorization Header (Basic Auth)
            logger.debug("Contabo Auth: Attempting Method 1 (Basic Auth for Client)")
            response = requests.post(
                self.token_url, 
                data=payload, 
                auth=(self.client_id, self.client_secret),
                timeout=10
            )
            
            if response.status_code == 200:
                return self._process_token_response(response)
                
            # Method 2: Client ID/Secret in the Body (Backwards compatibility)
            logger.debug(f"Contabo Auth: Method 1 failed ({response.status_code}). Attempting Method 2 (Client in Body)")
            payload.update({
                'client_id': self.client_id,
                'client_secret': self.client_secret
            })
            response = requests.post(self.token_url, data=payload, timeout=10)
            
            if response.status_code == 200:
                return self._process_token_response(response)
            
            # If both fail, raise the ultimate error
            if response.status_code >= 500:
                error_msg = f"Service Unavailable ({response.status_code})"
                logger.error(f"Contabo API is currently down: {error_msg}")
            else:
                error_data = response.json() if 'application/json' in response.headers.get('Content-Type', '') else {}
                error_msg = error_data.get('error_description', error_data.get('error', 'Unknown Error'))
                if not error_data and '<html>' in response.text.lower():
                    error_msg = f"Non-JSON response from API ({response.status_code})"
                
                logger.error(f"Contabo Auth Failed after both methods ({response.status_code}): {error_msg}")
            
            raise Exception(f"Contabo Auth Failed: {error_msg}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Contabo Auth Network Error: {e}")
            raise Exception(f"Failed to reach Contabo Auth server: {e}")

    def _process_token_response(self, response):
        data = response.json()
        self._access_token = data['access_token']
        self._token_expiry = time.time() + data.get('expires_in', 3600) - 60
        logger.info("Contabo Auth successful")
        return self._access_token

    def _get_headers(self):
        token = self._get_token()
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'x-request-id': str(uuid.uuid4()),
            'x-trace-id': str(uuid.uuid4())
        }

    def get_instances(self) -> List[Dict]:
        """Fetch all Contabo instances (VPS/VDS)."""
        url = f"{self.api_base_url}/compute/instances"
        response = requests.get(url, headers=self._get_headers())
        
        if response.status_code != 200:
            if response.status_code >= 500:
                logger.error(f"Contabo API is currently unavailable ({response.status_code}). Skipping sync.")
            elif '<html>' in response.text.lower():
                logger.error(f"Contabo API returned HTML instead of JSON (Status {response.status_code}).")
            else:
                logger.error(f"Contabo API Error (get_instances): {response.text}")
            return []
            
        data = response.json()
        instances = []
        for item in data.get('data', []):
            # Map Contabo status to our standard ones
            status_map = {
                'running': 'running',
                'stopped': 'stopped',
                'off': 'stopped',
                'provisioning': 'pending'
            }
            raw_status = item.get('status', 'unknown')
            
            # Extract public IP with multiple fallbacks
            public_ip = item.get('ipAddress')
            if not public_ip and item.get('ipAddresses'):
                public_ip = item['ipAddresses'][0]
            if not public_ip and item.get('vips'):
                public_ip = item['vips'][0].get('ip')
                
            # Basic Pricing Estimation for Contabo (Monthly)
            # These are approximate standard prices
            product_lower = item.get('productType', '').lower()
            est_cost = 0.0
            if 'vps s' in product_lower: est_cost = 6.00
            elif 'vps m' in product_lower: est_cost = 12.00
            elif 'vps l' in product_lower: est_cost = 24.00
            elif 'vps xl' in product_lower: est_cost = 38.00
            elif 'vds' in product_lower: est_cost = 50.00 # Base VDS
            
            instances.append({
                "external_id": str(item['instanceId']),
                "name": item.get('name', f"Contabo-{item['instanceId']}"),
                "type": "Compute",
                "instance_type": item.get('productType', 'VPS'),
                "os_type": "Linux" if 'linux' in item.get('imageName', '').lower() else "Windows" if 'windows' in item.get('imageName', '').lower() else "Linux",
                "status": status_map.get(raw_status, raw_status),
                "region": item.get('region', 'Global'),
                "public_ip": public_ip or "N/A",
                "private_ip": "N/A",
                "launch_time": item.get('createdDate', ''),
                "cloud_metadata": item,
                "estimated_monthly_cost": est_cost
            })
        return instances

    def manage_instance(self, instance_id: str, action: str):
        """Lifecycle actions for Contabo instances."""
        # Action map: start, stop, restart
        contabo_actions = {
            'start': 'start',
            'stop': 'stop',
            'terminate': 'stop' # Contabo doesn't allow 'terminate' via API usually, only stop
        }
        
        target_action = contabo_actions.get(action)
        if not target_action:
            raise ValueError(f"Action {action} not supported for Contabo")
            
        url = f"{self.api_base_url}/compute/instances/{instance_id}/actions"
        payload = {"action": target_action}
        
        response = requests.post(url, headers=self._get_headers(), json=payload)
        if response.status_code not in [200, 201, 204]:
            logger.error(f"Contabo Action Failed: {response.text}")
            raise Exception(f"Contabo Action Failed: {response.text}")
            
        return response.json() if response.text else {"status": "success"}
