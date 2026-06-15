# System imports at the top
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.db.init_db import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom Secure Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Apply Security Headers
app.add_middleware(SecurityHeadersMiddleware)

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
from app.routes.marketplace import router as marketplace_router

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
from app.routes.serverless import router as serverless_router
app.include_router(serverless_router, prefix=settings.API_V1_STR)
from app.routes.marketplace import router as marketplace_router
from app.routes.k8s import router as k8s_router

app.include_router(marketplace_router, prefix=settings.API_V1_STR)
app.include_router(k8s_router, prefix=settings.API_V1_STR)

from app.routes.dr import router as dr_router
app.include_router(dr_router, prefix=settings.API_V1_STR)

from app.routes.security import router as security_router
app.include_router(security_router, prefix=settings.API_V1_STR)

from app.routes.rightsizing import router as rightsizing_router
app.include_router(rightsizing_router, prefix=settings.API_V1_STR)

from app.routes.terraform import router as terraform_router
app.include_router(terraform_router, prefix=settings.API_V1_STR)

from app.routes.blueprint_gen import router as blueprint_gen_router
app.include_router(blueprint_gen_router, prefix=settings.API_V1_STR)

from app.routes.chaos import router as chaos_router
app.include_router(chaos_router, prefix=settings.API_V1_STR)

from app.routes.cost_sentinel import router as cost_sentinel_router
app.include_router(cost_sentinel_router, prefix=settings.API_V1_STR)

from app.routes.policy_gen import router as policy_gen_router
app.include_router(policy_gen_router, prefix=settings.API_V1_STR)

from app.routes.terminal_assist import router as terminal_assist_router
app.include_router(terminal_assist_router, prefix=settings.API_V1_STR)

from app.routes.mission_pulse import router as mission_pulse_router
app.include_router(mission_pulse_router, prefix=settings.API_V1_STR)

from app.routes.traffic import router as traffic_router
app.include_router(traffic_router, prefix=settings.API_V1_STR)

from app.routes.vault_audit import router as vault_audit_router
app.include_router(vault_audit_router, prefix=settings.API_V1_STR)

from app.routes.continuity import router as continuity_router
app.include_router(continuity_router, prefix=settings.API_V1_STR)

from app.routes.finops import router as finops_router
app.include_router(finops_router, prefix=settings.API_V1_STR)

from app.routes.neural_id import router as neural_id_router
app.include_router(neural_id_router, prefix=settings.API_V1_STR)

from app.routes.predictor import router as predictor_router
app.include_router(predictor_router, prefix=settings.API_V1_STR)

from app.routes.voice import router as voice_router
app.include_router(voice_router, prefix=settings.API_V1_STR)

from app.routes.forge import router as forge_router
app.include_router(forge_router, prefix=settings.API_V1_STR)

from app.routes.defense import router as defense_router
app.include_router(defense_router, prefix=settings.API_V1_STR)

from app.routes.knowledge import router as knowledge_router
app.include_router(knowledge_router, prefix=settings.API_V1_STR)

from app.routes.immersive import router as immersive_router
app.include_router(immersive_router, prefix=settings.API_V1_STR)

from app.routes.evolution import router as evolution_router
app.include_router(evolution_router, prefix=settings.API_V1_STR)

from app.routes.war_room import router as war_room_router
app.include_router(war_room_router, prefix=settings.API_V1_STR)

from app.routes.briefing import router as briefing_router
app.include_router(briefing_router, prefix=settings.API_V1_STR)

from app.routes.policy_synthesis import router as policy_router
app.include_router(policy_router, prefix=settings.API_V1_STR)

from app.routes.quantum import router as quantum_router
app.include_router(quantum_router, prefix=settings.API_V1_STR)

from app.routes.galactic_mesh import router as galactic_router
app.include_router(galactic_router, prefix=settings.API_V1_STR)

from app.routes.temporal import router as temporal_router
app.include_router(temporal_router, prefix=settings.API_V1_STR)

from app.routes.advisor import router as advisor_router
app.include_router(advisor_router, prefix=settings.API_V1_STR)

from app.routes.post_mortem import router as post_mortem_router
app.include_router(post_mortem_router, prefix=settings.API_V1_STR)

from app.routes.auction import router as auction_router
app.include_router(auction_router, prefix=settings.API_V1_STR)

from app.routes.registry import router as registry_router
app.include_router(registry_router, prefix=settings.API_V1_STR)

from app.routes.threat_hunting import router as threats_router
app.include_router(threats_router, prefix=settings.API_V1_STR)

from app.routes.quantum_bridge import router as quantum_bridge_router
app.include_router(quantum_bridge_router, prefix=settings.API_V1_STR)

from app.routes.macro_forge import router as macro_router
app.include_router(macro_router, prefix=settings.API_V1_STR)

from app.routes.bio_link import router as bio_router
app.include_router(bio_router, prefix=settings.API_V1_STR)

