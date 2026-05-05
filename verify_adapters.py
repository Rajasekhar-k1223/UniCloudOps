import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

try:
    from app.api.adapters import list_adapters
    adapters = list_adapters()
    print(f"Successfully instantiated {len(adapters)} adapters.")
    for adapter in adapters:
        print(f" - {adapter.provider_name} ({adapter.provider_id}) ID: {id(adapter)}")
except TypeError as e:
    print(f"ERROR: Abstract class instantiation failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
