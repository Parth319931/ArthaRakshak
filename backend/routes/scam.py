from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import pytesseract
import json
from llm import ask_llm
from db import SessionLocal
from models import ScamCheck

router = APIRouter()

SCAM_SYSTEM_PROMPT = """You are a fraud detection expert specializing in scams targeting Indian users, including job scams, lottery scams, fake KYC update messages, loan app fraud, and investment fraud.

You must respond with ONLY valid JSON in exactly this format, nothing else, no markdown formatting, no explanation outside the JSON:

{
  "scam_score": <integer 0-100>,
  "verdict": "<SAFE or SUSPICIOUS or SCAM>",
  "pattern_name": "<short name of the scam pattern, e.g. Fake Job Offer Scam, or None if safe>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"],
  "advice": "<one simple sentence of advice in plain, non-technical language>"
}

Scoring guide:
- 0-30 = SAFE, normal message
- 31-65 = SUSPICIOUS, has some red flags but not certain
- 66-100 = SCAM, strong red flags present

Always give exactly 3 reasons, even for safe messages (explain why it looks safe).
"""

class TextCheckRequest(BaseModel):
    message: str

def analyze_text_for_scam(text: str) -> dict:
    raw_response = ask_llm(text, system=SCAM_SYSTEM_PROMPT)

    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        result = {
            "scam_score": 50,
            "verdict": "SUSPICIOUS",
            "pattern_name": "Could not analyze",
            "reasons": ["The system had trouble analyzing this message", "Please try again", "Or paste the text manually"],
            "advice": "When in doubt, do not click any links or share personal information."
        }

    return result

@router.post("/scam/check-text")
async def check_text(request: TextCheckRequest):
    result = analyze_text_for_scam(request.message)

    db = SessionLocal()
    log = ScamCheck(
        input_text=request.message,
        scam_score=result.get("scam_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        pattern_name=result.get("pattern_name", "")
    )
    db.add(log)
    db.commit()
    db.close()

    return result

@router.post("/scam/check-image")
async def check_image(file: UploadFile = File(...)):
    image = Image.open(file.file)
    extracted_text = pytesseract.image_to_string(image)

    if not extracted_text.strip():
        return {
            "scam_score": 0,
            "verdict": "UNKNOWN",
            "pattern_name": "No text found",
            "reasons": ["Could not read any text from this image", "Try a clearer screenshot", "Or paste the message text directly"],
            "advice": "Please try uploading a clearer image or paste the text instead."
        }

    result = analyze_text_for_scam(extracted_text)
    result["extracted_text"] = extracted_text.strip()

    db = SessionLocal()
    log = ScamCheck(
        input_text=extracted_text.strip(),
        scam_score=result.get("scam_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        pattern_name=result.get("pattern_name", "")
    )
    db.add(log)
    db.commit()
    db.close()

    return result