from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/post-mortem", tags=["Post-Mortems"])

# Static list of events for incident debriefing
incident_events = [
    {"id": "EVT-902", "mission": "VPC Orbit Delta", "type": "Network Slicing Failover"},
    {"id": "EVT-411", "mission": "Sovereign Cache Orbit", "type": "Memory Exhaustion Eviction"},
    {"id": "EVT-108", "mission": "Core API Gateway", "type": "DDoS Shield Block"}
]

class GenerateReportRequest(BaseModel):
    event_id: str

@router.get("/list")
def get_incident_list():
    return incident_events

@router.post("/generate")
def generate_report(payload: GenerateReportRequest):
    event = next((e for e in incident_events if e["id"] == payload.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Incident event not found")
    
    return {
        "event_id": event["id"],
        "title": f"Incident Report for {event['mission']} - {event['type']}",
        "executive_summary": f"At 14:02:11, the automated watcher flagged a critical anomaly in the {event['mission']} deployment. The autonomous self-healing script successfully remediated the issue via a {event['type']} sequence.",
        "root_cause": "Transient packet drop and sub-network routing table desynchronization during cluster scaling.",
        "action_timeline": [
            {"time": "14:02:11", "action": "Anomaly threshold breached in VPC flow logs."},
            {"time": "14:02:15", "action": "Self-healing script triggers active-defense block rules."},
            {"time": "14:02:30", "action": "Workload successfully rerouted to active secondary cloud orbits."}
        ],
        "forensic_evidence": {
            "merkle_root": "0x89abcdef12345678901234567890abcdef12345678901234567890abcdef12",
            "vault_anchor": "IPFS Block-904"
        }
    }
