from typing import List, Dict, Optional

# Mapping of Universal Service Categories to Provider-Specific Services
SERVICE_REGISTRY = {
    "compute": {
        "aws": "EC2",
        "azure": "Virtual Machines",
        "gcp": "Compute Engine",
        "digitalocean": "Droplets",
        "alibaba": "ECS",
        "ibm": "VSI",
        "linode": "Linodes",
        "vultr": "Cloud Compute",
        "contabo": "VPS"
    },
    "storage": {
        "aws": "S3",
        "azure": "Blob Storage",
        "gcp": "Cloud Storage",
        "digitalocean": "Spaces",
        "alibaba": "OSS",
        "ibm": "Object Storage",
        "linode": "Object Storage",
        "vultr": "Object Storage",
        "contabo": "Object Storage"
    },
    "database": {
        "aws": "RDS",
        "azure": "SQL Database",
        "gcp": "Cloud SQL",
        "digitalocean": "Managed Databases",
        "alibaba": "ApsaraDB",
        "ibm": "Cloud Databases",
        "linode": "Managed DB",
        "vultr": "Managed DB",
        "contabo": "Managed DB"
    },
    "serverless": {
        "aws": "Lambda",
        "azure": "Functions",
        "gcp": "Cloud Functions",
        "digitalocean": "Functions",
        "alibaba": "Function Compute",
        "ibm": "Code Engine"
    },
    "containers": {
        "aws": "EKS",
        "azure": "AKS",
        "gcp": "GKE",
        "digitalocean": "Kubernetes",
        "alibaba": "ACK",
        "ibm": "IKS",
        "linode": "LKE",
        "vultr": "VKE"
    },
    "ai_ml": {
        "aws": "SageMaker",
        "azure": "Machine Learning",
        "gcp": "Vertex AI",
        "alibaba": "PAI"
    },
    "networking": {
        "aws": "Route 53 / VPC",
        "azure": "Azure DNS / VNet",
        "gcp": "Cloud DNS",
        "alibaba": "PrivateZone / VPC",
        "ibm": "DNS / VPC"
    },
    "security": {
        "aws": "IAM / KMS",
        "azure": "Entra ID / Key Vault",
        "gcp": "Cloud IAM",
        "alibaba": "RAM / KMS"
    },
    "dev_tools": {
        "aws": "CodePipeline",
        "azure": "Azure DevOps",
        "gcp": "Cloud Build",
        "alibaba": "CodePipeline"
    },
    "management": {
        "aws": "CloudWatch / CFN",
        "azure": "Monitor / ARM",
        "gcp": "Cloud Logging",
        "alibaba": "CloudMonitor",
        "ibm": "Sysdig / LogDNA"
    },
    "migration": {
        "aws": "DMS / Transfer",
        "azure": "Data Factory",
        "gcp": "Storage Transfer",
        "alibaba": "DTS"
    },
    "analytics": {
        "aws": "Athena / Redshift",
        "azure": "Synapse",
        "gcp": "BigQuery",
        "alibaba": "MaxCompute"
    }
}

class GlobalServiceRegistry:
    @staticmethod
    def get_categories() -> List[str]:
        return list(SERVICE_REGISTRY.keys())

    @staticmethod
    def get_provider_service(category: str, provider: str) -> Optional[str]:
        return SERVICE_REGISTRY.get(category, {}).get(provider)

    @staticmethod
    def get_all_services_for_category(category: str) -> Dict[str, str]:
        return SERVICE_REGISTRY.get(category, {})

service_registry = GlobalServiceRegistry()
