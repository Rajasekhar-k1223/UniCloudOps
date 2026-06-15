import asyncio
import nats
from nats.errors import ConnectionClosedError, TimeoutError, NoServersError
import logging
import json
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class EventManager:
    def __init__(self):
        self.nc = None
        self.js = None
        self.nats_url = "nats://localhost:4222" # Should pull from settings

    async def connect(self):
        try:
            self.nc = await nats.connect(self.nats_url)
            self.js = self.nc.jetstream()
            logger.info("Successfully connected to NATS Event Fabric.")
            
            # Ensure the core EVENT stream exists
            await self.js.add_stream(name="EVENTS", subjects=["unicloudops.*", "sentinelx.*", "monitorix.*"])
            
        except Exception as e:
            logger.error(f"Failed to connect to NATS: {e}")

    async def close(self):
        if self.nc and not self.nc.is_closed:
            await self.nc.close()
            logger.info("NATS Connection closed.")

    def format_cloud_event(self, source: str, event_type: str, data: dict) -> bytes:
        event = {
            "specversion": "1.0",
            "id": str(uuid.uuid4()),
            "source": source,
            "type": event_type,
            "time": datetime.utcnow().isoformat() + "Z",
            "datacontenttype": "application/json",
            "data": data
        }
        return json.dumps(event).encode("utf-8")

    async def publish(self, subject: str, source: str, event_type: str, data: dict):
        if not self.nc:
            await self.connect()
            
        payload = self.format_cloud_event(source, event_type, data)
        # Use JetStream for persistent publish
        if self.js:
            ack = await self.js.publish(subject, payload)
            logger.info(f"Published event to {subject} (seq: {ack.seq})")
        else:
            await self.nc.publish(subject, payload)
            logger.info(f"Published non-persistent event to {subject}")

# Global instance
event_manager = EventManager()
