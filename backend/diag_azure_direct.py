import logging
from azure.identity import ClientSecretCredential
from azure.mgmt.subscription import SubscriptionClient

sub_id = "1176aa7c-a7d7-4261-83f9-4cb219eeb777"
tenant_id = "2bd17cb0-c86b-4855-8e9f-9be2df5bf3a6"
client_id = "a169d1ed-ec70-4dc2-9d66-1ffd369ec933"
client_secret = "YOUR_CLIENT_SECRET"

print(f"Directly checking subscription: {sub_id} in Tenant: {tenant_id}")

try:
    credential = ClientSecretCredential(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret
    )
    
    sub_client = SubscriptionClient(credential)
    print("Fetching subscription details...")
    sub = sub_client.subscriptions.get(sub_id)
    print(f"SUCCESS: Subscription found!")
    print(f" - Display Name: {sub.display_name}")
    print(f" - State: {sub.state}")

except Exception as e:
    print(f"FAILED: Direct access error: {e}")
