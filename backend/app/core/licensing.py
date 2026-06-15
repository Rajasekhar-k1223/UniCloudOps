import os
from fastapi import HTTPException, status

# Environment variable to bypass SaaS checks for traditional self-hosted OSS users
SAAS_MODE = os.getenv("SAAS_MODE", "false").lower() == "true"

TIER_HIERARCHY = {
    "Community": 1,
    "Professional": 2,
    "Enterprise": 3,
    "MSP": 4
}

class LicenseEnforcer:
    @staticmethod
    def verify_tier(tenant_tier: str, required_tier: str):
        """
        Validates if the tenant's active subscription tier grants them access to a feature.
        """
        if not SAAS_MODE:
            # If running as self-hosted open-source, grant ultimate Enterprise access
            return True
            
        tenant_level = TIER_HIERARCHY.get(tenant_tier, 0)
        required_level = TIER_HIERARCHY.get(required_tier, 99)
        
        if tenant_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Feature requires {required_tier} Edition. Please upgrade your subscription."
            )
        return True

license_enforcer = LicenseEnforcer()
