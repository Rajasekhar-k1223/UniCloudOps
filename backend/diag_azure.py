import json
import base64
from cryptography.fernet import Fernet
from app.db.session import SessionLocal
from app.models.cloud_account import CloudAccount
from app.core.config import settings

# 1. Inspect the derived key
jwt_secret = settings.JWT_SECRET
derived_key = base64.urlsafe_b64encode(jwt_secret.encode('utf-8').ljust(32, b'x')[:32])
print(f"DEBUG: JWT_SECRET={jwt_secret}")
print(f"DEBUG: Derived Encryption Key={derived_key.decode()}")

# 2. Try to decrypt account 6
db = SessionLocal()
acc = db.query(CloudAccount).filter(CloudAccount.id == 6).first()
if not acc:
    print("ERROR: Account 6 not found")
else:
    print(f"DEBUG: Found account 6. Encrypted string prefix: {acc.encrypted_credentials[:20]}...")
    try:
        f = Fernet(derived_key)
        decrypted = f.decrypt(acc.encrypted_credentials.encode()).decode()
        print("SUCCESS: Decryption worked!")
        # print(json.loads(decrypted)) # Don't print secrets!
    except Exception as e:
        print(f"FAILED: Decryption error: {e}")
