from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.db.session import Base

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(String(50), primary_key=True, index=True) # CloudEvent UUID
    source = Column(String(100), index=True)
    type = Column(String(100), index=True)
    subject = Column(String(200), index=True)
    time = Column(DateTime(timezone=True), default=func.now())
    data = Column(JSON)
    datacontenttype = Column(String(50), default="application/json")
    
class DeadLetterQueue(Base):
    __tablename__ = "dead_letter_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(50), index=True)
    original_subject = Column(String(200))
    failed_consumer = Column(String(100))
    error_message = Column(Text)
    payload = Column(JSON)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    is_replayed = Column(Boolean, default=False)
