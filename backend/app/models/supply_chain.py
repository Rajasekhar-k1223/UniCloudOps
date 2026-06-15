from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.db.session import Base

class SBOMRecord(Base):
    """Stores Software Bill of Materials (SBOM) for an asset."""
    __tablename__ = "supply_chain_sboms"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(100), index=True) # e.g., "marketplace-item-123"
    asset_name = Column(String(100))
    asset_version = Column(String(50))
    format = Column(String(20)) # e.g., "CycloneDX", "SPDX"
    content = Column(JSON) # The raw SBOM payload
    cosign_verified = Column(Boolean, default=False) # SLSA Provenance check
    created_at = Column(DateTime(timezone=True), default=func.now())

class VulnerabilityScan(Base):
    """Stores Trivy/Grype vulnerability results for a given asset."""
    __tablename__ = "supply_chain_vulnerability_scans"

    id = Column(Integer, primary_key=True, index=True)
    sbom_id = Column(Integer) # Links to SBOMRecord.id
    asset_id = Column(String(100), index=True)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    is_quarantined = Column(Boolean, default=False) # If Critical > 0, system quarantines asset
    scan_report = Column(JSON) # Detailed CVE list
    scanned_at = Column(DateTime(timezone=True), default=func.now())
