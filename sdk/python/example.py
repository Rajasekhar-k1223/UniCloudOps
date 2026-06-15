import sys
import os
# Ensure SDK module is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from unicloudops_sdk import UniCloudOpsClient

def main():
    print("====================================================")
    print("Starting UniCloudOps SDK Diagnostic Verification...")
    print("====================================================")
    
    # Initialize client
    client = UniCloudOpsClient(base_url="http://localhost:8085/api/v1")
    
    # Authenticate
    email = "admin@unicloudops.com"
    password = "change-me"
    print(f"\n1. Authenticating as {email}...")
    if not client.authenticate(email, password):
        print("[-] Authentication failed! Ensure the uvicorn backend is running.")
        sys.exit(1)
    print("[+] Authenticated successfully.")

    # 1. Fetch Resources
    print("\n2. Querying Multi-Cloud Resources...")
    resources = client.get_resources()
    print(f"[+] Discovered {len(resources)} active resources.")
    for res in resources[:2]: # Show first 2
        print(f" - [{res['provider'].upper()}] {res['name']} ({res['type']}) -> Status: {res['status']}")

    # 2. Get Threat Intelligence
    print("\n3. Fetching Threat Hunting Vitals...")
    threats = client.get_active_threats()
    print(f"[+] Hunter Mode: {threats.get('hunter_mode')} | Preempted Threats: {threats.get('zero_day_preempted')}")

    # 3. Simulate Zero-Day Exploit Patching
    print("\n4. Simulating Zero-Day Threat Hunting...")
    sim = client.simulate_zero_day()
    print(f"[+] AI Decision: {sim.get('message')}")

    # 4. Neural Advisor Chat
    print("\n5. Consulting Neural Advisor...")
    query = "Recommend optimization for AWS region cost overruns"
    advisor_reply = client.chat_with_advisor(query)
    print(f"[+] AI Advisor Response: \"{advisor_reply.get('response')}\"")
    print("[+] Steps Synthesized:")
    for step in advisor_reply.get("plan_steps", []):
        print(f"   - {step}")

    # 5. Lockdown Vitals
    print("\n6. Checking Biometric Operator Vitals...")
    telemetry = client.get_operator_telemetry()
    print(f"[+] Operator cognitive stability: {telemetry.get('cognitive_stability')}% | Lockdown status: {telemetry.get('lockdown_status')}")

    print("\n====================================================")
    print("SDK Diagnostic Verification Completed Successfully!")
    print("====================================================")

if __name__ == "__main__":
    main()
