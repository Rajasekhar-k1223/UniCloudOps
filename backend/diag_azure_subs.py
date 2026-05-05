from azure.identity import ClientSecretCredential
from azure.mgmt.subscription import SubscriptionClient

sub_id = "1176aa7c-a7d7-4261-83f9-4cb219eeb777"
tenant_id = "2bd17cb0-c86b-4855-8e9f-9be2df5bf3a6"
client_id = "a169d1ed-ec70-4dc2-9d66-1ffd369ec933"
client_secret = "YOUR_CLIENT_SECRET"

print(f"Checking accessible subscriptions for Tenant: {tenant_id}")

try:
    credential = ClientSecretCredential(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret
    )
    
    sub_client = SubscriptionClient(credential)
    print("Listing all accessible subscriptions...")
    subs = list(sub_client.subscriptions.list())
    
    if not subs:
        print("RESULT: No subscriptions found. The App Registration essentially has NO permissions in this tenant.")
    else:
        print(f"RESULT: Found {len(subs)} subscriptions:")
        for s in subs:
            print(f" - {s.display_name} ({s.subscription_id})")
            if s.subscription_id == sub_id:
                print("   !!! TARGET SUBSCRIPTION FOUND IN LIST !!!")

except Exception as e:
    print(f"FAILED: Error during subscription list: {e}")