from app.routes.space_mesh import router as space_router
app.include_router(space_router, prefix=settings.API_V1_STR)

from app.routes.evolution import router as evolution_router
app.include_router(evolution_router, prefix=settings.API_V1_STR)

from app.routes.data_singularity import router as data_router
app.include_router(data_router, prefix=settings.API_V1_STR)

from app.routes.economy import router as economy_router
app.include_router(economy_router, prefix=settings.API_V1_STR)

from app.routes.governance import router as governance_router
app.include_router(governance_router, prefix=settings.API_V1_STR)

from app.routes.multiversal import router as multiversal_router
app.include_router(multiversal_router, prefix=settings.API_V1_STR)

from app.routes.auction import router as auction_router
app.include_router(auction_router, prefix=settings.API_V1_STR)

from app.routes.defense import router as defense_router
app.include_router(defense_router, prefix=settings.API_V1_STR)

from app.routes.chaos import router as chaos_router
app.include_router(chaos_router, prefix=settings.API_V1_STR)

from app.routes.finops import router as finops_router
app.include_router(finops_router, prefix=settings.API_V1_STR)

from app.routes.briefing import router as briefing_router
app.include_router(briefing_router, prefix=settings.API_V1_STR)

from app.routes.post_mortem import router as post_mortem_router
app.include_router(post_mortem_router, prefix=settings.API_V1_STR)

from app.routes.terminal_assist import router as terminal_assist_router
app.include_router(terminal_assist_router, prefix=settings.API_V1_STR)

from app.routes.shield import router as shield_router
app.include_router(shield_router, prefix=settings.API_V1_STR)

from app.routes.bridge import router as bridge_router
app.include_router(bridge_router, prefix=settings.API_V1_STR)

from app.routes.space_mesh import router as space_mesh_router
app.include_router(space_mesh_router, prefix=settings.API_V1_STR)

from app.routes.data_singularity import router as data_singularity_router
app.include_router(data_singularity_router, prefix=settings.API_V1_STR)

from app.routes.continuity import router as continuity_router
app.include_router(continuity_router, prefix=settings.API_V1_STR)

from app.routes.forge import router as forge_router
app.include_router(forge_router, prefix=settings.API_V1_STR)

from app.routes.iam import router as iam_router
app.include_router(iam_router, prefix=settings.API_V1_STR)

from app.routes.tenant import router as tenant_router
app.include_router(tenant_router, prefix=settings.API_V1_STR)

from app.routes.terraform_enterprise import router as terraform_enterprise_router
app.include_router(terraform_enterprise_router, prefix=settings.API_V1_STR)

from app.routes.secrets_vault import router as secrets_vault_router
app.include_router(secrets_vault_router, prefix=settings.API_V1_STR)

from app.routes.k8s_control import router as k8s_control_router
app.include_router(k8s_control_router, prefix=settings.API_V1_STR)

from app.routes.cloud_governance import router as cloud_governance_router
app.include_router(cloud_governance_router, prefix=settings.API_V1_STR)

from app.routes.finops_analytics import router as finops_analytics_router
app.include_router(finops_analytics_router, prefix=settings.API_V1_STR)

from app.routes.observability import router as observability_router
app.include_router(observability_router, prefix=settings.API_V1_STR)

from app.routes.aiops import router as aiops_router
app.include_router(aiops_router, prefix=settings.API_V1_STR)

from app.routes.security_posture import router as security_posture_router
app.include_router(security_posture_router, prefix=settings.API_V1_STR)

from app.routes.event_fabric import router as event_fabric_router
app.include_router(event_fabric_router, prefix=settings.API_V1_STR)

from app.routes.marketplace import router as marketplace_router
app.include_router(marketplace_router, prefix=settings.API_V1_STR)

from app.routes.ai_agents import router as ai_agents_router
app.include_router(ai_agents_router, prefix=settings.API_V1_STR)

from app.routes.fabric_gateway import router as fabric_gateway_router
app.include_router(fabric_gateway_router, prefix=settings.API_V1_STR)

from app.routes.saas import router as saas_router
app.include_router(saas_router, prefix=settings.API_V1_STR)

from app.routes.security_center import router as security_router
app.include_router(security_router, prefix=settings.API_V1_STR)

from app.routes.security_fabric import router as fabric_router
app.include_router(fabric_router, prefix=settings.API_V1_STR)

from app.routes.sdk_auth import router as sdk_auth_router
app.include_router(sdk_auth_router, prefix=settings.API_V1_STR)

from app.routes.event_security import router as event_security_router
app.include_router(event_security_router, prefix=settings.API_V1_STR)

from app.routes.supply_chain import router as supply_chain_router
app.include_router(supply_chain_router, prefix=settings.API_V1_STR)

from app.routes.federation import router as federation_router
app.include_router(federation_router, prefix=settings.API_V1_STR)

from app.core.events import event_manager

@app.on_event("shutdown")
async def shutdown_event():
    await event_manager.close()

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
