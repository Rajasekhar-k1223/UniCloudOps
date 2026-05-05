import logging
import json
from typing import List, Dict
from google.cloud import compute_v1
from google.oauth2 import service_account
from app.core.crypto import decrypt_credentials
from app.models.cloud_account import CloudAccount

logger = logging.getLogger(__name__)

class GCPService:
    def __init__(self, account: CloudAccount):
        creds = decrypt_credentials(account.encrypted_credentials)
        
        # The frontend wraps the JSON string in a 'service_account_json' key
        json_str = creds.get('service_account_json')
        if json_str:
            try:
                gcp_info = json.loads(json_str)
            except Exception as e:
                logger.error(f"Failed to parse GCP JSON string: {e}")
                raise ValueError("Invalid GCP Service Account JSON format")
        else:
            # Fallback for direct dict (if added via API manually)
            gcp_info = creds
            
        self.credentials = service_account.Credentials.from_service_account_info(gcp_info)
        self.project_id = gcp_info.get('project_id')
        
    def get_instances(self) -> List[Dict]:
        """Fetch all Compute Engine instances across all zones."""
        instances = []
        try:
            client = compute_v1.InstancesClient(credentials=self.credentials)
            
            # List all instances across all zones (AggregatedList)
            request = compute_v1.AggregatedListInstancesRequest(
                project=self.project_id
            )
            
            pager = client.aggregated_list(request=request)
            
            for zone, response in pager:
                if response.instances:
                    zone_name = zone.split('/')[-1]
                    for instance in response.instances:
                        # Fetch public IP from first network interface
                        public_ip = "N/A"
                        if instance.network_interfaces:
                            for access_config in instance.network_interfaces[0].access_configs:
                                if access_config.nat_i_p:
                                    public_ip = access_config.nat_i_p
                                    break
                                    
                        # Status mapping: GCP uses UPPERCASE tags
                        status = instance.status.lower()
                        
                        # Machine Type
                        machine_type = instance.machine_type.split('/')[-1]
                        
                        # Estimated monthly cost (rough)
                        est_cost = self._estimate_cost(machine_type)
                        
                        instances.append({
                            "external_id": str(instance.id),
                            "name": instance.name,
                            "type": "Compute",
                            "instance_type": machine_type,
                            "os_type": "Linux" if "windows" not in instance.description.lower() else "Windows",
                            "status": status,
                            "region": zone_name,
                            "public_ip": public_ip,
                            "private_ip": instance.network_interfaces[0].network_i_p if instance.network_interfaces else "N/A",
                            "launch_time": instance.creation_timestamp,
                            "cloud_metadata": {
                                "self_link": instance.self_link,
                                "zone": zone_name,
                                "labels": dict(instance.labels),
                                "project_id": self.project_id
                            },
                            "estimated_monthly_cost": est_cost
                        })
            return instances
        except Exception as e:
            logger.error(f"GCP API Error (get_instances): {e}")
            return []

    def _estimate_cost(self, machine_type: str) -> float:
        """Rough monthly cost estimate for common GCP machine types."""
        mt = machine_type.lower()
        if 'f1-tiny' in mt: return 3.80
        if 'g1-small' in mt: return 13.80
        if 'n1-standard-1' in mt: return 24.50
        if 'e2-medium' in mt: return 25.00
        if 'n1-standard-2' in mt: return 49.00
        return 0.0

    def manage_instance(self, zone: str, instance_name: str, action: str):
        """Perform actions: start, stop, reset, delete."""
        client = compute_v1.InstancesClient(credentials=self.credentials)
        try:
            if action == 'start':
                return client.start(project=self.project_id, zone=zone, instance=instance_name)
            elif action == 'stop':
                return client.stop(project=self.project_id, zone=zone, instance=instance_name)
            elif action == 'terminate':
                return client.delete(project=self.project_id, zone=zone, instance=instance_name)
            elif action == 'reset':
                return client.reset(project=self.project_id, zone=zone, instance=instance_name)
        except Exception as e:
            logger.error(f"GCP Action Failed ({action}): {e}")
            raise e
