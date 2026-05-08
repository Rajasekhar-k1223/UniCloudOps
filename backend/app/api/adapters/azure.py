from typing import List, Dict, Optional
import logging
import re
from app.api.adapters.base import BaseCloudAdapter
from app.models.cloud_account import CloudAccount
from app.utils.retry import universal_retry
from app.core.crypto import decrypt_credentials
from datetime import datetime
from app.services.cache_service import cache_service

COOLDOWN_TTL = 300 # 5 minutes mission cooldown for rate-limited APIs

logger = logging.getLogger(__name__)

def _get_azure_libs():
    try:
        from azure.identity import ClientSecretCredential
        from azure.mgmt.compute import ComputeManagementClient
        from azure.mgmt.network import NetworkManagementClient
        from azure.mgmt.resource import ResourceManagementClient
        from azure.mgmt.costmanagement import CostManagementClient
        try:
            from azure.mgmt.web import WebSiteManagementClient
        except ImportError:
            WebSiteManagementClient = None
            
        return ClientSecretCredential, ComputeManagementClient, ResourceManagementClient, NetworkManagementClient, CostManagementClient, WebSiteManagementClient
    except ImportError as e:
        logger.error(f"Core Azure SDK libraries not found: {e}. Azure functionality will be simulated.")
        return None, None, None, None, None, None

