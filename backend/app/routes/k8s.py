from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import subprocess
import json
import os
import tempfile
import logging
from app.db.session import get_db
from app.models.resource import Resource
from app.models.cloud_account import CloudAccount
from app.core.crypto import decrypt_credentials
from app.api.deps_rbac import get_current_viewer

router = APIRouter(prefix="/k8s", tags=["kubernetes"])
logger = logging.getLogger(__name__)

def get_cluster_kubeconfig(db: Session, resource_id: int, account: CloudAccount) -> str:
    """Generate a temporary kubeconfig for the specified cluster."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Cluster resource not found")
    
    creds = decrypt_credentials(account.encrypted_credentials)
    
    # Create a unique temp file for this session's kubeconfig
    fd, path = tempfile.mkstemp(prefix=f"kube_{resource_id}_")
    os.close(fd)
    
    try:
        env = os.environ.copy()
        if account.provider == 'aws':
            # Support multiple possible key names from the sovereign store
            env["AWS_ACCESS_KEY_ID"] = str(creds.get('aws_access_key') or creds.get('aws_access_key_id') or creds.get('access_key') or "")
            env["AWS_SECRET_ACCESS_KEY"] = str(creds.get('aws_secret_key') or creds.get('aws_secret_access_key') or creds.get('secret_key') or "")
            region = str(resource.region or "us-east-1")
            
            # 🛡️ Tactical Fail-safe: Extract region from ARN if stored region is invalid
            if region.lower() == 'aws' or len(region) < 3:
                metadata = resource.cloud_metadata or {}
                arn = metadata.get('arn', '')
                if 'arn:aws:eks:' in arn:
                    region = arn.split(':')[3]
            
            env["AWS_DEFAULT_REGION"] = region
            
            # EKS Update Config
            cmd = [
                "/usr/local/bin/aws", "eks", "update-kubeconfig",
                "--name", str(resource.name),
                "--region", env["AWS_DEFAULT_REGION"],
                "--kubeconfig", path
            ]
            subprocess.run(cmd, env=env, check=True, capture_output=True)
            
        elif account.provider == 'azure':
            env["ARM_CLIENT_ID"] = str(creds.get('client_id') or "")
            env["ARM_CLIENT_SECRET"] = str(creds.get('client_secret') or "")
            env["ARM_TENANT_ID"] = str(creds.get('tenant_id') or "")
            
            # Azure CLI Login & Config
            login_cmd = [
                "/usr/bin/az", "login", "--service-principal",
                "-u", env["ARM_CLIENT_ID"],
                "-p", env["ARM_CLIENT_SECRET"],
                "--tenant", env["ARM_TENANT_ID"]
            ]
            subprocess.run(login_cmd, env=env, check=True, capture_output=True)
            
            # Extract RG from metadata or name
            rg = resource.cloud_metadata.get('id', '').split('/')[4] if resource.cloud_metadata else "default"
            
            cmd = [
                "/usr/bin/az", "aks", "get-credentials",
                "--resource-group", rg,
                "--name", resource.name,
                "--file", path,
                "--overwrite-existing"
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            
        # 🩹 Tactical Protocol Patch: EKS 1.29+ requires v1 instead of v1beta1 for exec auth
        if os.path.exists(path):
            with open(path, 'r') as f:
                content = f.read()
            content = content.replace('client.authentication.k8s.io/v1beta1', 'client.authentication.k8s.io/v1')
            
            # 💉 Tactical Injection: Add interactiveMode which is required in newer versions
            if 'interactiveMode:' not in content:
                content = content.replace('command: aws', 'command: /usr/local/bin/aws\n      interactiveMode: Never')
            else:
                content = content.replace('command: aws', 'command: /usr/local/bin/aws')
                
            with open(path, 'w') as f:
                f.write(content)
                
        return path
    except Exception as e:
        if os.path.exists(path): os.remove(path)
        logger.error(f"Kubeconfig generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")

@router.get("/pods/{resource_id}")
def get_cluster_pods(resource_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Fetch live Pod telemetry from the cluster."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource or resource.type != 'Cluster':
        raise HTTPException(status_code=404, detail="Cluster not found")
        
    account = db.query(CloudAccount).filter(CloudAccount.id == resource.cloud_account_id).first()
    # We need to capture the environment variables used for auth
    creds = decrypt_credentials(account.encrypted_credentials)
    env = os.environ.copy()
    
    if account.provider == 'aws':
        region = str(resource.region or "us-east-1")
        if region.lower() == 'aws' or len(region) < 3:
            metadata = resource.cloud_metadata or {}
            arn = metadata.get('arn', '')
            if 'arn:aws:eks:' in arn:
                region = arn.split(':')[3]
        
        env["AWS_ACCESS_KEY_ID"] = str(creds.get('aws_access_key') or creds.get('aws_access_key_id') or creds.get('access_key') or "")
        env["AWS_SECRET_ACCESS_KEY"] = str(creds.get('aws_secret_key') or creds.get('aws_secret_access_key') or creds.get('secret_key') or "")
        env["AWS_DEFAULT_REGION"] = region
    elif account.provider == 'azure':
        env["ARM_CLIENT_ID"] = str(creds.get('client_id') or "")
        env["ARM_CLIENT_SECRET"] = str(creds.get('client_secret') or "")
        env["ARM_TENANT_ID"] = str(creds.get('tenant_id') or "")

    kubeconfig = get_cluster_kubeconfig(db, resource_id, account)
    
    try:
        cmd = ["/usr/local/bin/kubectl", "get", "pods", "--all-namespaces", "-o", "json", "--kubeconfig", kubeconfig]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to fetch pods: {e.stderr}")
        return {"items": []}
    except Exception as e:
        logger.error(f"Unexpected error fetching pods: {e}")
        return {"items": []}
    finally:
        if os.path.exists(kubeconfig): os.remove(kubeconfig)

@router.get("/nodes/{resource_id}")
def get_cluster_nodes(resource_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Fetch node health and capacity from the cluster."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    account = db.query(CloudAccount).filter(CloudAccount.id == resource.cloud_account_id).first()
    
    # Auth inheritance
    creds = decrypt_credentials(account.encrypted_credentials)
    env = os.environ.copy()
    if account.provider == 'aws':
        region = str(resource.region or "us-east-1")
        if region.lower() == 'aws' or len(region) < 3:
            metadata = resource.cloud_metadata or {}
            arn = metadata.get('arn', '')
            if 'arn:aws:eks:' in arn:
                region = arn.split(':')[3]
        env["AWS_ACCESS_KEY_ID"] = str(creds.get('aws_access_key') or creds.get('aws_access_key_id') or creds.get('access_key') or "")
        env["AWS_SECRET_ACCESS_KEY"] = str(creds.get('aws_secret_key') or creds.get('aws_secret_access_key') or creds.get('secret_key') or "")
        env["AWS_DEFAULT_REGION"] = region
    elif account.provider == 'azure':
        env["ARM_CLIENT_ID"] = str(creds.get('client_id') or "")
        env["ARM_CLIENT_SECRET"] = str(creds.get('client_secret') or "")
        env["ARM_TENANT_ID"] = str(creds.get('tenant_id') or "")

    kubeconfig = get_cluster_kubeconfig(db, resource_id, account)
    
    try:
        cmd = ["/usr/local/bin/kubectl", "get", "nodes", "-o", "json", "--kubeconfig", kubeconfig]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to fetch nodes: {e.stderr}")
        return {"items": []}
    finally:
        if os.path.exists(kubeconfig): os.remove(kubeconfig)

@router.get("/logs/{resource_id}/{namespace}/{pod_name}")
def get_pod_logs(resource_id: int, namespace: str, pod_name: str, db: Session = Depends(get_db), current_user = Depends(get_current_viewer)):
    """Fetch the latest execution logs from a specific pod."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    account = db.query(CloudAccount).filter(CloudAccount.id == resource.cloud_account_id).first()
    
    # Auth inheritance
    creds = decrypt_credentials(account.encrypted_credentials)
    env = os.environ.copy()
    if account.provider == 'aws':
        region = str(resource.region or "us-east-1")
        if region.lower() == 'aws' or len(region) < 3:
            metadata = resource.cloud_metadata or {}
            arn = metadata.get('arn', '')
            if 'arn:aws:eks:' in arn:
                region = arn.split(':')[3]
        env["AWS_ACCESS_KEY_ID"] = str(creds.get('aws_access_key') or creds.get('aws_access_key_id') or creds.get('access_key') or "")
        env["AWS_SECRET_ACCESS_KEY"] = str(creds.get('aws_secret_key') or creds.get('aws_secret_access_key') or creds.get('secret_key') or "")
        env["AWS_DEFAULT_REGION"] = region
    elif account.provider == 'azure':
        env["ARM_CLIENT_ID"] = str(creds.get('client_id') or "")
        env["ARM_CLIENT_SECRET"] = str(creds.get('client_secret') or "")
        env["ARM_TENANT_ID"] = str(creds.get('tenant_id') or "")

    kubeconfig = get_cluster_kubeconfig(db, resource_id, account)
    
    try:
        cmd = ["/usr/local/bin/kubectl", "logs", pod_name, "-n", namespace, "--tail=100", "--kubeconfig", kubeconfig]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, check=True)
        return {"logs": result.stdout}
    except Exception as e:
        return {"logs": f"Error fetching logs: {str(e)}"}
    finally:
        if os.path.exists(kubeconfig): os.remove(kubeconfig)
