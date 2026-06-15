from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_admin
from app.models.supply_chain import SBOMRecord, VulnerabilityScan

router = APIRouter(prefix="/supply-chain", tags=["Supply Chain Security"])

@router.get("/metrics")
def get_supply_chain_metrics(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch global SLSA compliance and vulnerability metrics."""
    # MVP Mock Data - In reality, aggregate VulnerabilityScan and SBOMRecord tables
    return {
        "total_assets": 124,
        "cosign_verified": 118,
        "unsigned_assets": 6,
        "slsa_level": "Level 3",
        "critical_cves_active": 2,
        "quarantined_assets": 1
    }

@router.get("/vulnerabilities")
def get_vulnerabilities(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch actively failing Grype/Trivy scans."""
    return [
        {
            "asset_id": "marketplace-helm-nginx-v1",
            "asset_name": "NGINX Ingress Controller",
            "version": "1.2.0",
            "critical_count": 2,
            "high_count": 5,
            "is_quarantined": True,
            "scanned_at": "2026-06-06T14:20:00Z"
        },
        {
            "asset_id": "marketplace-tf-aws-eks",
            "asset_name": "AWS EKS Cluster Module",
            "version": "4.0.1",
            "critical_count": 0,
            "high_count": 1,
            "is_quarantined": False,
            "scanned_at": "2026-06-06T14:15:00Z"
        }
    ]

@router.get("/sboms")
def get_recent_sboms(db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Fetch recently ingested Software Bill of Materials."""
    return [
        {
            "asset_id": "marketplace-docker-backend",
            "asset_name": "UniCloudOps Backend API",
            "format": "SPDX",
            "cosign_verified": True,
            "created_at": "2026-06-06T14:00:00Z"
        },
        {
            "asset_id": "marketplace-docker-worker",
            "asset_name": "Celery Task Worker",
            "format": "CycloneDX",
            "cosign_verified": False,
            "created_at": "2026-06-06T13:45:00Z"
        }
    ]
