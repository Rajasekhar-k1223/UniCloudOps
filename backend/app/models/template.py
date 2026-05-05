from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    stack_id = Column(String(255), unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    provider = Column(String(50), nullable=False, server_default="all") # 'all', 'aws', 'azure', 'gcp', 'edge'
    complexity = Column(String(50), nullable=True) # 'low', 'medium', 'high'
    est_cost = Column(Float, nullable=True)
    services = Column(JSON, nullable=True) # List of services
    iac_type = Column(String(50), nullable=False, server_default="terraform") # 'terraform' or 'cdk'
    content = Column(Text, nullable=True) # The actual terraform HCL or CDK code string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
