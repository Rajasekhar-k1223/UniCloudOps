from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.api.adapters import get_adapter

router = APIRouter(prefix="/network", tags=["network"])

@router.get("/topology")
def get_network_topology(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_viewer)
):
    """Generate a tactical map of all VPCs, subnets, and inter-cloud connectivity tunnels."""
    accounts = db.query(CloudAccount).filter(CloudAccount.user_id == current_user.id).all()
    
    topology = {
        "nodes": [], # VPCs/Regions
        "edges": [], # Peering/VPNs
        "subnets": []
    }
    
    provider_colors = {
        "aws": "#FF9900",
        "azure": "#0089D6",
        "gcp": "#EA4335",
        "digitalocean": "#0080FF"
    }

    for acc in accounts:
        adapter = get_adapter(acc.provider)
        if adapter:
            # We fetch regions and then VPCs for a primary region to keep the map clean
            regions = adapter.get_regions(acc)
            primary_region = regions[0]['id'] if regions else "unknown"
            
            # Simulated VPC/Subnet structure
            net_options = adapter.get_network_options(primary_region, acc)
            
            for vpc in net_options.get('vpcs', []):
                node_id = f"vpc-{vpc['id']}"
                topology['nodes'].append({
                    "id": node_id,
                    "label": f"{acc.name} ({vpc['name']})",
                    "provider": acc.provider,
                    "color": provider_colors.get(acc.provider, "#94A3B8"),
                    "cidr": vpc.get('cidr', '10.0.0.0/16')
                })
                
                # Add subnets for this VPC
                for subnet in net_options.get('subnets', []):
                    if subnet.get('vpc_id') == vpc['id'] or subnet.get('vpc_id') == 'vpc-mock':
                        topology['subnets'].append({
                            "vpc_id": node_id,
                            "label": subnet['name'],
                            "id": subnet['id']
                        })

    # Simulate cross-cloud peering (TACTICAL ALPHA)
    if len(topology['nodes']) >= 2:
        topology['edges'].append({
            "source": topology['nodes'][0]['id'],
            "target": topology['nodes'][1]['id'],
            "label": "Inter-Cloud Peering (Simulated)",
            "status": "active"
        })

    return topology
