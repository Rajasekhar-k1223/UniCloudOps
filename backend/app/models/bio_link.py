from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class OperatorBioLink(Base):
    __tablename__ = "operator_biolinks"

    id = Column(Integer, primary_key=True, index=True)
    operator_id = Column(String(100), unique=True, index=True, nullable=False)
    cognitive_stability = Column(Float, default=98.4)
    command_rhythm = Column(String(50), default="Stable")
    decision_latency = Column(String(50), default="140ms")
    stress_marker = Column(String(50), default="Low")
    lockdown_status = Column(String(50), default="Unlocked") # 'Unlocked', 'Locked'
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
