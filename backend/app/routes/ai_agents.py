from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_user
from app.core.ai_orchestrator import orchestrator
from app.models.ai_memory import AgentConversation, AgentMessage, HumanApprovalRequest
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/ai/swarm", tags=["AI Agent Swarm"])

class PromptRequest(BaseModel):
    conversation_id: str = None
    prompt: str

@router.post("/chat")
async def chat_with_swarm(request: PromptRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Send a prompt to the AI Swarm."""
    conv_id = request.conversation_id or str(uuid.uuid4())
    
    # Execute through the orchestrator
    result = await orchestrator.execute_prompt(conv_id, request.prompt)
    
    # Store conversation if new
    conv = db.query(AgentConversation).filter(AgentConversation.id == conv_id).first()
    if not conv:
        conv = AgentConversation(id=conv_id, user_id=current_user.id, title=request.prompt[:50])
        db.add(conv)
        
    # Store messages
    db.add(AgentMessage(conversation_id=conv_id, role="user", content=request.prompt))
    db.add(AgentMessage(conversation_id=conv_id, role="assistant", agent_name=result["agent"], content=result["message"]))
    
    # Queue Human Approval if required
    if result.get("status") == "requires_approval":
        approval = HumanApprovalRequest(
            id=result["approval_id"],
            conversation_id=conv_id,
            agent_name=result["agent"],
            action_type="destructive_action",
            payload={"raw_prompt": request.prompt}
        )
        db.add(approval)
        
    db.commit()
    
    return {
        "conversation_id": conv_id,
        "response": result
    }

@router.get("/approvals")
def get_pending_approvals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Fetch pending Human-in-the-Loop approvals."""
    approvals = db.query(HumanApprovalRequest).filter(HumanApprovalRequest.status == "PENDING").all()
    
    # Mock fallback
    if not approvals:
        return [
            {
                "id": "appr-1234",
                "agent_name": "Terraform Agent",
                "action_type": "terraform_destroy",
                "payload": {"workspace": "prod-eks-cluster"},
                "status": "PENDING"
            }
        ]
        
    return approvals

@router.post("/approvals/{approval_id}/action")
def take_approval_action(approval_id: str, action: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Approve or Reject a pending action."""
    if action not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    approval = db.query(HumanApprovalRequest).filter(HumanApprovalRequest.id == approval_id).first()
    if approval:
        approval.status = f"{action}D"
        db.commit()
        
    # In reality, this would trigger Celery to resume execution
    return {"message": f"Action {action}D successfully", "approval_id": approval_id}
