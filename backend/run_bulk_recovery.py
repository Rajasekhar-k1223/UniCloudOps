
from app.db.session import SessionLocal
from app.models.deployment import Deployment
from app.tasks.iac_tasks import execute_iac_deployment
import sys

def run_recovery():
    db = SessionLocal()
    try:
        # Get failed or pending deployments
        # If the user wants to "recreate", we can target specific IDs or all non-success
        deployments = db.query(Deployment).filter(Deployment.status != "success").all()
        
        print(f"📡 Found {len(deployments)} missions for recovery.")
        
        for dep in deployments:
            print(f"🚀 Re-launching Mission ID: {dep.id} (Current Status: {dep.status})")
            # Call the task execution function
            # Since we are running this as a script, it will execute synchronously
            try:
                execute_iac_deployment(dep.id)
                db.refresh(dep)
                print(f"✅ Mission ID: {dep.id} completed with status: {dep.status}")
            except Exception as e:
                print(f"❌ Mission ID: {dep.id} failed to trigger: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    run_recovery()
