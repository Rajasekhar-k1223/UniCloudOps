from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/space-mesh", tags=["Space Mesh"])

# Memory state for space mesh nodes
space_state = {
    "terrestrial_connectivity": "99.98%",
    "active_space_warps": 1,
    "orbital_nodes": [
        {
            "id": "SAT-01",
            "altitude": "550km",
            "status": "optimal",
            "name": "Sovereign-Star-Link-1",
            "latency": "22ms",
            "capacity": "82%"
        },
        {
            "id": "SAT-02",
            "altitude": "542km",
            "status": "stable",
            "name": "Sovereign-Star-Link-2",
            "latency": "28ms",
            "capacity": "64%"
        },
        {
            "id": "SAT-03",
            "altitude": "560km",
            "status": "degraded",
            "name": "LEO-Transit-Orbiter-A",
            "latency": "78ms",
            "capacity": "92%"
        }
    ]
}

class WarpRequest(BaseModel):
    node_id: str
    mission_id: str

@router.get("/nodes")
def get_nodes():
    return space_state

@router.post("/warp")
def trigger_warp(payload: WarpRequest):
    node = next((n for n in space_state["orbital_nodes"] if n["id"].lower() == payload.node_id.lower()), None)
    if not node:
        raise HTTPException(status_code=404, detail="Orbital node not found")
        
    space_state["active_space_warps"] += 1
    node["status"] = "optimal"
    
    return {
        "message": f"Successfully warped workload '{payload.mission_id}' to orbital node '{node['name']}' ({node['id']}) via high-speed laser link."
    }
