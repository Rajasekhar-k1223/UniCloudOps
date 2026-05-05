import logging
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.audit_service import audit_logger

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

@router.post("/github")
async def handle_github_webhook(request: Request, db: Session = Depends(get_db)):
    """🛡️ Phase 30: GitHub Webhook Handler (GitOps Mission Launch) 🛡️"""
    payload = await request.json()
    
    # Extract mission data from GitHub payload
    event_type = request.headers.get("X-GitHub-Event", "push")
    repo_name = payload.get("repository", {}).get("full_name", "UNKNOWN")
    sender = payload.get("sender", {}).get("login", "SYSTEM")
    ref = payload.get("ref", "refs/heads/main")
    
    logger.info(f"Received GitHub {event_type} for {repo_name} from {sender}")
    
    # Record the mission trigger in the Forensic Ledger
    audit_logger.record_action(
        db,
        action="GITOPS_PUSH",
        message=f"GitOps Mission Triggered by {sender} for {repo_name} ({ref})",
        resource_type="repository",
        resource_id=repo_name,
        metadata_json={
            "event": event_type,
            "ref": ref,
            "commits": len(payload.get("commits", [])),
            "source": "github"
        }
    )
    
    # In a real system, this would trigger a Celery task to run a Terraform/Pulumi mission
    return {"status": "success", "mission": "GITOPS_PROVISION_INITIATED", "details": f"Repo: {repo_name}"}

@router.post("/gitlab")
async def handle_gitlab_webhook(request: Request, db: Session = Depends(get_db)):
    """🛡️ Phase 30: GitLab Webhook Handler 🛡️"""
    payload = await request.json()
    
    event_type = request.headers.get("X-Gitlab-Event", "Push Hook")
    project_name = payload.get("project", {}).get("path_with_namespace", "UNKNOWN")
    user_name = payload.get("user_name", "SYSTEM")
    
    logger.info(f"Received GitLab {event_type} for {project_name}")
    
    audit_logger.record_action(
        db,
        action="GITOPS_SYNC",
        message=f"GitOps Sync mission initiated for GitLab project {project_name}",
        resource_type="repository",
        resource_id=project_name,
        metadata_json={"source": "gitlab", "user": user_name}
    )
    
    return {"status": "success", "mission": "GITOPS_SYNC_PENDING"}
