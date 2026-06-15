from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict

router = APIRouter(prefix="/chaos", tags=["Chaos Command"])

# Available Chaos Experiments
experiments = {
    "k8s": [
        {"id": "pod_kill", "name": "Pod Kill Injection", "description": "Terminates a Kubernetes Pod randomly or by target name to test failover replica spawning."},
        {"id": "pod_network_delay", "name": "Network Delay Injection", "description": "Injects 100ms-300ms latency to K8s container socket loops."}
    ],
    "vm": [
        {"id": "cpu_stress", "name": "CPU Stressor Task", "description": "Spins up VM load workers to exhaust all virtual cores and verify autoscaling."},
        {"id": "vm_reboot", "name": "Abrupt VM Power Off", "description": "Simulates datacenter hardware outage by abruptly terminating the hypervisor host."}
    ]
}

class ChaosInjectRequest(BaseModel):
    resource_id: int
    experiment: str
    params: Dict

@router.get("/experiments")
def get_experiments():
    return experiments

@router.post("/inject")
def inject_chaos(payload: ChaosInjectRequest):
    # Retrieve experiment detail
    all_exps = experiments["k8s"] + experiments["vm"]
    exp = next((e for e in all_exps if e["id"] == payload.experiment), None)
    if not exp:
        raise HTTPException(status_code=404, detail="Chaos experiment type not found")
    
    target_name = payload.params.get("pod_name") or f"VM-Instance-{payload.resource_id}"
    
    return {
        "status": "success",
        "message": f"Engaged Chaos Mission: '{exp['name']}' successfully injected on target '{target_name}'."
    }
