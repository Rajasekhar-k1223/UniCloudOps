from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/finops", tags=["FinOps Broker"])

# Simple in-memory mock state representing active spot market values
market_state = {
    "global_recommendation": "Convert AWS workloads in us-east-1 to Spot markets to capture 65% immediate budget relief.",
    "market": [
        {
            "provider": "AWS",
            "region": "us-east-1",
            "instance_type": "t3.medium",
            "availability": "high",
            "on_demand_price": 0.0416,
            "spot_price": 0.0145,
            "savings_potential": 65
        },
        {
            "provider": "Azure",
            "region": "eastus",
            "instance_type": "Standard_B2s",
            "availability": "high",
            "on_demand_price": 0.0832,
            "spot_price": 0.0349,
            "savings_potential": 58
        },
        {
            "provider": "GCP",
            "region": "us-central1",
            "instance_type": "e2-medium",
            "availability": "low",
            "on_demand_price": 0.0335,
            "spot_price": 0.0210,
            "savings_potential": 37
        }
    ]
}

class ExecuteRequest(BaseModel):
    provider: str
    action: str

@router.get("/market")
def get_market():
    return market_state

@router.post("/execute")
def execute_action(payload: ExecuteRequest):
    provider_market = next((m for m in market_state["market"] if m["provider"].lower() == payload.provider.lower()), None)
    if not provider_market:
        raise HTTPException(status_code=404, detail="Provider not found in current market state")
    
    return {
        "message": f"Successfully authorized '{payload.action}' on {payload.provider}. Scaling workload to optimized spot pool."
    }
