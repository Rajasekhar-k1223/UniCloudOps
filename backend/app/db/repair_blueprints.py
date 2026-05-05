from app.db.session import SessionLocal
from app.models.deployment import Template
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def repair_blueprints():
    """Repair the Terraform syntax within the blueprint gallery."""
    db = SessionLocal()
    logger.info("Initializing Blueprint Restoration Protocol...")
    
    try:
        # 🛡️ Template #1: AWS Universal 🛡️
        aws_t = db.query(Template).filter(Template.id == 1).first()
        if aws_t:
            aws_t.content = '''variable "region" { default = "us-east-1" }
variable "instance_type" { default = "t3.micro" }
variable "instance_name" { default = "unicloud-server" }

provider "aws" { region = var.region }

resource "aws_instance" "vm" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  tags = { Name = var.instance_name, ManagedBy = "UniCloudOps" }
}'''
            logger.info("AWS Universal Blueprint repaired.")

        # 🛡️ Template #2: GCP Bucket 🛡️
        gcp_t = db.query(Template).filter(Template.id == 2).first()
        if gcp_t:
            gcp_t.content = '''variable "instance_name" { default = "unicloudops-bucket" }
variable "region" { default = "us-central1" }

resource "google_storage_bucket" "bucket" {
  name     = var.instance_name
  location = "US"
  force_destroy = true
}'''
            logger.info("GCP Storage Blueprint repaired.")

        # 🛡️ Template #3: Azure VNet 🛡️
        az_t = db.query(Template).filter(Template.id == 3).first()
        if az_t:
            az_t.content = '''variable "instance_name" { default = "vnet-hub" }
variable "region" { default = "eastus" }

resource "azurerm_resource_group" "rg" {
  name     = "${var.instance_name}-rg"
  location = var.region
}

resource "azurerm_virtual_network" "vnet" {
  name                = var.instance_name
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}'''
            logger.info("Azure VNet Blueprint repaired.")

        db.commit()
        logger.info("Universal blueprint gallery reinforced with compliant HCL syntax.")
        
    except Exception as e:
        logger.error(f"Blueprint Repair Failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_blueprints()
