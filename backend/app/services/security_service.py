import logging
import boto3
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.models.cloud_account import CloudAccount
from app.core.crypto import decrypt_credentials

logger = logging.getLogger(__name__)

class SecurityService:
    def get_aggregated_threats(self, db: Session, user_id: int) -> List[Dict]:
        """Collect real-time security findings across all cloud providers."""
        accounts = db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
        all_threats = []
        
        for acc in accounts:
            try:
                if acc.provider == 'aws':
                    all_threats.extend(self._get_aws_guardduty_findings(acc))
                elif acc.provider == 'azure':
                    all_threats.extend(self._get_azure_defender_findings(acc))
            except Exception as e:
                logger.error(f"Failed to fetch security findings for {acc.provider} ({acc.id}): {e}")
        
        # Sort by timestamp descending
        return sorted(all_threats, key=lambda x: x.get('timestamp', ''), reverse=True)

    def _get_aws_guardduty_findings(self, account: CloudAccount) -> List[Dict]:
        """Fetch findings from AWS GuardDuty."""
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            client = boto3.client(
                'guardduty',
                aws_access_key_id=creds.get('aws_access_key_id'),
                aws_secret_access_key=creds.get('aws_secret_access_key'),
                region_name=creds.get('region', 'us-east-1')
            )
            
            detectors = client.list_detectors()
            if not detectors['DetectorIds']:
                return []
            
            detector_id = detectors['DetectorIds'][0]
            findings = client.list_findings(DetectorId=detector_id, MaxResults=10)
            if not findings['FindingIds']:
                return []
            
            detailed_findings = client.get_findings(DetectorId=detector_id, FindingIds=findings['FindingIds'])
            
            results = []
            for f in detailed_findings['Findings']:
                results.append({
                    "id": f['Id'],
                    "type": f['Type'],
                    "source_ip": f.get('Service', {}).get('Action', {}).get('NetworkConnectionAction', {}).get('RemoteIpDetails', {}).get('IpAddressV4', 'Internal'),
                    "target": f.get('Resource', {}).get('InstanceDetails', {}).get('InstanceId', 'Global'),
                    "severity": "critical" if f['Severity'] >= 7 else "high" if f['Severity'] >= 4 else "medium",
                    "status": "active" if f['State'] == 'ACTIVE' else "archived",
                    "timestamp": f['UpdatedAt'],
                    "provider": "aws"
                })
            return results
        except Exception as e:
            logger.debug(f"AWS GuardDuty fetch failed: {e}")
            return []

    def _get_azure_defender_findings(self, account: CloudAccount) -> List[Dict]:
        """Fetch findings from Azure Defender (Security Center)."""
        # Placeholder for real Azure Defender API call
        # Requires azure-mgmt-security
        return []

security_service = SecurityService()
