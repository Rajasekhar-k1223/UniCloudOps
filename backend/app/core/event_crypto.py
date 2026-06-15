import os
import time
import json
import hmac
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class EventCryptoController:
    """Zero-Trust App-Layer encryption and signing for NATS Event Fabric."""

    def __init__(self):
        # MVP: Using a single symmetric shared secret mapped via environment.
        # In a strict Enterprise setup, this could rotate via HashiCorp Vault.
        # 32 bytes for AES-256
        self.shared_secret = os.getenv("EVENT_FABRIC_SHARED_SECRET", b"0123456789abcdef0123456789abcdef") 
        self.aesgcm = AESGCM(self.shared_secret)

    def package_event(self, event_type: str, raw_payload: dict, event_uuid: str) -> dict:
        """Encrypts and signs an event before pushing it to the NATS broker."""
        
        # 1. AES-256-GCM Encryption
        nonce = os.urandom(12)
        payload_bytes = json.dumps(raw_payload).encode('utf-8')
        ciphertext = self.aesgcm.encrypt(nonce, payload_bytes, associated_data=None)

        # 2. Construct Envelope
        timestamp = int(time.time())
        envelope = {
            "event_type": event_type,
            "event_uuid": event_uuid,
            "timestamp": timestamp,
            "nonce": nonce.hex(),
            "ciphertext": ciphertext.hex()
        }

        # 3. HMAC-SHA256 Signature
        canonical_string = f"{event_type}:{event_uuid}:{timestamp}:{envelope['nonce']}:{envelope['ciphertext']}"
        signature = hmac.new(self.shared_secret, canonical_string.encode('utf-8'), hashlib.sha256).hexdigest()
        
        envelope["signature"] = signature
        return envelope

    def unpackage_event(self, envelope: dict) -> dict:
        """Validates the signature and decrypts the payload from the NATS broker."""
        
        # 1. Validate Signature
        canonical_string = f"{envelope['event_type']}:{envelope['event_uuid']}:{envelope['timestamp']}:{envelope['nonce']}:{envelope['ciphertext']}"
        expected_sig = hmac.new(self.shared_secret, canonical_string.encode('utf-8'), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(expected_sig, envelope["signature"]):
            raise ValueError("INVALID_SIGNATURE")

        # 2. Replay Protection (Timestamp Drift Check)
        current_time = int(time.time())
        if abs(current_time - int(envelope["timestamp"])) > 300: # 5 mins
            raise ValueError("REPLAY_ATTACK_STALE_TIMESTAMP")

        # Note: In a live system, we would also check a Redis cache using `event_uuid` to ensure 
        # this exact message hasn't been processed in the last 5 minutes.

        # 3. Decrypt
        nonce = bytes.fromhex(envelope["nonce"])
        ciphertext = bytes.fromhex(envelope["ciphertext"])
        
        try:
            plaintext = self.aesgcm.decrypt(nonce, ciphertext, associated_data=None)
            return json.loads(plaintext.decode('utf-8'))
        except Exception as e:
            raise ValueError("DECRYPTION_FAILED")

event_crypto_controller = EventCryptoController()
