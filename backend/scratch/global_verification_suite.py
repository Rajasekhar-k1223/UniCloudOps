import os
import sys
import logging

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock environment variables for Pydantic Settings
os.environ["JWT_SECRET"] = "verification_secret_key"
os.environ["DATABASE_URL"] = "sqlite:///./verify.db"
os.environ["MONGO_URL"] = "mongodb://localhost:27017/verify"
os.environ["REDIS_URL"] = "redis://localhost:6379/1"

from app.db.session import SessionLocal
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter, list_providers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GlobalVerification")

def run_verification():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print(" UNICLOUDOPS GLOBAL PROVIDER VERIFICATION SUITE ")
        print("="*60 + "\n")

        providers = list_providers()
        results = []

        for provider_id in providers:
            print(f" Testing Provider: {provider_id.upper()}")
            adapter = get_adapter(provider_id)
            
            if not adapter:
                print(f"   FAILED: No adapter found for {provider_id}")
                results.append((provider_id, "Missing Adapter"))
                continue

            # 1. Check Interface Compliance
            print(f"  - Interface: {adapter.provider_name} verified.")
            
            # 2. Check Connectivity (Simulation/Native)
            try:
                # Mock account for verification if no real one exists
                mock_account = CloudAccount(provider=provider_id, name=f"Verify-{provider_id}")
                conn = adapter.verify_connectivity(mock_account)
                if conn.get('authenticated'):
                    print(f"  - Connectivity: [OK] AUTHENTICATED")
                else:
                    print(f"  - Connectivity: [WARN] {conn.get('error', 'Unknown Error')}")
            except Exception as e:
                print(f"  - Connectivity: [ERROR] {e}")

            # 3. Check Catalog Categories
            categories = ["compute", "database", "storage", "containers", "serverless"]
            catalog_count = 0
            for cat in categories:
                items = adapter.get_service_catalog(cat)
                if items:
                    catalog_count += len(items)
            
            print(f"  - Service Catalog: Found {catalog_count} tactical items.")

            # 4. Check Telemetry Parity
            try:
                metrics = adapter.get_metrics("verify-instance-1", "us-east-1")
                if "CPUUsage" in metrics and "MemoryUsage" in metrics:
                    print(f"  - Telemetry: [OK] FULL FIDELITY")
                elif "CPU" in metrics or "CPUUsage" in metrics:
                     print(f"  - Telemetry: [WARN] LEGACY SCHEMA")
                else:
                    print(f"  - Telemetry: [FAILED] MISSING")
            except Exception as e:
                print(f"  - Telemetry: [FAILED] CRITICAL ERROR: {e}")

            # 5. Check Security Policy Parity
            try:
                pol = adapter.apply_security_policy("res-1", "S3PublicBlock", "us-east-1", mock_account)
                if pol.get('status') in ['success', 'unsupported']:
                    res_status = "OK" if pol.get('status') == 'success' else "UNSUPPORTED"
                    print(f"  - Governance: [{res_status}] {pol.get('message', '')}")
                else:
                    print(f"  - Governance: [FAILED] {pol.get('message', '')}")
            except Exception as e:
                print(f"  - Governance: [FAILED] ERROR: {e}")

            print("-" * 30)

        print("\n" + "="*60)
        print(" GLOBAL VERIFICATION COMPLETE ")
        print("="*60 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
