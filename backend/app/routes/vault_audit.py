from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from app.db.session import get_db
from app.services.merkle_service import merkle_service
from app.models.audit_log import AuditLog
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/vault", tags=["audit"])

@router.get("/integrity")
def get_vault_integrity(current_user = Depends(get_current_viewer)):
    """Retrieve the current Merkle Root of the sovereign audit vault."""
    return {
        "status": "sealed",
        "merkle_root": merkle_service.get_root(),
        "total_anchors": len(merkle_service.leaves),
        "algorithm": "SHA-256 (Merkle Chained)"
    }

@router.post("/verify/{log_id}")
def verify_log_integrity(
    log_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_viewer)
):
    """Verify a specific log entry against the global Merkle Root."""
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found in the mission archive.")
    
    # In a real system, we'd find the index of the leaf in the Merkle Tree
    # For the demo, we'll simulate the verification process.
    # We find the index based on chronological order of logs with hashes
    logs_with_hashes = db.query(AuditLog).filter(AuditLog.integrity_hash != None).order_by(AuditLog.id).all()
    index = -1
    for i, l in enumerate(logs_with_hashes):
        if l.id == log_id:
            index = i
            break
            
    if index == -1 or index >= len(merkle_service.leaves):
        return {
            "verified": False,
            "reason": "Log entry has not yet been anchored to the cryptographic vault.",
            "log_id": log_id
        }

    leaf_hash = merkle_service.leaves[index]
    proof = merkle_service.get_proof(index)
    is_valid = merkle_service.verify_leaf(leaf_hash, proof, merkle_service.get_root())
    
    return {
        "verified": is_valid,
        "log_id": log_id,
        "leaf_hash": leaf_hash,
        "merkle_root": merkle_service.get_root(),
        "proof_depth": len(proof)
    }
