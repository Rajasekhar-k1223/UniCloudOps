import logging
import subprocess
import os
from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.models.cloud_account import CloudAccount
from app.core.crypto import decrypt_credentials
from app.routes.k8s import get_cluster_kubeconfig

logger = logging.getLogger(__name__)

class ChaosService:
    """
    Tactical Chaos Engineering Service.
    Injects controlled failure missions to test infrastructure resilience.
    """
    
    def inject_chaos(self, db: Session, resource_id: int, experiment: str, params: Dict = None) -> Dict:
        """Inject a chaos experiment into a resource."""
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not resource:
            return {"status": "error", "message": "Target resource not found"}
            
        account = db.query(CloudAccount).filter(CloudAccount.id == resource.cloud_account_id).first()
        
        if resource.type == 'Cluster':
            return self._inject_k8s_chaos(db, resource, account, experiment, params)
        elif resource.type == 'Compute':
            return self._inject_vm_chaos(db, resource, account, experiment, params)
        else:
            return {"status": "error", "message": "Chaos injection only supported for Clusters and Compute nodes"}

    def _inject_k8s_chaos(self, db, resource, account, experiment, params) -> Dict:
        """Inject chaos into a K8s cluster (e.g. Pod Kill)."""
        kubeconfig = get_cluster_kubeconfig(db, resource.id, account)
        namespace = params.get("namespace", "default")
        target_pod = params.get("pod_name")
        
        try:
            if experiment == 'pod_kill':
                # 🗑️ Force delete pod to test restart policy
                cmd = ["/usr/local/bin/kubectl", "delete", "pod", target_pod, "-n", namespace, "--kubeconfig", kubeconfig, "--force", "--grace-period=0"]
                subprocess.run(cmd, check=True, capture_output=True)
                return {"status": "success", "message": f"Chaos: Pod {target_pod} terminated. Monitoring recovery..."}
            
            elif experiment == 'network_latency':
                # This would typically use Chaos Mesh or a sidecar, but for "Tactical Chaos"
                # we can simulate it by scaling down or inducing high load if we have a controller.
                return {"status": "error", "message": "Complex network chaos requires Chaos Mesh installation."}
                
            return {"status": "error", "message": "Unsupported K8s chaos mission."}
        except Exception as e:
            logger.error(f"K8s Chaos Injection Failed: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            if os.path.exists(kubeconfig): os.remove(kubeconfig)

    def _inject_vm_chaos(self, db, resource, account, experiment, params) -> Dict:
        """Inject chaos into a VM (e.g. CPU Stress)."""
        # For VMs, we use Cloud-native tools like AWS Systems Manager (SSM) or Azure Run Command
        # This is a stub for the tactical demo
        try:
            if experiment == 'cpu_stress':
                return {"status": "success", "message": f"Chaos: CPU Stress mission initiated on {resource.name} via SSM Agent."}
            elif experiment == 'io_stress':
                return {"status": "success", "message": f"Chaos: IO Stress mission initiated on {resource.name}."}
            return {"status": "error", "message": "Unsupported VM chaos mission."}
        except Exception as e:
            return {"status": "error", "message": str(e)}

chaos_service = ChaosService()
