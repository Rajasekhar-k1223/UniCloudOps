from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps_rbac import get_current_viewer
from app.models.enterprise_evolution import TerraformRun
import datetime

router = APIRouter(prefix="/terraform/enterprise", tags=["Terraform Enterprise"])

@router.get("/runs/{deployment_id}")
def list_terraform_runs(deployment_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """List all Terraform runs (plans/applies) for a specific deployment."""
    runs = db.query(TerraformRun).filter(TerraformRun.deployment_id == deployment_id).order_by(TerraformRun.created_at.desc()).all()
    return runs

@router.post("/runs/{deployment_id}/plan")
def queue_terraform_plan(deployment_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Queue a Terraform Plan in the background."""
    run = TerraformRun(
        deployment_id=deployment_id,
        status="planning",
        run_type="plan",
        triggered_by=current_user.id if hasattr(current_user, 'id') else None
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # In a real environment, we'd fire a Celery task here.
    # We use BackgroundTasks to simulate Celery for MVP
    background_tasks.add_task(simulate_terraform_run, run.id, db)
    
    return {"message": "Terraform plan queued.", "run_id": run.id}

@router.post("/runs/{run_id}/approve")
def approve_terraform_run(run_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Approve a plan and execute Terraform Apply."""
    run = db.query(TerraformRun).filter(TerraformRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if run.status != "planned":
        raise HTTPException(status_code=400, detail="Only 'planned' runs can be approved.")
        
    run.status = "applying"
    db.commit()
    
    background_tasks.add_task(simulate_terraform_run, run.id, db, is_apply=True)
    return {"message": "Run approved, applying now.", "run_id": run.id}

def simulate_terraform_run(run_id: int, db: Session, is_apply: bool = False):
    """Simulates background task for Terraform execution."""
    import time
    time.sleep(2) # Simulate processing time
    run = db.query(TerraformRun).filter(TerraformRun.id == run_id).first()
    if not run: return
    
    if is_apply:
        run.status = "applied"
        run.apply_output = "Apply complete! Resources: 1 added, 0 changed, 0 destroyed.\n\nState lock released."
    else:
        run.status = "planned"
        run.plan_output = "Plan: 1 to add, 0 to change, 0 to destroy.\n\nState lock released."
        
    db.commit()
