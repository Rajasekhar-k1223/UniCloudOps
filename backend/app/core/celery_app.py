from celery import Celery
from app.core.config import settings
import app.models

celery_app = Celery(
    "worker", 
    broker=settings.REDIS_URL, 
    backend=settings.REDIS_URL,
    include=['app.tasks.sync_tasks', 'app.tasks.iac_tasks']
)

celery_app.conf.task_routes = {"app.tasks.*": "main-queue"}

# Configure periodic tasks (Sync all accounts every 1 minute for near real-time)
celery_app.conf.beat_schedule = {
    'sync-all-cloud-accounts-every-minute': {
        'task': 'sync_all_accounts',
        'schedule': 60.0, # 1 minute
    },
}
