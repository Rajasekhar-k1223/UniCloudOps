from app.db.session import SessionLocal
from app.models.deployment import Template

def forge_gke():
    db = SessionLocal()
    # Check if exists
    existing = db.query(Template).filter(Template.stack_id == 'gke-cluster-v1').first()
    if existing:
        print("GKE Blueprint already exists.")
        return

    t = Template(
        stack_id='gke-cluster-v1',
        name='Google Kubernetes Engine (GKE)',
        description='Standard GKE cluster with managed node pools and VPC-native networking.',
        iac_type='terraform',
        content="""
variable "cluster_name" { default = "sovereign-gke" }
variable "region" { default = "us-central1" }
variable "node_count" { default = 1 }
variable "instance_type" { default = "e2-medium" }

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region
  initial_node_count = 1
  remove_default_node_pool = true
  deletion_protection = false
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.node_count

  node_config {
    preemptible  = true
    machine_type = var.instance_type
    
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
""",
        provider='gcp',
        complexity='medium',
        est_cost=45.0,
        icon='Box'
    )
    db.add(t)
    db.commit()
    print("--- GKE BLUEPRINT FORGED AND AUTHORIZED ---")

if __name__ == "__main__":
    forge_gke()
