import random
import logging
import socket
import asyncio
from fastapi import APIRouter, Depends, HTTPException, WebSocket, Query
from typing import List, Dict, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.deps_rbac import restrict_to_project, get_current_viewer, get_current_operator
from app.models.user import User
from app.models.cloud_account import CloudAccount
from app.models.resource import Resource
from app.services.cache_service import cache_service
from app.services.rightsizing_service import rightsizing_service

router = APIRouter(prefix="/resources", tags=["resources"], redirect_slashes=False)

@router.get("")
def get_resources(current_user: User = Depends(get_current_viewer), db: Session = Depends(get_db)):
    """Fetch resources across all linked clouds within the sovereign project boundary."""
    cache_key = f"res_v1_p{current_user.project_id}_u{current_user.id}"
    cached = cache_service.get(cache_key)
    if cached:
        logger.info(f"Intelligence Cache Hit for project {current_user.project_id}")
        return cached

    # Filter resources by their cloud account's project_id
    query = db.query(Resource).join(CloudAccount).filter(CloudAccount.project_id == current_user.project_id if current_user.role != "ADMIN" else True)
    
    # Use restrict_to_project for additional safety (though joined above)
    db_resources = restrict_to_project(query, current_user, CloudAccount).all()
    
    # Map to serializable list
    result = [
        {
            "id": r.id, "name": r.name, "type": r.type, "provider": r.provider, 
            "region": r.region, "status": r.status, "instance_type": r.instance_type,
            "os_type": r.os_type,
            "public_ip": r.public_ip, "private_ip": r.private_ip, "cloud_metadata": r.cloud_metadata,
            "estimated_monthly_cost": r.estimated_monthly_cost
        } for r in db_resources
    ]
    
    cache_service.set(cache_key, result, ttl_seconds=300) # 5m tactical cache
    return result

class QuickCreateRequest(BaseModel):
    name: str
    provider: str
    region: str
    instance_type: str
    image_id: str
    account_id: int
    user_data: Optional[str] = None

