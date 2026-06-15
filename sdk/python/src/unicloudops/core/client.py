import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

class APIError(Exception):
    def __init__(self, message, status_code=None, payload=None):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload

class RateLimitError(APIError):
    pass

class UnicloudHTTPClient:
    def __init__(self, base_url: str, api_key: str = None, token: str = None):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        
        # Configure connection pooling and basic retries for connection errors
        adapter = HTTPAdapter(pool_connections=10, pool_maxsize=10, max_retries=3)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Authentication
        if token:
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        elif api_key:
            self.session.headers.update({"X-API-Key": api_key})
        
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "unicloudops-sdk-python/2.0.0"
        })

    @retry(
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((requests.exceptions.ConnectionError, requests.exceptions.Timeout, RateLimitError)),
        reraise=True
    )
    def request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{self.base_url}{path}"
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
        except requests.exceptions.RequestException as e:
            raise APIError(f"Network error: {str(e)}")

        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded", status_code=429)

        if not response.ok:
            raise APIError(
                f"API Request failed: {response.text}", 
                status_code=response.status_code,
                payload=response.text
            )

        # Some endpoints might return empty bodies (e.g. 204 No Content)
        if response.status_code == 204 or not response.content:
            return {}
            
        try:
            return response.json()
        except ValueError:
            return {"raw_data": response.text}
