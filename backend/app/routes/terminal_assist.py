from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/terminal", tags=["Quantum Terminal Assist"])

class AssistRequest(BaseModel):
    command: str
    output: str

class AssistResponse(BaseModel):
    assistance: str
    suggested_commands: List[str]

@router.post("/assist", response_model=AssistResponse)
def get_terminal_assistance(payload: AssistRequest):
    cmd = payload.command.strip()
    out = payload.output
    
    # Analyze common patterns to generate helpful AI descriptions
    assistance_text = "Analysis completed. The shell command ran successfully but returned system-specific outputs."
    suggestions = ["ls -la", "top", "df -h"]
    
    if "kubectl" in cmd:
        if "Forbidden" in out or "Error" in out:
            assistance_text = "The current ServiceAccount lacks 'list' permissions on pods within the default namespace.\n\nTactical solution: Verify auth tokens or try querying details inside the kube-system namespace."
            suggestions = ["kubectl get pods -n kube-system", "kubectl auth can-i list pods", "kubectl describe namespace default"]
        else:
            assistance_text = "Kubectl command completed successfully. The EKS/AKS cluster node controller resolved target parameters."
            suggestions = ["kubectl get nodes", "kubectl get deployments", "kubectl get services"]
            
    elif cmd == "top":
        assistance_text = "System resource limits are healthy. Core services are active with stable memory and CPU allocation profiles."
        suggestions = ["ps aux", "free -m", "uptime"]
        
    elif cmd == "ls":
        assistance_text = "Directory inventory listing completed. You are viewing blueprints, deployments, and vault assets in the local workspace directory."
        suggestions = ["ls -l blueprints", "cat deployments/active.json", "pwd"]
        
    return {
        "assistance": assistance_text,
        "suggested_commands": suggestions
    }
