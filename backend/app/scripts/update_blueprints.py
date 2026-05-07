from app.db.session import SessionLocal
from app.models.template import Template

db = SessionLocal()

# --- AWS EKS Blueprint ---
eks_content = """
provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "sovereign-eks-v1"
}

# 📡 Autonomous Network Discovery 📡
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "all" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  # 🛡️ Mission Guardrail: Exclude EKS-unsupported AZs (like us-east-1e) 🛡️
  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"

  cluster_endpoint_public_access = true

  vpc_id     = data.aws_vpc.default.id
  subnet_ids = data.aws_subnets.all.ids

  eks_managed_node_groups = {
    standard = {
      instance_types = ["t3.medium"]
      min_size     = 1
      max_size     = 3
      desired_size = 2
    }
  }

  tags = {
    Environment = "Production"
    Project     = "UniCloudOps"
    Sovereign   = "True"
  }
}
"""

# --- Azure AKS Blueprint ---
aks_content = """
provider "azurerm" {
  features {}
}

variable "cluster_name" {
  default = "sovereign-aks-v1"
}

variable "location" {
  default = "East US"
}

resource "azurerm_resource_group" "this" {
  name     = "rg-${var.cluster_name}"
  location = var.location
}

module "aks" {
  source  = "Azure/aks/azurerm"
  version = "~> 9.1"

  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  prefix              = var.cluster_name
  
  cluster_name        = var.cluster_name
  kubernetes_version  = "1.30"
  
  # Default node pool
  agents_size         = "Standard_DS2_v2"
  agents_count        = 2
  
  network_profile = {
    network_plugin = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    Environment = "Production"
    Project     = "UniCloudOps"
    Sovereign   = "True"
  }
}
"""

# Perform Updates
s_eks = db.query(Template).filter(Template.stack_id == 'aws-eks-v1').first()
if s_eks:
    s_eks.content = eks_content.strip()
    print('✅ AWS EKS Blueprint Hardened.')

s_aks = db.query(Template).filter(Template.stack_id == 'azure-aks-v1').first()
if s_aks:
    s_aks.content = aks_content.strip()
    print('✅ Azure AKS Blueprint Hardened.')

db.commit()
print('--- ALL BLUEPRINTS UPDATED ---')
