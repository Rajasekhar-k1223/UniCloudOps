from fastapi import APIRouter

router = APIRouter(prefix="/economy", tags=["Economic Empire"])

# Memory state representing active trades and sovereign budget status
economy_state = {
    "sovereign_budget": 85420.00,
    "sovereign_revenue": 12890.00,
    "fiscal_autonomy": 86,
    "monthly_revenue": 14200.00,
    "active_trades": [
        {
            "id": "TR-102",
            "asset": "AWS Spot Credits (us-east-1)",
            "volume": "1.2 TB/hr",
            "status": "completed",
            "gain": "+$320.00"
        },
        {
            "id": "TR-103",
            "asset": "Azure Reserved Instance Swap (Standard_B2s)",
            "volume": "12 Units",
            "status": "completed",
            "gain": "+$180.00"
        },
        {
            "id": "TR-104",
            "asset": "GCP Spot Capacity Arbitrage (us-central1)",
            "volume": "100 Virtual Cores",
            "status": "active",
            "gain": "+$45.00/hr"
        }
    ]
}

@router.get("/status")
def get_status():
    return economy_state

@router.post("/trade")
def execute_trade():
    # Simulate a successful spot rights swap to generate revenue
    economy_state["sovereign_budget"] = round(economy_state["sovereign_budget"] + 250.00, 2)
    economy_state["sovereign_revenue"] = round(economy_state["sovereign_revenue"] + 250.00, 2)
    
    return {
        "message": "Successfully executed sovereign credit swap. Generated $250.00 in budget pool credits."
    }
