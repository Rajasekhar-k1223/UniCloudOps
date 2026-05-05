
from app.db.session import SessionLocal
from app.models.deployment import Deployment

db = SessionLocal()
try:
    deps = db.query(Deployment).all()
    print(f"Total deployments found: {len(deps)}")
    for d in deps:
        print(f"ID: {d.id} | Name: {d.name} | Status: {d.status} | Provider: {d.cloud_provider} | Account ID: {d.cloud_account_id}")
finally:
    db.close()
