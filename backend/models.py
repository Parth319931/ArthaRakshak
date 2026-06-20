from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db import Base

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(String)
    ai_response = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)