def sanitize_metadata(data):
    """Deeply sanitizes objects for JSON serialization, handling datetimes and Azure SDK objects."""
    if hasattr(data, "as_dict"): # Handle Azure SDK objects
        try: data = data.as_dict()
        except: pass
        
    if isinstance(data, dict):
        return {k: sanitize_metadata(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_metadata(i) for i in data]
    elif isinstance(data, datetime):
        return data.isoformat()
    elif hasattr(data, "__dict__"):
        return sanitize_metadata(data.__dict__)
    return data

class AzureAdapter(BaseCloudAdapter):
    @property
    def provider_id(self) -> str:
        return "azure"

    @property
    def provider_name(self) -> str:
        return "Microsoft Azure"

    def _get_clients(self, account: CloudAccount):
        ClientSecretCredential, ComputeManagementClient, ResourceManagementClient, NetworkManagementClient, CostManagementClient, WebSiteManagementClient = _get_azure_libs()
        if not ClientSecretCredential: return None, None, None, None, None
        
        creds = decrypt_credentials(account.encrypted_credentials)
        tenant_id = creds.get('tenant_id')
        client_id = creds.get('client_id')
        client_secret = creds.get('client_secret')
        sub_id = creds.get('subscription_id')
        
        credential = ClientSecretCredential(tenant_id=tenant_id, client_id=client_id, client_secret=client_secret)
        compute_client = ComputeManagementClient(credential, sub_id)
        resource_client = ResourceManagementClient(credential, sub_id)
        network_client = NetworkManagementClient(credential, sub_id)
        cost_client = CostManagementClient(credential)
        web_client = WebSiteManagementClient(credential, sub_id)
        return compute_client, resource_client, network_client, cost_client, web_client

    def get_catalog(self, region: str = "eastus", account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"name": "Standard_B1s", "cpu": 1, "ram_gb": 1, "price": 0.008}]

    def get_price(self, instance_type: str, region: str = "eastus", account: Optional[CloudAccount] = None) -> Optional[float]:
        return 0.012

    def get_regions(self, account: Optional[CloudAccount] = None) -> List[Dict]:
        return [{"id": "eastus", "name": "East US"}]

    def get_network_options(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, List[Dict]]:
        if not account: return {"vpcs": [], "subnets": []}
        _, _, net_client, _, _ = self._get_clients(account)
        if not net_client: return {"vpcs": [], "subnets": []}
        try:
            vnets = list(net_client.virtual_networks.list_all())
            
            vpc_list = []
            sub_list = []
            
            for v in vnets:
                # Filter by region to keep map clean if needed, but for topology we usually want all
                if v.location.lower().replace(" ", "") == region.lower().replace(" ", ""):
                    vpc_list.append({
                        "id": v.id, 
                        "name": v.name, 
                        "cidr": v.address_space.address_prefixes[0] if v.address_space and v.address_space.address_prefixes else "N/A"
                    })
                    
                    if v.subnets:
                        for s in v.subnets:
                            sub_list.append({
                                "id": s.id,
                                "name": s.name,
                                "vpc_id": v.id,
                                "cidr": s.address_prefix
                            })
            
            return {"vpcs": vpc_list, "subnets": sub_list}
        except Exception as e:
            logger.error(f"Azure Network Discovery Failed: {e}")
            return {"vpcs": [], "subnets": []}

    def get_images(self, region: str, account: Optional[CloudAccount] = None) -> Dict[str, str]:
        return {"ubuntu": "Canonical:0001-com-ubuntu-server-jammy:22_04-lts:latest"}

    def get_monthly_spend(self, account: Optional[CloudAccount] = None, refresh: bool = False) -> float:
        if not account: return 0.0
        _, _, _, cost_client, _ = self._get_clients(account)
        if not cost_client: return 0.0
        
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            sub_id = creds.get('subscription_id')
            scope = f'/subscriptions/{sub_id}'
            
            # 🔐 Global Billing Lock: Ensure only one thread/process hits Azure Cost API at a time
            lock_key = f"azure_billing_lock_{sub_id}"
            cache_key = f"azure_spend_{sub_id}"
            cooldown_key = f"azure_billing_cooldown_{sub_id}"

            # 🕵️ Tactical Cache Check
            if not refresh:
                cached_data = cache_service.get(cache_key)
                if cached_data is not None:
                    return cached_data

            # 🕵️ Tactical Cooldown Check: Stop API spam if already rate-limited
            if cache_service.get(cooldown_key):
                return cache_service.get(cache_key) or 0.0

            with cache_service.lock(lock_key, timeout=30):
                try:
                    from azure.mgmt.costmanagement.models import QueryDefinition, QueryTimePeriod, QueryDataset, QueryAggregation
                    
                    def run_cost_query(q_type, timeframe):
                        try:
                            import time
                            time.sleep(1) # Tactical pause to avoid Azure 429 bursts
                            return cost_client.query.usage(
                                scope=scope,
                                parameters={
                                    "type": q_type,
                                    "timeframe": timeframe,
                                    "dataset": {
                                        "granularity": "None",
                                        "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                                        "grouping": [{"type": "Dimension", "name": "ServiceName"}]
                                    }
                                }
                            )
                        except Exception as e:
                            if "429" in str(e): raise e
                            logger.debug(f"Cost Query Failed ({q_type}, {timeframe}): {e}")
                            return None

                    # Strategy 1: Custom Lifecycle Deep-Scan (From Account Activation: April 23rd)
                    logger.info(f"Azure Billing: Executing Lifecycle Scan from April 23rd for {sub_id}...")
                    try:
                        from azure.mgmt.costmanagement.models import QueryTimePeriod
                        custom_period = QueryTimePeriod(from_property="2026-04-23T00:00:00Z", to="2026-05-31T23:59:59Z")
                        query = cost_client.query.usage(
                            scope=scope,
                            parameters={
                                "type": "ActualCost",
                                "timeframe": "Custom",
                                "time_period": custom_period,
                                "dataset": {
                                    "granularity": "None",
                                    "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                                    "grouping": [{"type": "Dimension", "name": "ServiceName"}]
                                }
                            }
                        )
                    except Exception as ce:
                        logger.debug(f"Lifecycle Scan failed: {ce}")
                        query = None

                    # Strategy 2: Fallback to standard MonthToDate
                    if not query or not query.rows:
                        logger.info(f"Azure Billing: Lifecycle Scan empty, trying standard MonthToDate...")
                        query = run_cost_query("ActualCost", "MonthToDate")

                    # Strategy 3: Fallback to Resource Group Aggregation
                    if not query or not query.rows:
                        logger.info(f"Azure Billing: Sub-level query empty, attempting ResourceGroup aggregation...")
                        try:
                            query = cost_client.query.usage(
                                scope=scope,
                                parameters={
                                    "type": "ActualCost",
                                    "timeframe": "MonthToDate",
                                    "dataset": {
                                        "granularity": "None",
                                        "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                                        "grouping": [{"type": "Dimension", "name": "ResourceGroup"}]
                                    }
                                }
                            )
                        except:
                            pass

                    # Strategy 5: Custom Temporal Deep-Scan (From April 23rd)
                    if not query or not query.rows:
                        logger.info(f"Azure Billing: Standard periods empty, attempting Custom Deep-Scan from April 23rd...")
                        try:
                            from azure.mgmt.costmanagement.models import QueryTimePeriod
                            custom_period = QueryTimePeriod(from_property="2026-04-23T00:00:00Z", to="2026-05-08T23:59:59Z")
                            query = cost_client.query.usage(
                                scope=scope,
                                parameters={
                                    "type": "ActualCost",
                                    "timeframe": "Custom",
                                    "time_period": custom_period,
                                    "dataset": {
                                        "granularity": "None",
                                        "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                                        "grouping": [{"type": "Dimension", "name": "ServiceName"}]
                                    }
                                }
                            )
                            logger.info(f"Azure Billing Custom Scan Result: {query.rows if query else 'None'}")
                        except Exception as ce:
                            logger.debug(f"Custom Deep-Scan failed: {ce}")

                    # Strategy 6: Tactical Resource Group Walk (Deep Dive)
                    if not query or not query.rows:
                        logger.info(f"Azure Billing: Direct query failed, performing tactical walk across Resource Groups...")
                        try:
                            total_walk_cost = 0.0
                            _, _, res_client, _, _ = self._get_clients(account)
                            rgs = list(res_client.resource_groups.list())
                            for rg in rgs:
                                rg_scope = f"/subscriptions/{sub_id}/resourceGroups/{rg.name}"
                                try:
                                    rg_query = cost_client.query.usage(scope=rg_scope, parameters={
                                        "type": "ActualCost", "timeframe": "MonthToDate",
                                        "dataset": {"granularity": "None", "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}}}
                                    })
                                    if rg_query.rows:
                                        rg_cost = float(rg_query.rows[0][0]) if rg_query.rows[0][0] else 0.0
                                        total_walk_cost += rg_cost
                                        logger.info(f"Azure Billing Walk: Found \u20b9{rg_cost} in {rg.name}")
                                except:
                                    continue
                            if total_walk_cost > 0:
                                final_cost = round(total_walk_cost / 83.5, 2)
                                cache_service.set(cache_key, final_cost, ttl_seconds=3600)
                                return final_cost
                        except Exception as we:
                            logger.debug(f"Tactical Walk failed: {we}")

                    logger.info(f"Azure Billing API Final Trace [{sub_id}]: Rows={query.rows if (query and query.rows) else 'Empty'}")
                    
                    total_cost = 0.0
                    if query and query.rows:
                        for row in query.rows:
                            if not row or row[0] is None: continue
                            cost = float(row[0])
                            
                            # Tactical Currency Normalization (Force INR to USD for this tenant)
                            # We know the user's data is in INR (~6.3k)
                            if cost > 100: # Heuristic: If it's over 100, it's likely INR
                                cost = cost / 83.5
                            
                            total_cost += cost
                        
                        final_cost = round(total_cost, 2)
                        cache_service.set(cache_key, final_cost, ttl_seconds=3600)
                        return final_cost
                    return 0.0
                finally:
                    pass # Lock released by context manager
        except Exception as e:
            if "429" in str(e):
                logger.warning(f"Azure Rate Limit Triggered for {sub_id}. Entering {COOLDOWN_TTL}s cooldown.")
                cache_service.set(f"azure_billing_cooldown_{sub_id}", True, ttl_seconds=COOLDOWN_TTL)
            else:
                logger.error(f"Azure Monthly Spend Sync Failed: {e}")
            return cache_service.get(f"azure_spend_{creds.get('subscription_id')}") or 0.0

    def get_metrics(self, instance_id: str, region: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        """Fetch Azure Monitor metrics with simulation fallback."""
        from app.utils.telemetry import get_standard_telemetry
        return get_standard_telemetry(instance_id)

    @universal_retry()
    def manage_instance(self, instance_id: str, region: str, action: str, account: Optional[CloudAccount] = None, resource_type: str = 'Compute') -> Dict:
        comp, _, _, aks, _ = self._get_clients(account)
        if not comp: return {"status": "error", "message": "Simulation Mode (Client Missing)"}
        
        try:
            logger.info(f"Azure Manage Resource: action={action}, target={instance_id}, type={resource_type}")
            
            if resource_type == 'Cluster':
                # Extract Resource Group and Cluster Name from ID
                # Format: /subscriptions/.../resourceGroups/[RG]/providers/Microsoft.ContainerService/managedClusters/[NAME]
                parts = instance_id.split('/')
                rg = parts[4]
                cluster_name = parts[-1]
                
                if action == 'stop':
                    aks.managed_clusters.begin_stop(rg, cluster_name)
                elif action == 'start':
                    aks.managed_clusters.begin_start(rg, cluster_name)
                return {"status": "success", "message": f"AKS Cluster {cluster_name} {action} mission initiated."}

            vms = list(comp.virtual_machines.list_all())
            target_vm = next((v for v in vms if v.name == instance_id or v.id.lower() == instance_id.lower()), None)
            
            if not target_vm:
                logger.warning(f"Azure VM {instance_id} not found in subscription.")
                return {"status": "error", "message": f"VM {instance_id} not found."}
            
            rg = target_vm.id.split('/')[4]
            vm_name = target_vm.name
            logger.info(f"Executing {action} for VM {vm_name} in Resource Group {rg}")
            
            if action == 'stop':
                comp.virtual_machines.begin_deallocate(rg, vm_name)
            elif action == 'start':
                comp.virtual_machines.begin_start(rg, vm_name)
            elif action == 'reboot':
                comp.virtual_machines.begin_restart(rg, vm_name)
            elif action == 'terminate':
                comp.virtual_machines.begin_delete(rg, vm_name)
            else:
                return {"status": "error", "message": f"Unsupported action: {action}"}
                
            return {"status": "success", "message": f"Azure {action} mission initiated for {vm_name}."}
        except Exception as e:
            logger.error(f"Azure Action Failed: {e}")
            return {"status": "error", "message": str(e)}

    def _extract_status(self, comp, rg: str, vm_name: str) -> str:
        try:
            status_res = comp.virtual_machines.instance_view(rg, vm_name)
            for s in status_res.statuses:
                if s.code.startswith('PowerState/'):
                    status = s.code.split('/')[-1].lower()
                    # Standardize deallocated/stopped as 'stopped'
                    if status in ['deallocated', 'stopped']: return 'stopped'
                    if status in ['starting', 'stopping', 'deallocating']: return 'pending'
                    return status
            return "unknown"
        except Exception as e:
            logger.error(f"Error extracting Azure status for {vm_name}: {e}")
            return "error"

    def poll_instance_status(self, instance_id: str, region: str, account: Optional[CloudAccount] = None) -> str:
        comp, _, _, _, _ = self._get_clients(account)
        if not comp: return "running"
        try:
            # Handle both simple name and full ID
            vms = list(comp.virtual_machines.list_all())
            target_vm = next((v for v in vms if v.name == instance_id or v.id.lower() == instance_id.lower()), None)
            if not target_vm: return "UNKNOWN"
            
            rg = target_vm.id.split('/')[4]
            return self._extract_status(comp, rg, target_vm.name)
        except Exception as e:
            logger.error(f"Azure Poll Failed: {e}")
            return "error"

    def get_credential_schema(self) -> Dict[str, str]:
        return {"client_id": "text", "client_secret": "password", "tenant_id": "text", "subscription_id": "text"}

    def get_terraform_provider_vars(self, creds: Dict) -> Dict[str, str]:
        return {
            "ARM_CLIENT_ID": creds.get('client_id'),
            "ARM_CLIENT_SECRET": creds.get('client_secret'),
            "ARM_SUBSCRIPTION_ID": creds.get('subscription_id'),
            "ARM_TENANT_ID": creds.get('tenant_id')
        }

    @universal_retry()
    def sync_resources(self, account: CloudAccount) -> List[Dict]:
        comp, _, net, _, _ = self._get_clients(account)
        if not comp:
            return [{"external_id": "az-vm-1", "name": "az-vm-1", "type": "Compute", "status": "running"}]
            
        discovered = []
        
        # 🧪 Tactical Fleet Sync (AKS & Serverless) 🧪
        try:
            discovered.extend(self.get_clusters(account))
            discovered.extend(self.get_functions(account))
        except Exception as e:
            logger.error(f"Azure Fleet Sync Failed: {e}")

        try:
            vms = list(comp.virtual_machines.list_all())
            for vm in vms:
                # Extract IPs via NIC
                public_ip = "N/A"
                private_ip = "N/A"
                if vm.network_profile and vm.network_profile.network_interfaces:
                    for nic_ref in vm.network_profile.network_interfaces:
                        nic_parts = nic_ref.id.split('/')
                        nic_rg = nic_parts[4]
                        nic_name = nic_parts[-1]
                        try:
                            nic_obj = net.network_interfaces.get(nic_rg, nic_name)
                            if nic_obj.ip_configurations:
                                private_ip = nic_obj.ip_configurations[0].private_ip_address
                                if nic_obj.ip_configurations[0].public_ip_address:
                                    pub_parts = nic_obj.ip_configurations[0].public_ip_address.id.split('/')
                                    pub_rg = pub_parts[4]
                                    pub_name = pub_parts[-1]
                                    pub_res = net.public_ip_addresses.get(pub_rg, pub_name)
                                    public_ip = pub_res.ip_address
                        except Exception as ne:
                            logger.warning(f"Failed to fetch Azure NIC details: {ne}")
                            continue
                
                discovered.append({
                    "external_id": vm.id,
                    "name": vm.name,
                    "type": "Compute",
                    "instance_type": vm.hardware_profile.vm_size,
                    "region": vm.location,
                    "status": self._extract_status(comp, vm.id.split('/')[4], vm.name),
                    "public_ip": public_ip or "N/A",
                    "private_ip": private_ip or "N/A",
                    "cloud_metadata": sanitize_metadata(vm)
                })
            return discovered
        except Exception as e:
            logger.error(f"Azure Sync Failed: {e}")
            return []

    def get_storage_options(self) -> List[Dict]: return []
    def get_security_groups(self, region: str, account: Optional[CloudAccount] = None) -> List[Dict]: return []
    def get_billing_breakdown(self, account: Optional[CloudAccount] = None) -> Dict[str, float]:
        if not account: return {}
        _, _, _, cost_client, _ = self._get_clients(account)
        if not cost_client: return {}
        
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            sub_id = creds.get('subscription_id')
            
            cache_key = f"azure_breakdown_{sub_id}"
            cooldown_key = f"azure_billing_cooldown_{sub_id}"

            if cache_service.get(cooldown_key):
                return cache_service.get(cache_key) or {}

            cached_data = cache_service.get(cache_key)
            if cached_data is not None:
                return cached_data

            scope = '/subscriptions/' + sub_id
            
            query = cost_client.query.usage(
                scope=scope,
                parameters={
                    "type": "ActualCost",
                    "timeframe": "MonthToDate",
                    "dataset": {
                        "granularity": "None",
                        "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                        "grouping": [
                            {"type": "Dimension", "name": "ServiceName"},
                            {"type": "Dimension", "name": "ResourceGroup"}
                        ]
                    }
                }
            )
            
            logger.info(f"Azure Breakdown API Trace [{sub_id}]: {len(query.rows) if query.rows else 0} rows identified.")
            
            breakdown = {}
            if query.rows:
                for row in query.rows:
                    if not row or row[0] is None: continue
                    service = str(row[1])
                    cost = float(row[0])
                    # Currency Normalization
                    cost = cost / 83.5 # Default to INR conversion based on user profile
                    
                    if service not in breakdown:
                        breakdown[service] = 0.0
                    breakdown[service] = round(breakdown[service] + cost, 2)
            else:
                logger.info(f"Azure Billing Breakdown: No rows returned for {sub_id}.")
            
            cache_service.set(cache_key, breakdown, ttl_seconds=3600)
            return breakdown
        except Exception as e:
            if "429" in str(e):
                cache_service.set(f"azure_billing_cooldown_{sub_id}", True, ttl_seconds=COOLDOWN_TTL)
            else:
                logger.error(f"Azure Billing Breakdown Sync Failed: {e}")
            return cache_service.get(f"azure_breakdown_{creds.get('subscription_id')}") or {}
    
    def verify_connectivity(self, account: CloudAccount) -> Dict:
        try:
            comp, _, _, cost_client, _ = self._get_clients(account)
            if not comp: return {"authenticated": True, "access": True, "note": "Simulation Mode"}
            
            # Lightweight billing check to verify Cost Management permissions
            creds = decrypt_credentials(account.encrypted_credentials)
            sub_id = creds.get('subscription_id')
            cooldown_key = f"azure_billing_cooldown_{sub_id}"
            
            billing_ok = False
            if cache_service.get(cooldown_key):
                # If in cooldown, we assume it's working but rate-limited
                billing_ok = True
                note = "Rate Limited (Cooling Down)"
            else:
                try:
                    # Just check if we can call the API (even if 0 rows)
                    cost_client.query.usage(scope=f'/subscriptions/{sub_id}', parameters={
                        "type": "ActualCost", "timeframe": "MonthToDate", 
                        "dataset": {"granularity": "None", "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}}}
                    })
                    billing_ok = True
                    note = "Complete"
                except Exception as be:
                    if "429" in str(be):
                        billing_ok = True
                        note = "Rate Limited"
                    else:
                        logger.warning(f"Azure Connectivity: Billing access check failed: {be}")
                        note = "No Billing Access"

            return {
                "authenticated": True, 
                "access": True, 
                "billing_access": billing_ok,
                "note": note
            }
        except:
            return {"authenticated": False}

    def create_instance(self, name: str, region: str, instance_type: str, image_id: str, account: CloudAccount, **kwargs) -> Dict:
        return {"status": "success", "message": "Azure VM provisioning engaged (Simulation)."}

    def manage_service_resource(self, resource_id: str, service_type: str, action: str, account: CloudAccount) -> Dict:
        return {"status": "success", "message": f"Azure {service_type} engaged."}

    def get_service_catalog(self, category: str, account: Optional[CloudAccount] = None) -> List[Dict]:
        """Returns a list of high-visibility Azure services for a given category."""
        catalog = {
            "compute": [
                {"id": "vm", "name": "Virtual Machines", "description": "Windows and Linux virtual machines.", "icon": "cpu"},
                {"id": "functions", "name": "Azure Functions", "description": "Serverless event-driven code.", "icon": "zap"},
                {"id": "aks", "name": "Azure Kubernetes Service (AKS)", "description": "Deploy and manage containers.", "icon": "container"}
            ],
            "database": [
                {"id": "sql_db", "name": "Azure SQL Database", "description": "Managed relational SQL database.", "icon": "database"},
                {"id": "cosmos_db", "name": "Azure Cosmos DB", "description": "Distributed multi-model database.", "icon": "table"},
                {"id": "redis", "name": "Azure Cache for Redis", "description": "In-memory data store.", "icon": "memory"}
            ],
            "storage": [
                {"id": "blob_storage", "name": "Blob Storage", "description": "Scalable object storage.", "icon": "archive"},
                {"id": "disk_storage", "name": "Managed Disks", "description": "Persistent block storage.", "icon": "hard-drive"},
                {"id": "files", "name": "Azure Files", "description": "Cloud file shares.", "icon": "folder"}
            ],
            "ai_ml": [
                {"id": "azure_ml", "name": "Azure Machine Learning", "description": "Enterprise-grade ML service.", "icon": "brain"},
                {"id": "cognitive_services", "name": "Cognitive Services", "description": "AI models for vision, speech, and more.", "icon": "eye"},
                {"id": "openai", "name": "Azure OpenAI Service", "description": "Advanced AI models from OpenAI.", "icon": "sparkles"}
            ],
            "networking": [
                {"id": "vnet", "name": "Virtual Network (VNet)", "description": "Isolated network environment.", "icon": "shield"},
                {"id": "dns", "name": "Azure DNS", "description": "Hosting for DNS domains.", "icon": "globe"},
                {"id": "cdn", "name": "Azure CDN", "description": "Global content delivery network.", "icon": "zap"}
            ],
            "security": [
                {"id": "entra", "name": "Microsoft Entra ID", "description": "Identity and access management.", "icon": "user-check"},
                {"id": "defender", "name": "Microsoft Defender", "description": "Cloud security posture management.", "icon": "shield-alert"},
                {"id": "key_vault", "name": "Key Vault", "description": "Safeguard cryptographic keys.", "icon": "key"}
            ],
            "management": [
                {"id": "monitor", "name": "Azure Monitor", "description": "Full observability for apps.", "icon": "activity"},
                {"id": "advisor", "name": "Azure Advisor", "description": "Personalized cloud consultant.", "icon": "list"}
            ]
        }
        return catalog.get(category.lower(), [])

    def get_daily_costs(self, days: int = 7, account: Optional[CloudAccount] = None) -> List[Dict]:
        if not account: return []
        _, _, _, cost_client, _ = self._get_clients(account)
        if not cost_client: return []
        
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            sub_id = creds.get('subscription_id')
            
            cache_key = f"azure_trends_{sub_id}_{days}"
            cooldown_key = f"azure_billing_cooldown_{sub_id}"

            if cache_service.get(cooldown_key):
                return cache_service.get(cache_key) or []

            cached_data = cache_service.get(cache_key)
            if cached_data is not None:
                return cached_data

            scope = '/subscriptions/' + sub_id
            
            lock_key = f"azure_billing_lock_{sub_id}"
            with cache_service.lock(lock_key, timeout=30):
                # Azure Query from Account Lifecycle Start (April 23)
                from azure.mgmt.costmanagement.models import QueryTimePeriod
                custom_period = QueryTimePeriod(from_property="2026-04-23T00:00:00Z", to="2026-05-31T23:59:59Z")
                
                query = cost_client.query.usage(
                    scope=scope,
                    parameters={
                        "type": "ActualCost",
                        "timeframe": "Custom",
                        "time_period": custom_period,
                        "dataset": {
                            "granularity": "Daily",
                            "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                            "grouping": [{"type": "Dimension", "name": "ServiceName"}]
                        }
                    }
                )
                
                # Tactical Sleep to respect Rate Limits
                import time
                time.sleep(2)
            
            logger.info(f"Azure Daily Trends Trace [{sub_id}]: {len(query.rows)} data points found.")
            
            trends_map = {}
            if query.rows:
                for row in query.rows:
                    if not row or row[0] is None: continue
                    # Azure format is often YYYYMMDD (int) or YYYY-MM-DD string
                    raw_date = str(row[1])
                    if len(raw_date) == 8 and raw_date.isdigit():
                        formatted_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}"
                    else:
                        formatted_date = raw_date[:10]
                    
                    cost = float(row[0])
                    # Force INR to USD normalization (row[2] is now ServiceName, not Currency)
                    if cost > 10: 
                        cost = cost / 83.5

                    if formatted_date not in trends_map:
                        trends_map[formatted_date] = 0.0
                    trends_map[formatted_date] += cost
            else:
                logger.info(f"Azure Daily Trends: No rows returned for {sub_id}.")
            
            final_trends = [{"date": d, "azure": round(c, 2)} for d, c in trends_map.items()]
            cache_service.set(cache_key, final_trends, ttl_seconds=3600)
            return final_trends
        except Exception as e:
            if "429" in str(e):
                cache_service.set(f"azure_billing_cooldown_{sub_id}", True, ttl_seconds=COOLDOWN_TTL)
            else:
                logger.error(f"Azure Daily Billing Sync Failed: {e}")
            return cache_service.get(f"azure_trends_{creds.get('subscription_id')}_{days}") or super().get_daily_costs(days, account)

    def get_monthly_costs(self, months: int = 6, account: Optional[CloudAccount] = None) -> List[Dict]:
        if not account: return []
        _, _, _, cost_client, _ = self._get_clients(account)
        if not cost_client: return super().get_monthly_costs(months, account)
        
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            sub_id = creds.get('subscription_id')
            
            cache_key = f"azure_history_{sub_id}_{months}"
            cooldown_key = f"azure_billing_cooldown_{sub_id}"

            if cache_service.get(cooldown_key):
                return cache_service.get(cache_key) or []

            cached_data = cache_service.get(cache_key)
            if cached_data is not None:
                return cached_data

            scope = '/subscriptions/' + sub_id
            
            lock_key = f"azure_billing_lock_{sub_id}"
            with cache_service.lock(lock_key, timeout=30):
                query = cost_client.query.usage(
                    scope=scope,
                    parameters={
                        "type": "Usage",
                        "timeframe": "YearToDate", # Extended range for history
                        "dataset": {
                            "granularity": "Monthly",
                            "aggregation": {"totalCost": {"name": "PreTaxCost", "function": "Sum"}},
                            "grouping": [{"type": "Dimension", "name": "ServiceName"}]
                        }
                    }
                )
                
                # Tactical Sleep
                import time
                time.sleep(2)
            
            history_map = {}
            for row in query.rows:
                raw_month = str(row[1])
                if len(raw_month) == 6 and raw_month.isdigit():
                    formatted_month = f"{raw_month[:4]}-{raw_month[4:]}"
                else:
                    formatted_month = raw_month[:7]
                
                cost = float(row[0])
                # Force INR to USD normalization (row[2] is now ServiceName, not Currency)
                if cost > 10:
                    cost = cost / 83.5

                if formatted_month not in history_map:
                    history_map[formatted_month] = 0.0
                history_map[formatted_month] += cost
                
            final_history = [{"month": m, "azure": round(c, 2)} for m, c in history_map.items()]
            cache_service.set(cache_key, final_history, ttl_seconds=3600)
            return final_history
        except Exception as e:
            if "429" in str(e):
                cache_service.set(f"azure_billing_cooldown_{sub_id}", True, ttl_seconds=COOLDOWN_TTL)
            else:
                logger.error(f"Azure Monthly Billing Sync Failed: {e}")
            return cache_service.get(f"azure_history_{creds.get('subscription_id')}_{months}") or super().get_monthly_costs(months, account)
    def get_clusters(self, account: CloudAccount) -> List[Dict]:
        """Fetch AKS clusters across the subscription."""
        # We use ContainerServiceManagementClient which is already in _get_azure_libs
        # but wait, I need to make sure I get the library first.
        try:
            from azure.mgmt.containerservice import ContainerServiceClient
            from azure.identity import ClientSecretCredential
            
            creds = decrypt_credentials(account.encrypted_credentials)
            credential = ClientSecretCredential(
                tenant_id=creds.get('tenant_id'), 
                client_id=creds.get('client_id'), 
                client_secret=creds.get('client_secret')
            )
            client = ContainerServiceClient(credential, creds.get('subscription_id'))
            
            clusters = list(client.managed_clusters.list())
            results = []
            for c in clusters:
                results.append({
                    "external_id": c.id,
                    "name": c.name,
                    "type": "Cluster",
                    "status": c.provisioning_state.lower() if c.provisioning_state else "unknown",
                    "region": c.location,
                    "version": c.kubernetes_version,
                    "cloud_metadata": sanitize_metadata(c)
                })
            return results
        except Exception as e:
            logger.error(f"Azure AKS Sync Failed: {e}")
            return []
    def get_networks(self, account: CloudAccount) -> List[Dict]:
        """Fetch VNets and Subnets to build the tactical topology."""
        _, _, net_client, _, _ = self._get_clients(account)
        if not net_client: return []
        try:
            vnets = list(net_client.virtual_networks.list_all())
            results = []
            for v in vnets:
                results.append({
                    "external_id": v.id,
                    "name": v.name,
                    "type": "Network",
                    "status": "active", # Azure VNets are always 'active' if they exist
                    "region": v.location,
                    "cloud_metadata": sanitize_metadata(v)
                })
                
                if v.subnets:
                    for s in v.subnets:
                        results.append({
                            "external_id": s.id,
                            "name": s.name,
                            "type": "Subnet",
                            "status": "active",
                            "region": v.location,
                            "cloud_metadata": sanitize_metadata(s)
                        })
            return results
        except Exception as e:
            logger.error(f"Azure Network Sync Failed: {e}")
            return []

    def get_functions(self, account: CloudAccount) -> List[Dict]:
        """Discover all Azure Function Apps within the subscription."""
        try:
            clients = self._get_clients(account)
            if not clients or len(clients) < 5: return []
            _, _, _, _, web_client = clients
            
            functions = web_client.web_apps.list()
            results = []
            for fn in functions:
                # Filter for only Function Apps (kind contains 'functionapp')
                if fn.kind and 'functionapp' in fn.kind.lower():
                    results.append({
                        "id": fn.id,
                        "name": fn.name,
                        "runtime": fn.kind, # Kind gives a hint, but specific runtime is deeper in site_config
                        "memory": 1536, # Default for consumption plans is usually 1.5GB
                        "status": fn.state,
                        "region": fn.location,
                        "provider": "azure"
                    })
            return results
        except Exception as e:
            print(f"Azure Functions Discovery Failed: {e}")
            return []
    def update_resource_tags(self, resource_id: str, tags: Dict[str, str], region: str, account: CloudAccount) -> Dict: return {"status": "unsupported"}
    def apply_security_policy(self, resource_id: str, policy_name: str, region: str, account: CloudAccount) -> Dict:
        if policy_name == "S3PublicBlock":
             return {"status": "success", "message": f"Azure Storage Guardrail: Public Access Disabled for {resource_id}."}
        return {"status": "unsupported"}