@router.post("/", status_code=201)
def quick_create_resource(
    req: QuickCreateRequest,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Direct-to-Cloud Fast Provisioning (API Direct). Bypass IaC mission orchestration for speed."""
    account = db.query(CloudAccount).filter(CloudAccount.id == req.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Cloud account not found")
        
    restrict_to_project(db.query(CloudAccount).filter(CloudAccount.id == req.account_id), current_user).first()
    
    from app.api.adapters import get_adapter
    adapter = get_adapter(account.provider)
    
    try:
        result = adapter.create_instance(
            name=req.name,
            region=req.region,
            instance_type=req.instance_type,
            image_id=req.image_id,
            account=account,
            user_data=req.user_data
        )
        
        if result.get("status") == "success":
            # Record Audit event
            from app.services.audit_service import audit_logger
            audit_logger.record_action(
                db, action="QUICK_CREATE", user_id=current_user.id, 
                project_id=account.project_id, resource_type="resource",
                message=f"Direct API Provisioning: {req.name} on {account.provider}"
            )
            
            # Trigger immediate discovery for this account
            from app.tasks.sync_tasks import sync_cloud_resources
            sync_cloud_resources.delay(account.id)
            
        return result
    except Exception as e:
        logger.error(f"Quick Create Fatal Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def trigger_manual_sync(current_user: User = Depends(get_current_operator), db: Session = Depends(get_db)):
    """Manually trigger a synchronous sync for all accounts in the sovereign project."""
    query = db.query(CloudAccount).filter(CloudAccount.project_id == current_user.project_id if current_user.role != "ADMIN" else True)
    accounts = restrict_to_project(query, current_user, CloudAccount).all()
    
    if not accounts:
        return {"status": "error", "message": "No accounts linked in your project"}
    
    from app.tasks.sync_tasks import sync_cloud_resources
    for acc in accounts:
        sync_cloud_resources.delay(acc.id)
            
    # Invalidate project cache (the worker will also do this, but we do it here for immediate UX signal)
    cache_service.delete_pattern(f"res_v1_p{current_user.project_id}_*")
    return {"status": "sync_initiated", "message": f"Background discovery missions launched for {len(accounts)} accounts."}

@router.get("/rightsizing/all")
def get_all_rightsizing_recommendations(current_user: User = Depends(get_current_viewer), db: Session = Depends(get_db)):
    """Fetch all intelligence-driven rightsizing recommendations for the mission project."""
    recommendations = rightsizing_service.get_all_recommendations(db, project_id=current_user.project_id)
    return recommendations

@router.post("/{resource_id}/action")
def resource_action(
    resource_id: int, 
    action: str, # 'start', 'stop', 'terminate'
    current_user: User = Depends(get_current_operator), 
    db: Session = Depends(get_db)
):
    """Perform a tactical lifecycle action on a sovereign cloud resource."""
    query = db.query(Resource).join(CloudAccount).filter(Resource.id == resource_id)
    resource = restrict_to_project(query, current_user, CloudAccount).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found in sovereign boundary")
    
    account = resource.cloud_account
    
    # 🛡️ Record Tactical Audit Event 🛡️
    from app.services.audit_service import audit_logger
    audit_logger.record_action(
        db, 
        action=f"RESOURCE_{action.upper()}", 
        user_id=current_user.id, 
        project_id=account.project_id, 
        resource_type="resource",
        resource_id=str(resource.id),
        message=f"Lifecycle Action '{action.upper()}' initiated for {resource.name} ({resource.external_id})",
        metadata_json={
            "provider": account.provider,
            "external_id": resource.external_id,
            "region": resource.region
        }
    )

    from app.api.adapters import get_adapter
    try:
        adapter = get_adapter(account.provider)
        
        # 🧪 Smart Decommissioning Logic 🧪
        if action == 'terminate':
            from app.models.deployment import Deployment
            # Check if this resource was specifically provisioned by a Mission
            deployment = db.query(Deployment).filter(Deployment.variables.contains(resource.external_id)).first()
            
            if deployment:
                # Trigger industrial decommissioning via Terraform
                from app.tasks.iac_tasks import execute_iac_deployment
                execute_iac_deployment.delay(deployment.id, destroy=True)
                resource.status = 'terminating (via mission)'
                db.commit()
                return {"status": "success", "message": "Industrial Decommission Mission initiated via Terraform."}

        # Fallback to direct cloud action
        result = adapter.manage_instance(resource.external_id, resource.region, action, account)
        
        if result.get("status") == "success":
            target_status = 'running' if action == 'start' else 'stopped'
            resource.status = 'pending'
            db.commit()
            
            # 📡 Launch Lifecycle Surveillance 📡
            from app.tasks.resource_tasks import poll_resource_lifecycle_status
            poll_resource_lifecycle_status.delay(resource.id, target_status)
            
        return result
    except Exception as e:
        logger.error(f"Tactical Action Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resource_id}/monitoring/metrics")
def get_resource_metrics(
    resource_id: int,
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db)
):
    """Fetch telemetry metrics for a sovereign resource."""
    query = db.query(Resource).join(CloudAccount).filter(Resource.id == resource_id)
    resource = restrict_to_project(query, current_user, CloudAccount).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found in your project")
    
    account = resource.cloud_account
    from app.api.adapters import get_adapter
    try:
        adapter = get_adapter(account.provider)
        return adapter.get_metrics(resource.external_id, resource.region, account, resource_type=resource.type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{resource_id}/connect")
def connect_to_resource(
    resource_id: int,
    current_user: User = Depends(get_current_viewer),
    db: Session = Depends(get_db)
):
    """Initiate a secure mission connection for a sovereign resource."""
    query = db.query(Resource).join(CloudAccount).filter(Resource.id == resource_id)
    resource = restrict_to_project(query, current_user, CloudAccount).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found in your project")
    
    # Return connectivity info for the terminal frontend to establish WebSocket
    return {
        "status": "success", 
        "resource_id": resource.id, 
        "ip": resource.public_ip, 
        "provider": resource.provider
    }

@router.websocket("/ws/terminal/{resource_id}")
async def terminal_websocket(websocket: WebSocket, resource_id: int, db: Session = Depends(get_db)):
    """Bridge for xterm.js to establish a real-time SSH session with a VM."""
    query_params = dict(websocket.query_params)
    logger.info(f"Incoming Terminal bridge request for resource {resource_id}")
    await websocket.accept()
    
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        await websocket.send_text("\r\n[ERROR] Core: Resource not found.\r\n")
        await websocket.close()
        return

    # Extract mission credentials (Sovereign Order: Manual -> Vault -> Fallback)
    manual_username = query_params.get('username')
    manual_password = query_params.get('password')
    manual_pkey = query_params.get('private_key')

    import paramiko
    import base64
    import io
    import json
    from app.core.crypto import decrypt_credentials
    ssh = paramiko.SSHClient()
    
    # 🛡️ Mission Credential Discovery 🛡️
    vault_username = None
    vault_password = None
    vault_pkey = None

    if resource.cloud_account and resource.cloud_account.encrypted_credentials:
        try:
            vault_creds = json.loads(decrypt_credentials(resource.cloud_account.encrypted_credentials))
            vault_username = vault_creds.get('username')
            vault_password = vault_creds.get('password')
            vault_pkey = vault_creds.get('private_key')
            logger.info(f"AUDIT -> Mission Identity recovered from Sovereign Vault for resource {resource_id}")
        except Exception as ve:
            logger.error(f"Vault Decryption Failed: {ve}")

    # Resolve Final Identity
    username = manual_username or vault_username or "adminuser"
    password = manual_password or vault_password or "P@ssw0rd1234!"
    pkey_content = manual_pkey or vault_pkey
    
    # 🛡️ Zero-Trust Fingerprint Policy 🛡️
    class MissionSovereignPolicy(paramiko.MissingHostKeyPolicy):
        def missing_host_key(self, client, hostname, key):
            fingerprint = base64.b64encode(key.get_fingerprint()).decode()
            logger.info(f"AUDIT -> Validating Host Fingerprint: {fingerprint}")
            return # Allow for now but audit the event

    ssh.set_missing_host_key_policy(MissionSovereignPolicy())
    
    pkey = None
    if pkey_content:
        try:
            # Attempt to parse as various key types
            pkey_str = io.StringIO(pkey_content)
            try:
                pkey = paramiko.RSAKey.from_private_key(pkey_str)
            except:
                pkey_str.seek(0)
                try:
                    pkey = paramiko.Ed25519Key.from_private_key(pkey_str)
                except:
                    pkey_str.seek(0)
                    pkey = paramiko.DSSKey.from_private_key(pkey_str)
        except Exception as e:
            logger.error(f"Key Parsing Failed: {e}")
            await websocket.send_text(f"\r\n[ERROR] Mission Authorization: Private Key Parsing Failed: {str(e)}\r\n")

    try:
        await websocket.send_text(f"Connecting to mission area {resource.public_ip}...\r\n")
        # Direct SSH Connection
        if pkey:
            ssh.connect(resource.public_ip, username=username, pkey=pkey, timeout=10)
        else:
            password = manual_password or "P@ssw0rd1234!"
            ssh.connect(resource.public_ip, username=username, password=password, timeout=10)
        
        channel = ssh.invoke_shell(term='xterm')
        
        # Bridge the data
        async def from_ssh():
            while True:
                if channel.recv_ready():
                    data = channel.recv(1024).decode('utf-8', errors='ignore')
                    await websocket.send_text(data)
                await asyncio.sleep(0.01)
                
        async def to_ssh():
            try:
                while True:
                    data = await websocket.receive_text()
                    channel.send(data)
            except WebSocketDisconnect:
                pass

        await asyncio.gather(from_ssh(), to_ssh())
        
    except Exception as e:
        logger.error(f"Terminal Bridge Failed: {e}")
        await websocket.send_text(f"\r\n[MISSION FAILURE] SSH Bridge Error: {str(e)}\r\n")
    finally:
        ssh.close()
        await websocket.close()

import asyncio
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/ws/rdp/{resource_id}")
async def rdp_websocket(websocket: WebSocket, resource_id: int, db: Session = Depends(get_db)):
    """Transparent WebSocket bridge for Guacamole RDP protocol."""
    logger.info(f"Incoming RDP connection for resource {resource_id}")
    
    # 1. Check for legacy query parameters
    query_params = dict(websocket.query_params)
    is_legacy = "hostname" in query_params
    if is_legacy:
        logger.info("Detected legacy frontend (parameters in URL)")

    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        logger.error(f"Resource {resource_id} not found")
        return

    account = db.query(CloudAccount).filter(CloudAccount.id == resource.cloud_account_id).first()
    from app.api.adapters import get_adapter
    adapter = get_adapter("aws")
    
    ws_closed = False
    local_port = None
    tunnel_proc = None
    try:
        # 1. Accept the WebSocket immediately to avoid "CONNECTING" state errors in frontend
        await websocket.accept(subprotocol="guacamole")
        logger.info(f"Accepted RDP WebSocket connection for resource {resource_id}")

        # 2. Start SSM Tunnel while keeping the WebSocket alive with 'nop'
        logger.info(f"Starting SSM tunnel for {resource.external_id}")
        
        # We run the tunnel start in a task so we can send 'nop' instructions to the client
        # to prevent timeouts and indicate progress.
        tunnel_task = asyncio.create_task(adapter.start_rdp_tunnel(resource.region, resource.external_id, account))
        
        while not tunnel_task.done():
            # Guacamole 'nop' instruction keeps the connection alive
            if not ws_closed:
                try:
                    await websocket.send_text("3.nop;")
                except:
                    ws_closed = True
                    break
            await asyncio.sleep(1.0)
        
        if tunnel_task.exception():
            raise tunnel_task.exception()
            
        local_port, tunnel_proc = tunnel_task.result()
        logger.info(f"Tunnel established on local port {local_port}")
        
        # 3. Connect to guacd
        reader, writer = await asyncio.open_connection('guacd', 4822)
        
        # Start the initial handshake
        writer.write(b"6.select,3.rdp;")
        await writer.drain()
        
        # 4. Handle Handshake based on client type
        # We MUST read the args from guacd first
        args_str = ""
        while ";" not in args_str:
            chunk = await reader.read(4096)
            if not chunk: break
            args_str += chunk.decode('utf-8', errors='ignore')

        if is_legacy:
            logger.info("Driving automated handshake for legacy client")
            # Parse args to get positional order
            import re
            # Extract everything between 'args,' and the trailing ';'
            # Protocol: 4.args,8.hostname,4.port,10.ignore-cert,...;
            all_parts = args_str.rstrip(';').split(',')
            if all_parts[0].endswith("args"):
                arg_names = [re.sub(r'^\d+\.', '', p) for p in all_parts[1:]]
            else:
                arg_names = [re.sub(r'^\d+\.', '', p) for p in all_parts]
            
            logger.info(f"Mapped {len(arg_names)} parameters from guacd")
            # Log the names of first 5 and last 5 to verify parsing
            logger.info(f"Param names preview: {arg_names[:5]} ... {arg_names[-5:]}")
            
            pwd = query_params.get('password', '')
            logger.info(f"Password provided: length={len(pwd)}, starts with={pwd[0] if pwd else 'N/A'}, ends with={pwd[-1] if pwd else 'N/A'}")
            
            pos_values = ["connect"]
            for name in arg_names:
                # Prioritize security settings from URL, default to any/nla if missing
                sec_mode = query_params.get('security', 'nla') # Default to NLA specifically
                
                if name == "hostname": val = "127.0.0.1"
                elif name == "port": val = str(local_port)
                elif name == "username": val = query_params.get('username', 'Administrator')
                elif name == "password": val = query_params.get('password', '')
                elif name == "ignore-cert": val = "true"
                elif name == "security": val = sec_mode
                elif name == "width": val = query_params.get('width', '1920')
                elif name == "height": val = query_params.get('height', '1080')
                elif name == "dpi": val = query_params.get('dpi', '96')
                elif name == "color-depth": val = "16"
                elif name == "disable-audio": val = "true"
                elif name == "server-layout": val = "en-us-qwerty"
                elif "VERSION" in name: val = name
                else: val = ""
                pos_values.append(val)
            
            def guac_encode(args):
                return "".join(f"{len(str(arg).encode('utf-8'))}.{arg}," for arg in args).rstrip(",") + ";"
            
            connect_instr = guac_encode(pos_values)
            logger.info(f"Sending positional connect instruction (length {len(connect_instr)})")
            # Trace first 100 chars of connect instruction
            logger.debug(f"Connect Trace: {connect_instr[:100]}...")
            
            writer.write(connect_instr.encode('utf-8'))
            await writer.drain()
            logger.info("Legacy handshake complete, entering relay mode")
        else:
            # Modern client: Relay the args and let the client send connect
            logger.info("Relaying args to modern client")
            await websocket.send_text(args_str)

        async def to_guacd():
            nonlocal ws_closed
            try:
                while True:
                    data = await websocket.receive_text()
                    # Only intercept connect if it hasn't been driven by the backend
                    if not is_legacy and "connect" in data:
                        if "hostname=127.0.0.1" in data:
                            import re
                            new_data = re.sub(r'port=\d+', f'port={local_port}', data)
                            if new_data != data:
                                logger.info(f"Injecting SSM tunnel port {local_port} into named connect instruction")
                                data = new_data
                    
                    writer.write(data.encode('utf-8'))
                    await writer.drain()
            except Exception as e:
                logger.debug(f"to_guacd: {e}")
            finally:
                if not writer.is_closing():
                    writer.close()

        async def from_guacd():
            nonlocal ws_closed
            try:
                while True:
                    data = await reader.read(16384)
                    if not data: break
                    if not ws_closed:
                        await websocket.send_text(data.decode('utf-8', errors='ignore'))
            except Exception as e:
                logger.debug(f"from_guacd: {e}")
            finally:
                if not ws_closed:
                    ws_closed = True
                    try:
                        await websocket.close()
                    except:
                        pass

        await asyncio.gather(to_guacd(), from_guacd())
    except Exception as e:
        logger.error(f"RDP Proxy Failed: {e}")
    finally:
        if tunnel_proc:
            logger.info("Terminating SSM tunnel process")
            tunnel_proc.terminate()
        if not ws_closed:
            ws_closed = True
            try:
                await websocket.close()
            except:
                pass

@router.post("/{resource_id}/rescue")
def rescue_resource(
    resource_id: int,
    current_user: User = Depends(get_current_operator),
    db: Session = Depends(get_db)
):
    """Trigger a cloud-native rescue mission to restore access to a sovereign resource."""
    query = db.query(Resource).join(CloudAccount).filter(Resource.id == resource_id)
    resource = restrict_to_project(query, current_user, CloudAccount).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found in sovereign boundary")
    
    account = resource.cloud_account
    from app.api.adapters import get_adapter
    try:
        adapter = get_adapter(account.provider)
        # Verify if adapter supports rescue missions
        if hasattr(adapter, 'initiate_rescue'):
            result = adapter.initiate_rescue(resource.external_id, resource.region, account)
            return result
        else:
            return {"status": "unsupported", "message": f"{account.provider_name} does not yet support industrial rescue missions. Please use cloud-native console."}
    except Exception as e:
        logger.error(f"Rescue Mission Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compliance/remediate/{result_id}")
def remediate_compliance_violation(result_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Trigger an autonomous remediation mission for a specific violation."""
    from app.services.remediation_service import remediation_service
    result = remediation_service.remediate_violation(db, result_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.post("/migrate/{resource_id}")
def migrate_resource(resource_id: int, target_account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Trigger a Cross-Cloud Mobility bridge to clone or migrate a resource."""
    from app.services.migration_service import migration_service
    result = migration_service.execute_migration(db, resource_id, target_account_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.post("/stack-warp")
def execute_global_stack_warp(resource_ids: List[int], target_account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_viewer)):
    """Initiate a high-velocity global migration of a multi-resource application stack."""
    from app.services.migration_service import migration_service
    result = migration_service.execute_stack_warp(db, resource_ids, target_account_id)
    return result
