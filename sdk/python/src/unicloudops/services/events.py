from typing import List, Dict, Any
from unicloudops.core.client import UnicloudHTTPClient

class EventsService:
    def __init__(self, client: UnicloudHTTPClient):
        self._client = client

    def get_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve persistent event logs (CloudEvents)."""
        return self._client.request("GET", f"/api/v1/events/fabric/logs?limit={limit}")

    def get_dlq(self) -> List[Dict[str, Any]]:
        """Retrieve Dead Letter Queue events requiring manual intervention."""
        return self._client.request("GET", "/api/v1/events/fabric/dlq")

    def requeue_dlq(self, event_id: int) -> Dict[str, Any]:
        """Manually requeue a DLQ event back onto the Event Fabric."""
        return self._client.request("POST", f"/api/v1/events/fabric/dlq/{event_id}/requeue")

    def publish(self, subject: str, source: str, event_type: str, data: dict) -> Dict[str, Any]:
        """Publish an arbitrary event to the Event Fabric."""
        payload = {
            "subject": subject,
            "source": source,
            "event_type": event_type,
            "data": data
        }
        return self._client.request("POST", "/api/v1/events/fabric/publish", json=payload)
