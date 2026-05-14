import logging
import boto3
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.models.cloud_account import CloudAccount
from app.core.crypto import decrypt_credentials

logger = logging.getLogger(__name__)

class AuditAggregator:
    def get_provider_events(self, db: Session, user_id: int, limit: int = 20) -> List[Dict]:
        """Aggregate real management events from AWS CloudTrail and Azure Activity Logs."""
        accounts = db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
        all_events = []
        
        for acc in accounts:
            try:
                if acc.provider == 'aws':
                    all_events.extend(self._get_aws_events(acc, limit))
                elif acc.provider == 'azure':
                    all_events.extend(self._get_azure_events(acc, limit))
            except Exception as e:
                logger.error(f"Failed to fetch provider events for {acc.provider} ({acc.id}): {e}")
        
        # Sort by timestamp descending
        return sorted(all_events, key=lambda x: x.get('timestamp', ''), reverse=True)[:limit]

    def _get_aws_events(self, account: CloudAccount, limit: int) -> List[Dict]:
        """Fetch AWS CloudTrail events."""
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            client = boto3.client(
                'cloudtrail',
                aws_access_key_id=creds.get('aws_access_key_id'),
                aws_secret_access_key=creds.get('aws_secret_access_key'),
                region_name=creds.get('region', 'us-east-1')
            )
            
            # Fetch events for the last 24 hours
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=1)
            
            response = client.lookup_events(
                StartTime=start_time,
                EndTime=end_time,
                MaxResults=limit
            )
            
            events = []
            for e in response.get('Events', []):
                events.append({
                    "id": e['EventId'],
                    "action": e['EventName'],
                    "user_email": e.get('Username', 'AWS-Principal'),
                    "resource_type": "AWS-Resource",
                    "status": "success",
                    "message": f"Provider Event: {e['EventName']} by {e.get('Username')}",
                    "ip_address": e.get('CloudTrailEvent', {}).get('sourceIPAddress', 'N/A'),
                    "timestamp": e['EventTime'],
                    "provider": "aws",
                    "account_name": account.name
                })
            return events
        except:
            return []

    def _get_azure_events(self, account: CloudAccount, limit: int) -> List[Dict]:
        """Placeholder for Azure Activity Log fetcher."""
        return []

audit_aggregator = AuditAggregator()
