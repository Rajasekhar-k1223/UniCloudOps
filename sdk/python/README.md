# UniCloudOps Python SDK

A programmatic client library to fetch multi-cloud metrics, billing cost graphs, security threat hunting telemetry, and neural AI strategic advisory from the UniCloudOps platform.

## Installation

Ensure you have `requests` library installed:
```bash
pip install requests
```

## Quick Start

```python
from unicloudops_sdk import UniCloudOpsClient

# Initialize client
client = UniCloudOpsClient(base_url="http://localhost:8085/api/v1")

# Authenticate
if client.authenticate("admin@unicloudops.com", "change-me"):
    # Fetch active assets
    resources = client.get_resources()
    print(f"Found {len(resources)} assets.")

    # Consult AI Advisor
    plan = client.chat_with_advisor("Optimize AWS costs")
    print(plan["response"])
```
