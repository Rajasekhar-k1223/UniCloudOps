import logging
from typing import Dict, Any
from app.tasks.iac_tasks import execute_iac_deployment, run_terraform_in_docker
from app.db.session import SessionLocal
from app.models.deployment import Deployment

logger = logging.getLogger(__name__)

class TerraformService:
    """
    Sovereign Terraform Orchestration Service.
    Wraps Docker-based IaC execution for universal cloud service management.
    """
    
    def execute_deployment(self, deployment_id: int, parameters: Dict[str, Any], account_id: int):
        """
        Asynchronous wrapper for launching infrastructure missions via Celery/Docker.
        """
        logger.info(f"Engaging Terraform Service for Deployment {deployment_id}...")
        # Since this is called via background_tasks.add_task, we can just call the logic
        execute_iac_deployment(deployment_id)

    def generate_plan(self, template_content: str, env_vars: Dict[str, str]) -> str:
        """
        Generates a tactical preview plan without applying changes.
        """
        try:
            return run_terraform_in_docker(template_content, env_vars, op="plan")
        except Exception as e:
            return f"Plan generation failed: {str(e)}"
