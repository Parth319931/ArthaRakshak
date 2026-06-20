from fastapi import APIRouter
from pydantic import BaseModel
from llm import ask_llm
from db import SessionLocal
from models import ChatLog

router = APIRouter()

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "kn": "Kannada"
}

class ChatRequest(BaseModel):
    message: str
    language: str = "en"

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    language_name = LANGUAGE_NAMES.get(request.language, "English")

    system_prompt = (
        "You are ArthaRakshak, a friendly proactive financial guardian AI for "
        "underserved populations including gig workers, farmers, and people with "
        "irregular income. Keep answers short, simple, and in plain language. "
        "Avoid financial jargon. "
        f"Respond ONLY in {language_name}, written in {language_name}'s native script. "
        "You may keep common financial terms like EMI, UPI, KYC, OTP in English since "
        "most Indian speakers already use these English terms in everyday speech. "
        "Keep your reply to 2-3 short sentences, suitable for being read aloud."
    )

    ai_reply = ask_llm(request.message, system=system_prompt)

    db = SessionLocal()
    log_entry = ChatLog(
        user_message=request.message,
        ai_response=ai_reply,
        language=request.language
    )
    db.add(log_entry)
    db.commit()
    db.close()

    return ChatResponse(reply=ai_reply)