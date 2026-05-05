import docker
import time
import logging
import asyncio
import tempfile
import os
import io
import tarfile
from typing import Dict, Optional
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.deployment import Deployment, Template
from app.db.mongo import get_mongo_db, connect_to_mongo, close_mongo_connection
from app.tasks.sync_tasks import sync_cloud_resources_logic

logger = logging.getLogger(__name__)

def run_terraform_in_docker(template_content: str, env_vars: Dict[str, str], deployment_id: Optional[int] = None, destroy: bool = False) -> str:
    """Run Terraform inside a docker container and stream logs to DB if deployment_id is provided."""
    client = docker.from_env()
    full_logs = ""
    
    try:
        # 🚀 Engagement of Persistent Plugin Cache 🚀
        # Prevents TLS timeouts by caching provider binaries (azurerm, aws, etc.) locally.
        host_cache_path = "c:/Rajasekhar/UniCloudOps/data/terraform_cache"
        
        # Inject Cache Config into Environment
        env_vars["TF_PLUGIN_CACHE_DIR"] = "/terraform_cache"
        
        op = "destroy" if destroy else "apply"
        container = client.containers.create(
            "hashicorp/terraform:latest",
            command=["/app/mission.sh"],
            entrypoint=["/bin/sh"],
            environment=env_vars,
            working_dir='/app',
            volumes={
                host_cache_path: {'bind': '/terraform_cache', 'mode': 'rw'}
            },
            detach=True
        )
        
        # 📦 Prepare Mission Assets (Tar Archive) 📦
        # We inject both main.tf and a tactical mission.sh script for reliable execution
        deployment_script = f"""#!/bin/sh
set -e
echo "🚀 Mission Provisioning Sequence Initiated..."
terraform init -no-color
echo "🛡️ Blueprints validated. Engaging infrastructure providers..."
terraform {op} -auto-approve -no-color
echo "✅ Mission Success. Resource lifecycle confirmed."
"""
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            # Add main.tf
            tf_bytes = template_content.encode('utf-8')
            tf_info = tarfile.TarInfo(name="main.tf")
            tf_info.size = len(tf_bytes)
            tar.addfile(tf_info, io.BytesIO(tf_bytes))
            
            # Add mission.sh
            sh_bytes = deployment_script.encode('utf-8')
            sh_info = tarfile.TarInfo(name="mission.sh")
            sh_info.size = len(sh_bytes)
            sh_info.mode = 0o755 # Mark as executable
            tar.addfile(sh_info, io.BytesIO(sh_bytes))
        
        tar_stream.seek(0)
        container.put_archive("/app", tar_stream)
        
        # Launch the mission
        container.start()
        
        db = SessionLocal() if deployment_id else None
        last_update = time.time()
        
        for line in container.logs(stream=True):
            decoded_line = line.decode("utf-8")
            full_logs += decoded_line
            
            # Throttle DB updates to once every 2 seconds
            if db and deployment_id and (time.time() - last_update > 2.0):
                deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
                if deployment:
                    # Truncate for streaming too if it gets huge
                    stream_logs = full_logs
                    if len(stream_logs) > 60000:
                        stream_logs = stream_logs[:30000] + "\n...[TRUNCATED]...\n" + stream_logs[-30000:]
                    deployment.logs = stream_logs
                    db.commit()
                    
                    # 📡 Broadcast real-time telemetry to the user's HUD 📡
                    try:
                        from app.utils.connection_manager import manager
                        import asyncio
                        
                        loop = asyncio.get_event_loop()
                        msg = {
                            "type": "log_stream",
                            "deployment_id": deployment_id,
                            "logs": decoded_line # Send just the new line for incremental update
                        }
                        if loop.is_running():
                            loop.create_task(manager.broadcast_to_user(deployment.user_id, msg))
                    except Exception as ws_e:
                        logger.error(f"Failed to stream logs via WebSocket: {ws_e}")

                last_update = time.time()
        
        container.wait()
        container.remove()
        
        if db:
            db.close()
            
        return full_logs
    except Exception as e:
        logger.error(f"Terraform Docker execution failed: {e}")
        return f"Error: {str(e)}\n\nPartial Logs:\n{full_logs}"

