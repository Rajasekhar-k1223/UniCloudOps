from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CloudAccountBase(BaseModel):
    provider: str
    name: str
    is_active: Optional[bool] = True

class CloudAccountCreate(CloudAccountBase):
    credentials: dict # e.g. {"aws_access_key_id": "...", "aws_secret_access_key": "..."}

class CloudAccountResponse(CloudAccountBase):
    id: int
    user_id: int
    status: str
    last_sync: Optional[datetime]
    error_message: Optional[str]
    connectivity: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
