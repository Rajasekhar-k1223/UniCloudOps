from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    iac_type: str
    content: str
    provider: Optional[str] = "aws"

class TemplateResponse(TemplateCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DeploymentCreate(BaseModel):
    template_id: int
    cloud_account_id: int
    variables: Dict[str, str] = {} # Input variables for terraform

class DeploymentResponse(BaseModel):
    id: int
    user_id: int
    template_id: Optional[int]
    cloud_account_id: int
    project_id: Optional[int]
    variables: Optional[Dict[str, str]]
    status: str
    logs: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
