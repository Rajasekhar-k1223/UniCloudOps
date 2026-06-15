from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.enterprise_evolution import Organization, Tenant, Workspace

router = APIRouter(prefix="/tenants", tags=["Multi-Tenant MSP"])

@router.get("/organizations")
def get_organizations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List organizations."""
    return db.query(Organization).all()

@router.post("/organizations")
def create_organization(name: str, domain: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new organization."""
    org = Organization(name=name, domain=domain)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.get("/")
def get_tenants(org_id: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List tenants, optionally filtered by org_id."""
    query = db.query(Tenant)
    if org_id:
        query = query.filter(Tenant.org_id == org_id)
    return query.all()

@router.post("/")
def create_tenant(name: str, org_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new tenant."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    tenant = Tenant(name=name, org_id=org_id)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant

@router.get("/{tenant_id}/workspaces")
def get_workspaces(tenant_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List workspaces for a tenant."""
    return db.query(Workspace).filter(Workspace.tenant_id == tenant_id).all()

@router.post("/{tenant_id}/workspaces")
def create_workspace(tenant_id: int, name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a workspace under a tenant."""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    workspace = Workspace(name=name, tenant_id=tenant_id)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace
