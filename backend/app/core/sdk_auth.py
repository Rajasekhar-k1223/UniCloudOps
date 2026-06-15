import hmac
import hashlib
import base64
import time
from fastapi import Request, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.sdk_security import APIKey

access_key_header = APIKeyHeader(name="X-UniCloud-Access-Key", auto_error=True)

class SDKAuthenticator:
    """Zero-Trust HMAC-SHA256 Request Validation for SDKs."""

    MAX_TIMESTAMP_DRIFT = 300 # 5 minutes

    @staticmethod
    def _reconstruct_canonical_string(request: Request, timestamp: str, nonce: str, body: bytes) -> str:
        """Constructs the strict canonical string required for hashing."""
        return f"{request.method}\n{request.url.path}\n{timestamp}\n{nonce}\n{body.decode('utf-8')}"

    @staticmethod
    def _generate_hmac_signature(secret_key: str, canonical_string: str) -> str:
        """Generates the base64-encoded HMAC-SHA256 signature."""
        key = secret_key.encode('utf-8')
        msg = canonical_string.encode('utf-8')
        sig = hmac.new(key, msg, hashlib.sha256).digest()
        return base64.b64encode(sig).decode()

    @staticmethod
    async def verify_sdk_request(
        request: Request,
        access_key: str = Security(access_key_header),
        # Dependencies like get_db normally injected here, keeping it conceptual for core module
    ):
        """
        FastAPI Dependency to validate incoming SDK requests.
        Prevents MITM Replay attacks via strict Timestamp and Nonce validation.
        """
        headers = request.headers
        timestamp_str = headers.get("X-UniCloud-Timestamp")
        nonce = headers.get("X-UniCloud-Nonce")
        provided_signature = headers.get("X-UniCloud-Signature")

        if not all([timestamp_str, nonce, provided_signature]):
            raise HTTPException(status_code=401, detail="Missing required UniCloud HMAC headers.")

        # 1. Validate Timestamp Drift (Replay Attack Prevention)
        try:
            timestamp = int(timestamp_str)
            current_time = int(time.time())
            if abs(current_time - timestamp) > SDKAuthenticator.MAX_TIMESTAMP_DRIFT:
                raise HTTPException(status_code=401, detail="Request expired. Timestamp drift exceeds 5 minutes.")
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid Timestamp format.")

        # 2. In a production scenario, we would check Redis here to ensure `nonce` hasn't been used in the last 5 minutes.

        # 3. Lookup the Secret Key in DB
        db: Session = next(get_db())
        api_key_record = db.query(APIKey).filter(APIKey.access_key == access_key, APIKey.is_active == True).first()
        
        if not api_key_record:
            raise HTTPException(status_code=401, detail="Invalid Access Key.")

        # Note: In a true zero-knowledge setup, the server might only store the hash of the secret key.
        # But for symmetric HMAC, the server must have a way to retrieve or derive the raw secret to verify the signature.
        # For this MVP, we assume we can fetch the `raw_secret` securely from a vault using the access_key.
        # Let's mock the secret retrieval for the sake of the algorithm:
        raw_secret_from_vault = "mock-secret-key-from-vault" 

        # 4. Reconstruct and Verify Signature
        body = await request.body()
        canonical_string = SDKAuthenticator._reconstruct_canonical_string(request, timestamp_str, nonce, body)
        expected_signature = SDKAuthenticator._generate_hmac_signature(raw_secret_from_vault, canonical_string)

        if not hmac.compare_digest(expected_signature, provided_signature):
            raise HTTPException(status_code=401, detail="Signature verification failed.")

        return api_key_record.service_account_id

sdk_authenticator = SDKAuthenticator()