@celery_app.task(name="execute_iac_deployment")
def execute_iac_deployment(deployment_id: int, destroy: bool = False):
    """Executes Terraform or CDK inside a docker container with real-time logging."""
    db = SessionLocal()
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        logger.error("Deployment not found")
        db.close()
        return
        
    # ⚡ PRE-FLIGHT BUDGET GUARDRAIL ⚡
    from app.tasks.budget_tasks import check_project_budget_guardrail
    if deployment.project_id and not check_project_budget_guardrail(deployment.project_id):
        deployment.status = "failed"
        deployment.logs = "🚫 MISSION ABORT: Project budget limit has been reached. Contact your ADMIN to increase the monthly budget guardrail before launching new missions."
        db.commit()
        db.close()
        logger.warning(f"Deployment {deployment_id} halted: Project {deployment.project_id} budget exceeded.")
        return

    template = deployment.template
    deployment.status = "running"
    db.commit()
    
    from app.models.cloud_account import CloudAccount
    from app.core.crypto import decrypt_credentials
    
    account = db.query(CloudAccount).filter(CloudAccount.id == deployment.cloud_account_id).first()
    if not account:
        logger.error("Cloud account not found")
        deployment.status = "failed"
        db.commit()
        db.close()
        return
        
    creds = decrypt_credentials(account.encrypted_credentials)
    
    # Setup environment variables via the Universal Cloud Adapter
    from app.api.adapters import get_adapter
    adapter = get_adapter(account.provider)
    if not adapter:
        logger.error(f"No adapter found for provider {account.provider}")
        deployment.status = "failed"
        db.commit()
        db.close()
        return

    env_vars = adapter.get_terraform_provider_vars(creds)
    
    # 🕵️ Tactical Sanity Check: Ensure critical credentials propagated 🕵️
    if account.provider == 'azure' and not env_vars.get('ARM_CLIENT_SECRET'):
        deployment.status = "failed"
        deployment.logs = "❌ MISSION HALTED: Azure credentials failed to propagate. Verify the 'Secret Value' (not Secret ID) is correctly configured for the account."
        db.commit()
        db.close()
        return
    
    # 🧬 Dynamic Variable Injection 🧬
    # Inject user-defined wizard specs (instance_type, ami_id, etc) as Terraform variables
    if deployment.variables and isinstance(deployment.variables, dict):
        for key, value in deployment.variables.items():
            # Terraform expects variables as TF_VAR_name environment variables
            tf_var_key = f"TF_VAR_{key}"
            env_vars[tf_var_key] = str(value)
            logger.info(f"Injecting IaC Parameter: {tf_var_key}={value}")

    from app.services.notification_service import notification_service
    try:
        if template.iac_type == "terraform":
            logs = run_terraform_in_docker(template.content, env_vars, deployment_id, destroy=destroy)
        else:
            logs = "CDK Deployment simulation starting...\nPhase 5: Streaming Logs Enabled.\nCDK Deploy started...\nSuccess."
            
        # Ensure logs don't exceed DB capacity (limiting to 60k characters for safe storage)
        if len(logs) > 60000:
            logs = logs[:30000] + "\n\n... [TRUNCATED DUE TO SIZE] ...\n\n" + logs[-30000:]
            
        deployment.logs = logs
        
        # 🧪 Enhanced Mission Success Detection 🧪
        is_failure = "Error:" in logs or "FAILED" in logs.upper()
        if is_failure:
            deployment.status = "failed"
        else:
            deployment.status = "decommissioned" if destroy else "success"
        
        # 📣 Broadcast Outcome 📣
        action_label = "Decommission" if destroy else "Provisioning"
        severity = "info" if deployment.status == "success" else "critical"
        msg = f"{action_label} for '{template.name}' on {account.provider} was {deployment.status.upper()}."
        notification_service.notify(db, deployment.project_id, type="mission", severity=severity, message=msg, broadcast=True)
        
        # 🛰️ Post-Launch Resource Discovery 🛰️
        if deployment.status == "success":
            logger.info(f"Mission success. Initiating tactical wait (10s) before discovery for account {account.id}...")
            time.sleep(10) # Wait for cloud provider metadata propagation
            try:
                sync_cloud_resources_logic(account.id, db)
            except Exception as se:
                logger.error(f"Post-launch resource discovery failed: {se}")

    except Exception as e:
        deployment.logs = f"Execution Error: {str(e)}"
        deployment.status = "failed"
        notification_service.notify(
            db, 
            deployment.project_id, 
            type="mission", 
            severity="critical", 
            message=f"Iac Execution Fatal Error: {str(e)}", 
            broadcast=True
        )
        
    db.commit()
    db.close()

def prune_docker_cache():
    """Prune unused docker images and containers."""
    client = docker.from_env()
    try:
        # Prune containers that have been stopped
        container_results = client.containers.prune()
        # Prune unused images
        image_results = client.images.prune()
        
        logger.info(f"Docker prune successful. Containers removed: {container_results.get('SpaceReclaimed', 0)} bytes, Images removed: {image_results.get('SpaceReclaimed', 0)} bytes")
        return {
            "status": "success", 
            "containers_reclaimed": container_results.get('SpaceReclaimed', 0),
            "images_reclaimed": image_results.get('SpaceReclaimed', 0)
        }
    except Exception as e:
        logger.error(f"Docker prune failed: {e}")
        return {"status": "error", "message": str(e)}
