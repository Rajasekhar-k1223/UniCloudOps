from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/defense", tags=["Active Defense"])

# Simple in-memory storage for active defense scan
scan_state = {
    "defense_readiness": 88,
    "detected": [
        {
            "id": "VULN-AWS-32",
            "severity": "critical",
            "name": "AWS EC2 Port 22 SSH exposed to global subnet",
            "resource": "arn:aws:ec2:us-east-1:123456789012:security-group/sg-0abcd1234",
            "remediation": "Restrict security group ingress rules to trusted IP ranges."
        },
        {
            "id": "VULN-AZURE-09",
            "severity": "high",
            "name": "Azure Storage Account blob access level set to public",
            "resource": "subscriptions/123/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/sa-audit",
            "remediation": "Disable anonymous public read access to containers."
        }
    ]
}

class PatchRequest(BaseModel):
    vuln_id: str

@router.get("/scan")
def get_scan():
    return scan_state

@router.post("/patch")
def apply_patch(payload: PatchRequest):
    vuln = next((v for v in scan_state["detected"] if v["id"] == payload.vuln_id), None)
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    # Remove from detected list on successful patch
    scan_state["detected"] = [v for v in scan_state["detected"] if v["id"] != payload.vuln_id]
    scan_state["defense_readiness"] = min(100, scan_state["defense_readiness"] + 6)
    
    return {"message": f"Successfully deployed autonomous neural patch to remediation target: {vuln['id']}"}
