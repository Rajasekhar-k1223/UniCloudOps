from cryptography.fernet import Fernet
import base64
import hashlib
from app.core.config import settings

def get_encryption_key() -> bytes:
    """Generate a stable 32-byte key from the JWT_SECRET."""
    # Fernet needs a 32-byte base64 encoded key
    key_hash = hashlib.sha256(settings.JWT_SECRET.encode()).digest()
    return base64.urlsafe_b64encode(key_hash)

def encrypt_data(data: str) -> str:
    """Encrypt a string using the app's secret key."""
    if not data:
        return ""
    f = Fernet(get_encryption_key())
    return f.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    """Decrypt a string using the app's secret key."""
    if not token:
        return ""
    try:
        f = Fernet(get_encryption_key())
        return f.decrypt(token.encode()).decode()
    except Exception:
        # If decryption fails (e.g. key changed), return empty or log error
        return ""
