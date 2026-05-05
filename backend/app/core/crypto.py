from cryptography.fernet import Fernet
import json
import base64
import os
from app.core.config import settings

# In production this should be a stable 16/32 byte key, here we derive one from JWT secret
# or just generate a stationary one for MVP:
ENCRYPTION_KEY = base64.urlsafe_b64encode(settings.JWT_SECRET.encode('utf-8').ljust(32, b'x')[:32])

f = Fernet(ENCRYPTION_KEY)

def encrypt_credentials(creds_dict: dict) -> str:
    creds_str = json.dumps(creds_dict)
    return f.encrypt(creds_str.encode()).decode()

def decrypt_credentials(encrypted_str: str) -> dict:
    if not encrypted_str:
        return {}
    try:
        decrypted_str = f.decrypt(encrypted_str.encode()).decode()
        return json.loads(decrypted_str)
    except Exception:
        return {}
