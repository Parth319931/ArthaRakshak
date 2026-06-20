from sqlalchemy import Column, Integer, String, DateTime, Float
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

class LoanSimulation(Base):
    __tablename__ = "loan_simulations"

    id = Column(Integer, primary_key=True, index=True)
    monthly_income = Column(Float)
    income_type = Column(String)
    loan_amount = Column(Float)
    tenure_months = Column(Integer)
    emi = Column(Float)
    total_interest = Column(Float)
    sip_final_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatLog(Base):
    __tablename__ = "chat_logs"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(String)
    ai_response = Column(String)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

class ProactiveAlert(Base):
    __tablename__ = "proactive_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String)
    severity = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)