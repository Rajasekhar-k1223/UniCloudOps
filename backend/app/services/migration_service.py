import logging
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.models.resource import Resource
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

logger = logging.getLogger(__name__)

class MigrationService:
    def __init__(self):
        # Universal Mapping Table: Maps resource specs to provider-specific instance types
        self.size_mapping = {
            "micro": {
                "aws": "t3.micro", "azure": "Standard_B1s", "gcp": "e2-micro", "digitalocean": "s-1vcpu-1gb",
                "alibaba": "ecs.t5-lc1m1.small", "vultr": "vc2-1c-1gb", "oracle": "VM.Standard.E4.Flex"
            },
            "small": {
                "aws": "t3.small", "azure": "Standard_B2s", "gcp": "e2-small", "digitalocean": "s-1vcpu-2gb",
                "alibaba": "ecs.t5-c1m2.large", "vultr": "vhp-2c-2gb", "ibm": "cx2-2x4"
            },
            "medium": {
                "aws": "t3.medium", "azure": "Standard_B2ms", "gcp": "e2-medium", "digitalocean": "s-2vcpu-4gb",
                "ibm": "bx2-2x8", "vultr": "vc2-2c-4gb", "contabo": "VPS S"
            },
            "large": {
                "aws": "t3.large", "azure": "Standard_B4ms", "gcp": "e2-large", "digitalocean": "s-4vcpu-8gb",
                "alibaba": "ecs.g6.xlarge", "ibm": "bx2-4x16", "oracle": "VM.Standard3.Flex", "contabo": "VPS M"
            }
        }

    def determine_size_class(self, provider: str, instance_type: str) -> str:
        """Find the logical size class for a provider-specific type."""
        for size_class, providers in self.size_mapping.items():
            if providers.get(provider) == instance_type:
                return size_class
        return "small" # Fallback

    def map_image(self, target_provider: str, source_os: str) -> str:
        """Find the corresponding image ID for the target cloud."""
        adapter = get_adapter(target_provider)
        images = adapter.get_images("us-east-1") # Simplified region
        
        os_lower = (source_os or "ubuntu").lower()
        if "ubuntu" in os_lower:
            return images.get("ubuntu")
        elif "windows" in os_lower:
            return images.get("windows")
        elif "debian" in os_lower:
            return images.get("debian")
        return images.get("ubuntu")

    def prepare_migration_plan(self, db: Session, resource_id: int, target_account_id: int) -> Dict:
        """Analyze the source resource and find the best match in the target account."""
        source = db.query(Resource).filter(Resource.id == resource_id).first()
        target_account = db.query(CloudAccount).filter(CloudAccount.id == target_account_id).first()
        
        if not source or not target_account:
            return {"status": "error", "message": "Source or Target not found"}

        size_class = self.determine_size_class(source.provider, source.instance_type)
        target_type = self.size_mapping[size_class].get(target_account.provider, "small-instance")
        target_image = self.map_image(target_account.provider, (source.cloud_metadata or {}).get('os_type', 'linux'))

        plan = {
            "source_resource": source.name,
            "source_provider": source.provider,
            "target_provider": target_account.provider,
            "target_account_name": target_account.name,
            "proposed_type": target_type,
            "proposed_image": target_image,
            "estimated_monthly_cost": 25.0, # Placeholder
            "notes": f"Tactical migration from {source.provider.upper()} to {target_account.provider.upper()} (Sovereign Mission Control)."
        }
        return {"status": "success", "plan": plan}

    def execute_migration(self, db: Session, resource_id: int, target_account_id: int) -> Dict:
        """Provision the new resource in the target cloud."""
        plan_res = self.prepare_migration_plan(db, resource_id, target_account_id)
        if plan_res['status'] != 'success':
            return plan_res
            
        plan = plan_res['plan']
        target_account = db.query(CloudAccount).filter(CloudAccount.id == target_account_id).first()
        adapter = get_adapter(target_account.provider)
        
        # In production: 
        # adapter.provision_instance(target_account, plan['proposed_type'], plan['proposed_image'], plan['notes'])
        
        # For simulation, we create a new Resource entry
        from app.models.resource import Resource
        new_res = Resource(
            cloud_account_id=target_account.id,
            name=f"CLONE-{plan['source_resource']}",
            type="Compute",
            instance_type=plan['proposed_type'],
            region="default",
            status="provisioning",
            public_ip="N/A",
            private_ip="N/A",
            cloud_metadata={"migration_source": plan['source_resource'], "notes": plan['notes']},
            estimated_monthly_cost=plan['estimated_monthly_cost']
        )
        db.add(new_res)
        db.commit()
        
        return {
            "status": "success", 
            "message": f"Cross-cloud migration initiated to {target_account.provider.upper()}.",
            "new_resource_id": new_res.id
        }

    def execute_stack_warp(self, db: Session, resource_ids: List[int], target_account_id: int) -> Dict:
        """High-velocity global migration of a multi-resource application stack."""
        results = []
        for rid in resource_ids:
            res = self.execute_migration(db, rid, target_account_id)
            results.append({"resource_id": rid, "status": res['status'], "message": res.get('message')})
        
        return {
            "status": "success",
            "message": f"Global Stack Warp initiated for {len(resource_ids)} assets.",
            "details": results
        }

migration_service = MigrationService()
