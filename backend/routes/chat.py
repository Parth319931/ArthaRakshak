from fastapi import APIRouter
from pydantic import BaseModel
from llm import ask_llm
from db import SessionLocal
from models import ChatLog

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    system_prompt = (
        "You are ArthaRakshak, a friendly proactive financial guardian AI for "
        "underserved populations including gig workers, farmers, and people with "
        "irregular income. Keep answers short, simple, and in plain language. "
        "Avoid financial jargon."
    )

    ai_reply = ask_llm(request.message, system=system_prompt)

    db = SessionLocal()
    log_entry = ChatLog(user_message=request.message, ai_response=ai_reply)
    db.add(log_entry)
    db.commit()
    db.close()

    return ChatResponse(reply=ai_reply)