import asyncio
from app.db.session import SessionLocal, engine, Base
from app.models.template import Template
from app.models.project import Project
from app.models import user, cloud_account, deployment, resource
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Syncing tables...")
    Base.metadata.create_all(bind=engine)
    
    # 🛡️ Tactical Migration: Ensure templates schema parity 🛡️
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            columns_to_add = {
                "stack_id": "VARCHAR(255) UNIQUE AFTER id",
                "icon": "VARCHAR(50) AFTER description",
                "provider": "VARCHAR(50) DEFAULT 'all' AFTER icon",
                "complexity": "VARCHAR(50) AFTER provider",
                "est_cost": "FLOAT AFTER complexity",
                "services": "JSON AFTER est_cost",
                "iac_type": "VARCHAR(50) DEFAULT 'terraform' AFTER services"
            }
            
            for col, definition in columns_to_add.items():
                result = conn.execute(text(f"SHOW COLUMNS FROM templates LIKE '{col}'"))
                if not result.fetchone():
                    logger.info(f"MIGRATION: Adding missing '{col}' column to 'templates' table...")
                    conn.execute(text(f"ALTER TABLE templates ADD COLUMN {col} {definition}"))
                    if col == "stack_id":
                        conn.execute(text("CREATE INDEX ix_templates_stack_id ON templates (stack_id)"))
            conn.commit()
    except Exception as e:
        logger.warning(f"Tactical migration skipped or failed (might already be fixed): {e}")
    
    db = SessionLocal()
    
    # Create Default Project
    if settings.AUTO_SEED_DATA and db.query(Project).count() == 0:
        logger.info("Seeding Default Project...")
        default_project = Project(
            name="Global Infrastructure",
            description="The default sovereign boundary for enterprise cloud assets.",
            budget_limit=5000.0
        )
        db.add(default_project)
        db.commit()
        db.refresh(default_project)
    else:
        default_project = db.query(Project).first()
    
    # Create Default Admin User
    if settings.AUTO_SEED_ADMIN and db.query(user.User).count() == 0:
        logger.info("Seeding Admin User...")
        from app.core.security import get_password_hash
        admin = user.User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            role="ADMIN",
            project_id=default_project.id if default_project else None
        )
        db.add(admin)
        db.commit()

    # 🏗️ Seed Universal Variable-Aware Blueprints 🏗️
    if settings.AUTO_SEED_DATA and db.query(Template).count() == 0:
        logger.info("Seeding Industrial Marketplace Templates...")
        
        marketplace_stacks = [
            {
                "stack_id": "stack_wordpress_managed",
                "name": "WordPress Production Stack",
                "description": "Enterprise-grade WordPress site with managed DB and CDN hookups.",
                "icon": "Box",
                "provider": "all",
                "complexity": "medium",
                "est_cost": 25.0,
                "services": ["Compute", "RDS", "VPC"],
                "iac_type": "terraform",
                "content": "# Terraform for WordPress\nresource \"aws_instance\" \"wp\" { ... }"
            },
            {
                "stack_id": "stack_mongodb_atlas",
                "name": "MongoDB Global Cluster",
                "description": "High-availability NoSQL cluster with multi-region replication.",
                "icon": "Database",
                "provider": "all",
                "complexity": "high",
                "est_cost": 45.0,
                "services": ["Database", "NetPeering"],
                "iac_type": "terraform",
                "content": "# Terraform for MongoDB\nresource \"mongodbatlas_cluster\" \"cluster\" { ... }"
            },
            {
                "stack_id": "stack_static_site_cdn",
                "name": "Global Static Site (CDN)",
                "description": "Static assets distributed via Global Edge network with SSL.",
                "icon": "Zap",
                "provider": "all",
                "complexity": "low",
                "est_cost": 5.0,
                "services": ["Storage", "CDN"],
                "iac_type": "terraform",
                "content": "# Terraform for Static Site\nresource \"aws_s3_bucket\" \"site\" { ... }"
            },
            {
                "stack_id": "stack_node_backend_serverless",
                "name": "Node.js Serverless API",
                "description": "Auto-scaling REST API built with Node.js and Serverless triggers.",
                "icon": "Terminal",
                "provider": "aws",
                "complexity": "low",
                "est_cost": 2.0,
                "services": ["Lambda", "API Gateway"],
                "iac_type": "terraform",
                "content": "# Terraform for Serverless API\nresource \"aws_lambda_function\" \"api\" { ... }"
            }
        ]

        for s in marketplace_stacks:
            t = Template(**s)
            db.add(t)

        # AWS Universal Template
        t1 = Template(
            stack_id="aws_ubuntu_universal",
            name="Universal Ubuntu Instance (AWS)",
            description="Highly dynamic AWS EC2 blueprint with dynamic AMI discovery.",
            iac_type="terraform",
            content='''variable "region" { default = "us-east-1" }
variable "instance_type" { default = "t3.micro" }
variable "instance_name" { default = "unicloud-aws-vm" }

provider "aws" { region = var.region }

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "vm" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  tags = { Name = var.instance_name, ManagedBy = "UniCloudOps" }
}'''
        )

        # Azure Universal Template
        t2 = Template(
            name="Universal Ubuntu Instance (Azure)",
            description="Enterprise Azure VM blueprint with dynamic SKU and region support.",
            iac_type="terraform",
            content='''variable "region" { default = "East US" }
variable "instance_type" { default = "Standard_B1s" }
variable "instance_name" { default = "unicloud-azure-vm" }

provider "azurerm" { features {} }

resource "azurerm_resource_group" "rg" {
  name     = "${var.instance_name}-rg"
  location = var.region
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = var.instance_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.instance_type
  admin_username      = "adminuser"
  # Security/Networking abstracted for blueprint brevity
  network_interface_ids = [] 
}'''
        )

        # GCP Universal Template
        t3 = Template(
            name="Universal Ubuntu Instance (GCP)",
            description="Sovereign GCP Compute Engine blueprint with automated field injection.",
            iac_type="terraform",
            content='''variable "region" { default = "us-central1" }
variable "instance_type" { default = "e2-micro" }
variable "instance_name" { default = "unicloud-gcp-vm" }

provider "google" { region = var.region }

resource "google_compute_instance" "vm" {
  name         = var.instance_name
  machine_type = var.instance_type
  zone         = "${var.region}-a"
  boot_disk { initialize_params { image = "ubuntu-os-cloud/ubuntu-2204-lts" } }
  network_interface { network = "default" }
}'''
        )

        # Specialty Templates: Well-Architected Framework Blueprints
        
        t4 = Template(
            name="AWS RDS Aurora Multi-AZ Cluster",
            description="High-availability database cluster with automated failover and read replicas.",
            iac_type="terraform",
            content='''variable "region" { default = "us-east-1" }
variable "instance_class" { default = "db.r5.large" }
variable "cluster_name" { default = "unicloud-aurora-ha" }

provider "aws" { region = var.region }

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = var.cluster_name
  engine                  = "aurora-postgresql"
  availability_zones      = ["${var.region}a", "${var.region}b", "${var.region}c"]
  database_name           = "mission_data"
  master_username         = "admin"
  master_password         = "ChangeMe123!"
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
}

resource "aws_rds_cluster_instance" "instances" {
  count              = 2
  identifier         = "${var.cluster_name}-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = var.instance_class
  engine             = aws_rds_cluster.aurora.engine
  promotion_tier     = count.index
}'''
        )

        t5 = Template(
            name="AWS Serverless Stack (Scalable)",
            description="Highly elastic serverless architecture using API Gateway, Lambda, and DynamoDB.",
            iac_type="terraform",
            content='''variable "name" { default = "serverless-mission" }
provider "aws" { region = "us-east-1" }

resource "aws_dynamodb_table" "table" {
  name           = "${var.name}-table"
  billing_mode   = "PAY_PER_REQUEST" # Elasticity & Cost Optimization
  hash_key       = "id"
  attribute { name = "id", type = "S" }
}

resource "aws_lambda_function" "fn" {
  filename      = "function.zip"
  function_name = "${var.name}-handler"
  role          = aws_iam_role.iam.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
}

# Simplified for blueprint illustration
resource "aws_iam_role" "iam" { name = "${var.name}-role" ... }'''
        )

        t6 = Template(
            name="AWS Cost-Optimized Archival Tier",
            description="S3 storage with automated lifecycle policies for long-term data durability at minimum cost.",
            iac_type="terraform",
            content='''resource "aws_s3_bucket" "archive" {
  bucket = "unicloud-mission-archive"
}

resource "aws_s3_bucket_lifecycle_configuration" "config" {
  bucket = aws_s3_bucket.archive.id
  rule {
    id     = "archive-to-glacier"
    status = "Enabled"
    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    expiration { days = 365 }
  }
}'''
        )

        # Advanced Windows Blueprints
        t7 = Template(
            name="Universal Windows Server (AWS)",
            description="Secure Windows Server 2022 blueprint with automated RDP ready signal.",
            iac_type="terraform",
            content='''variable "region" { default = "us-east-1" }
variable "instance_type" { default = "t3.medium" }
variable "instance_name" { default = "unicloud-windows-vm" }

provider "aws" { region = var.region }

data "aws_ami" "windows" {
  most_recent = true
  filter {
    name   = "name"
    values = ["Windows_Server-2022-English-Full-Base-*"]
  }
  owners = ["801119661308"] # Microsoft
}

resource "aws_instance" "vm" {
  ami           = data.aws_ami.windows.id
  instance_type = var.instance_type
  get_password_data = true # Required for RDP
  tags = { 
    Name = var.instance_name, 
    OS = "Windows",
    ManagedBy = "UniCloudOps" 
  }
}'''
        )

        t8 = Template(
            name="Universal Windows Server (Azure)",
            description="Enterprise Windows Server mission blueprint for Azure Gov/Commercial.",
            iac_type="terraform",
            content='''variable "region" { default = "eastus" }
variable "instance_type" { default = "Standard_B2s" }
variable "instance_name" { default = "unicloud-win-azure" }

provider "azurerm" { features {} }

resource "azurerm_resource_group" "rg" {
  name     = "${var.instance_name}-rg"
  location = var.region
}

resource "azurerm_windows_virtual_machine" "vm" {
  name                = var.instance_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = var.instance_type
  admin_username      = "adminuser"
  admin_password      = "P@ssw0rd1234!" # In production, pull from Vault
  network_interface_ids = []
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-datacenter-azure-edition"
    version   = "latest"
  }
}'''
        )

        db.add_all([t1, t2, t3, t4, t5, t6, t7, t8])
        db.commit()
    db.close()
    logger.info("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
