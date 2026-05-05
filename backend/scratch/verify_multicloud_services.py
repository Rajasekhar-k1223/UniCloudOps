import sys
import os

# Add the app directory to sys.path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

def verify_multicloud_services():
    db = SessionLocal()
    accounts = db.query(CloudAccount).all()
    
    print("\n" + "="*60)
    print("UNICLOUDOPS MULTI-CLOUD SERVICE VERIFICATION")
    print("="*60)
    
    categories = ['database', 'storage', 'ai_ml', 'networking', 'security', 'management']
    
    results = []
    
    for account in accounts:
        print(f"\n[SCANNING] Provider: {account.provider} | Name: {account.name}")
        adapter = get_adapter(account.provider)
        
        provider_services = []
        for cat in categories:
            try:
                catalog = adapter.get_service_catalog(cat, account)
                if catalog:
                    service_names = [s['name'] for s in catalog]
                    print(f"  - {cat.capitalize()}: {', '.join(service_names)}")
                    provider_services.append(cat)
                else:
                    print(f"  - {cat.capitalize()}: No services mapped.")
            except Exception as e:
                print(f"  - {cat.capitalize()}: ERROR - {e}")
        
        # Test a generic action (Simulation)
        if provider_services:
            test_cat = provider_services[0]
            print(f"  > Testing Control: {test_cat}...")
            try:
                action_resp = adapter.manage_service_resource("test-id", test_cat, "verify", account)
                print(f"    SUCCESS: {action_resp.get('message')}")
            except Exception as e:
                print(f"    FAILED: {e}")
                
        results.append({
            "provider": account.provider,
            "categories": provider_services
        })
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for res in results:
        print(f"{res['provider'].upper():<15} | Categories: {len(res['categories'])}")
    print("="*60 + "\n")

if __name__ == "__main__":
    verify_multicloud_services()
