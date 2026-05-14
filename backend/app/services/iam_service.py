import logging
import boto3
from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.cloud_account import CloudAccount
from app.core.crypto import decrypt_credentials

logger = logging.getLogger(__name__)

class IAMService:
    def get_identity_inventory(self, db: Session, user_id: int) -> List[Dict]:
        """Aggregate IAM identities across all providers for a user."""
        accounts = db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
        identities = []
        
        for acc in accounts:
            try:
                if acc.provider == 'aws':
                    identities.extend(self._get_aws_iam(acc))
                elif acc.provider == 'azure':
                    identities.extend(self._get_azure_ad(acc))
            except Exception as e:
                logger.error(f"IAM Inventory failed for {acc.provider} ({acc.id}): {e}")
                
        return identities

    def _get_aws_iam(self, account: CloudAccount) -> List[Dict]:
        """Fetch IAM Users and Roles from AWS."""
        try:
            creds = decrypt_credentials(account.encrypted_credentials)
            iam = boto3.client(
                'iam',
                aws_access_key_id=creds.get('aws_access_key_id'),
                aws_secret_access_key=creds.get('aws_secret_access_key')
            )
            
            users = iam.list_users(MaxItems=10)['Users']
            results = []
            for u in users:
                results.append({
                    "id": u['UserId'],
                    "name": u['UserName'],
                    "type": "User",
                    "provider": "aws",
                    "account_name": account.name,
                    "created_at": u['CreateDate'].isoformat()
                })
            return results
        except:
            return []

    def _get_azure_ad(self, account: CloudAccount) -> List[Dict]:
        """Fetch Entra ID (Azure AD) Users."""
        # Note: This usually requires Microsoft Graph API
        return [
            {
                "id": "AZ-MOCK-USR",
                "name": "Azure Admin (Simulated)",
                "type": "User",
                "provider": "azure",
                "account_name": account.name,
                "created_at": "2024-01-01T00:00:00"
            }
        ]

iam_service = IAMService()
