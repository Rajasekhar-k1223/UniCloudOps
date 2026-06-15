from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class AgentConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), index=True)
    title = Column(String(200))
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    messages = relationship("AgentMessage", back_populates="conversation", cascade="all, delete")

class AgentMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(50), ForeignKey("ai_conversations.id"))
    role = Column(String(20)) # "user", "assistant", "system", "tool"
    agent_name = Column(String(50)) # e.g. "SecOps Agent"
    content = Column(Text)
    tool_calls = Column(JSON) # Track MCP tool executions
    created_at = Column(DateTime(timezone=True), default=func.now())

    conversation = relationship("AgentConversation", back_populates="messages")

class HumanApprovalRequest(Base):
    __tablename__ = "ai_human_approvals"

    id = Column(String(50), primary_key=True, index=True)
    conversation_id = Column(String(50), ForeignKey("ai_conversations.id"))
    agent_name = Column(String(50))
    action_type = Column(String(100)) # e.g. "terraform_apply"
    payload = Column(JSON) # Details of what is being approved
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    reason = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
