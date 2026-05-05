import os
import importlib
import pkgutil
import logging
from typing import Dict, List, Type, Optional
from app.api.adapters.base import BaseCloudAdapter

logger = logging.getLogger(__name__)

# Central Registry for Cloud Adapters
_registry: Dict[str, BaseCloudAdapter] = {}

def register_adapter(adapter: BaseCloudAdapter):
    """Register a cloud provider adapter."""
    _registry[adapter.provider_id] = adapter


def get_adapter(provider_id: str) -> Optional[BaseCloudAdapter]:
    """Retrieve a registered adapter by its ID."""
    return _registry.get(provider_id)

def list_providers() -> List[str]:
    """List all supported cloud providers."""
    return list(_registry.keys())

def list_adapters() -> List[BaseCloudAdapter]:
    """List all registered adapter instances."""
    return list(_registry.values())

def discover_plugins():
    """🛡️ Phase 29: Dynamic Mission Plugin discovery 🛡️"""
    logger.info("Initializing Dynamic Mission Plugin Discovery...")
    
    # Path to the adapters directory
    path = os.path.dirname(__file__)
    
    for loader, module_name, is_pkg in pkgutil.iter_modules([path]):
        if module_name in ["base", "__init__"]:
            continue
            
        try:
            # Import the module dynamically
            module = importlib.import_module(f"app.api.adapters.{module_name}")
            
            # Look for classes in the module that inherit from BaseCloudAdapter
            for attribute_name in dir(module):
                attribute = getattr(module, attribute_name)
                
                if (isinstance(attribute, type) and 
                    issubclass(attribute, BaseCloudAdapter) and 
                    attribute is not BaseCloudAdapter):
                    
                    # Instantiate and register
                    adapter_instance = attribute()
                    register_adapter(adapter_instance)
                    logger.info(f"Dynamically Registered Mission Adapter: {adapter_instance.provider_id} ({module_name})")
                    
        except Exception as e:
            logger.error(f"Failed to load mission plugin {module_name}: {e}")

# Initial Discovery Scan
discover_plugins()
