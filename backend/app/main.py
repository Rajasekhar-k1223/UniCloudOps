# System imports at the top
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.db.init_db import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:8080",
    "http://localhost:8085",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8085",
    "http://[::1]:5173",
    "http://[::1]:5175",
    "http://[::1]:8085",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up database clients...")
    try:
        init_db() # Create tables and seed mock data
        logger.info("SQL Database initialization completed.")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize SQL Database: {e}")
        
    try:
        await connect_to_mongo()
        logger.info("Mongo Database connection established.")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to connect to MongoDB: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "Welcome to UniCloudOps API"}

# Include routers
from app.routes.auth import router as auth_router
from app.routes.cloud_accounts import router as cloud_accounts_router
from app.routes.billing import router as billing_router
from app.routes.resources import router as resources_router
from app.routes.deployments import router as deployments_router
from app.routes.catalog import router as catalog_router
from app.routes.projects import router as projects_router
from app.routes.notifications import router as notifications_router
from app.routes.audit import router as audit_router
from app.routes.webhooks import router as webhooks_router
from app.routes.network import router as network_router
from app.routes.services import router as services_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(cloud_accounts_router, prefix=settings.API_V1_STR)
app.include_router(billing_router, prefix=settings.API_V1_STR)
app.include_router(resources_router, prefix=settings.API_V1_STR)
app.include_router(deployments_router, prefix=settings.API_V1_STR)
app.include_router(catalog_router, prefix=f"{settings.API_V1_STR}/catalog", tags=["catalog"])
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(webhooks_router, prefix=settings.API_V1_STR)
app.include_router(network_router, prefix=settings.API_V1_STR)
app.include_router(services_router, prefix=f"{settings.API_V1_STR}/services", tags=["Universal Services"])

# Compatibility route for unrebuilt frontend
from app.routes.resources import rdp_websocket
app.add_api_websocket_route("/ws/rdp/{resource_id}", rdp_websocket)

from app.utils.connection_manager import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/telemetry/{user_id}")
async def telemetry_websocket(websocket: WebSocket, user_id: int):
    """Global Mission Telemetry HUD WebSocket."""
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Maintain connection, wait for client pings if needed
            data = await websocket.receive_text()
            # Handle client-to-server mission commands if any
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"Telemetry WS error for user {user_id}: {e}")
        manager.disconnect(user_id, websocket)
