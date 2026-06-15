from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time

router = APIRouter(prefix="/data-singularity", tags=["Data Singularity"])

# Simple in-memory mock state for database sync
data_sync_state = {
    "average_latency": "0.38ms",
    "global_memory_space": "12.4 TB",
    "orbits": [
        {"name": "AWS-VPC-Production-Orbit", "status": "synchronized", "sync_level": 100, "latency": "0.22ms"},
        {"name": "Azure-RG-Core-Orbit", "status": "synchronized", "sync_level": 100, "latency": "0.34ms"},
        {"name": "GCP-Project-Data-Orbit", "status": "replicating", "sync_level": 92, "latency": "0.85ms"}
    ]
}

class WarpRequest(BaseModel):
    target_orbit: str

@router.get("/sync")
def get_sync():
    return data_sync_state

@router.post("/warp")
def warm_cache(payload: WarpRequest):
    orbit = next((o for o in data_sync_state["orbits"] if o["name"].lower() == payload.target_orbit.lower()), None)
    if not orbit:
        raise HTTPException(status_code=404, detail="Target memory orbit not found")
        
    orbit["status"] = "synchronized"
    orbit["sync_level"] = 100
    orbit["latency"] = "0.15ms"
    
    return {
        "message": f"Successfully completed pre-emptive cache warming for: '{payload.target_orbit}'. Dynamic state is now local."
    }
