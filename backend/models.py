from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db import Base

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(String)
    ai_response = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScamCheck(Base):
    __tablename__ = "scam_checks"

    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(String)
    scam_score = Column(Integer)
    verdict = Column(String)
    pattern_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)