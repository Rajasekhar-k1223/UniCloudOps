from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.models.project import Project
from app.models.cloud_account import CloudAccount
from app.api.deps import get_current_active_user
from app.api.deps_rbac import get_current_admin, get_current_viewer
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    budget_limit: Optional[float] = 500.0
    alert_threshold: Optional[float] = 0.8
    webhook_url: Optional[str] = None
    notify_on_lifecycle: Optional[bool] = True

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    budget_limit: Optional[float] = None
    alert_threshold: Optional[float] = None
    webhook_url: Optional[str] = None
    notify_on_lifecycle: Optional[bool] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    budget_limit: float
    current_spend_mtd: float
    alert_threshold: float
    webhook_url: Optional[str]
    notify_on_lifecycle: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """List all sovereign projects. ADMINs see all, others see their own."""
    if current_user.role == "ADMIN":
        return db.query(Project).all()
    return db.query(Project).filter(Project.id == current_user.project_id).all()

@router.post("/", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Create a new sovereign project. ADMIN Authority Required."""
    if db.query(Project).filter(Project.name == project_in.name).first():
        raise HTTPException(status_code=400, detail=f"Project '{project_in.name}' already exists")
    project = Project(**project_in.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    from app.services.audit_service import audit_logger
    audit_logger.record_action(
        db, 
        action="PROJECT_CREATE", 
        user_id=current_user.id, 
        project_id=project.id, 
        resource_type="project",
        resource_id=str(project.id),
        message=f"Sovereign Project Created: {project.name}",
        metadata_json=project_in.dict()
    )
    
    from app.services.notification_service import notification_service
    notification_service.notify(
        db,
        project_id=project.id,
        type="lifecycle",
        severity="info",
        message=f"Sovereign Project '{project.name}' successfully initialized.",
        broadcast=True
    )

    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Update project budget guardrails. ADMIN Authority Required."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    old_data = {
        "budget_limit": project.budget_limit,
        "alert_threshold": project.alert_threshold
    }

    for key, val in project_in.dict(exclude_unset=True).items():
        setattr(project, key, val)
    db.commit()
    db.refresh(project)

    from app.services.audit_service import audit_logger
    audit_logger.record_action(
        db, 
        action="PROJECT_GUARDRAIL_UPDATE", 
        user_id=current_user.id, 
        project_id=project.id, 
        resource_type="project",
        resource_id=str(project.id),
        message=f"Financial Guardrails Updated for {project.name}",
        metadata_json={
            "old": old_data,
            "new": project_in.dict(exclude_unset=True)
        }
    )

    from app.services.notification_service import notification_service
    notification_service.notify(
        db,
        project_id=project.id,
        type="system",
        severity="info",
        message=f"Project guardrails and integrations updated.",
        broadcast=True
    )

    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    """Decommission a sovereign project. ADMIN Authority Required."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_name = project.name
    db.delete(project)
    db.commit()

    # 🛡️ Record Tactical Audit Event 🛡️
    from app.services.audit_service import audit_logger
    audit_logger.record_action(
        db, 
        action="PROJECT_DECOMMISSION", 
        user_id=current_user.id, 
        project_id=None, # Project no longer exists or null
        resource_type="project",
        resource_id=str(project_id),
        message=f"Sovereign Project Decommissioned: {project_name}"
    )

    return {"status": "decommissioned", "project": project_name}

@router.get("/{project_id}/summary")
def get_project_summary(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Get full financial summary for a sovereign project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role != "ADMIN" and current_user.project_id != project_id:
        raise HTTPException(status_code=403, detail="Access denied: outside your sovereign project")
    
    account_count = db.query(CloudAccount).filter(CloudAccount.project_id == project_id).count()
    budget_pct = (project.current_spend_mtd / project.budget_limit * 100) if project.budget_limit > 0 else 0
    alert_breached = budget_pct >= (project.alert_threshold * 100)
    budget_exceeded = project.current_spend_mtd >= project.budget_limit

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "budget_limit": project.budget_limit,
        "current_spend_mtd": project.current_spend_mtd,
        "budget_percentage": round(budget_pct, 1),
        "alert_threshold": project.alert_threshold,
        "alert_breached": alert_breached,
        "budget_exceeded": budget_exceeded,
        "linked_accounts": account_count,
    }
