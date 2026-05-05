import os

adapter_dir = r"c:\Rajasekhar\UniCloudOps\backend\app\api\adapters"
files = [f for f in os.listdir(adapter_dir) if f.endswith(".py") and f not in ["base.py", "__init__.py"]]

verify_method = """
    def verify_connectivity(self, account: CloudAccount) -> Dict:
        \"\"\"Mock verification for simulation mode.\"\"\"
        return {"authenticated": True, "access": True, "note": "Simulation mode"}
"""

for filename in files:
    path = os.path.join(adapter_dir, filename)
    with open(path, "r") as f:
        content = f.read()
    
    if "def verify_connectivity" not in content:
        print(f"Updating {filename}...")
        with open(path, "a") as f:
            f.write(verify_method)
    else:
        print(f"Skipping {filename}, already implemented.")
