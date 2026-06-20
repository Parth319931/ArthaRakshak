from fastapi import APIRouter
from pydantic import BaseModel, Field
import json
import os
from llm import ask_llm
from db import SessionLocal
from models import LoanSimulation
from financial_math import calculate_emi_schedule, calculate_sip_future_value

router = APIRouter()

SCHEMES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "schemes.json")

with open(SCHEMES_PATH, "r") as f:
    SCHEMES = json.load(f)

SIMULATOR_SYSTEM_PROMPT = """You are ArthaRakshak, a friendly financial guardian AI helping underserved Indian users (gig workers, farmers, low-income earners) decide between taking a loan or saving the same amount instead.

You will be given real, pre-calculated numbers for two paths: TAKE LOAN and SAVE + SIP. Do not recalculate anything yourself, only explain the given numbers.

Respond in plain, simple, non-technical language suitable for someone with low financial literacy. Avoid jargon like "amortization" or "compounding" — use everyday words instead.

You must respond with ONLY valid JSON in exactly this format, nothing else, no markdown formatting:

{
  "comparison_points": ["<point 1>", "<point 2>", "<point 3>"],
  "recommendation": "<one sentence, plain language, which path seems better for this person and why>"
}

Give exactly 3 comparison points, each one short sentence.
"""


class SimulationRequest(BaseModel):
    monthly_income: float
    income_type: str = Field(..., description="salaried, gig_worker, seasonal_farmer, or business_owner")
    loan_amount: float
    tenure_months: int
    loan_interest_rate: float = 12.0
    expected_sip_return_rate: float = 12.0


def match_schemes(monthly_income: float, income_type: str) -> list:
    annual_income = monthly_income * 12
    matched = []
    for scheme in SCHEMES:
        income_ok = annual_income <= scheme.get("max_annual_income", 10_000_000)
        type_ok = "any" in scheme["applicable_income_types"] or income_type in scheme["applicable_income_types"]
        if income_ok and type_ok:
            matched.append(scheme)
    return matched[:5]


@router.post("/simulate/loan")
async def simulate_loan(request: SimulationRequest):
    loan_result = calculate_emi_schedule(
        principal=request.loan_amount,
        annual_interest_rate=request.loan_interest_rate,
        tenure_months=request.tenure_months
    )

    sip_result = calculate_sip_future_value(
        monthly_investment=loan_result["emi"],
        annual_return_rate=request.expected_sip_return_rate,
        tenure_months=request.tenure_months
    )

    matched_schemes = match_schemes(request.monthly_income, request.income_type)

    explanation_prompt = f"""
User profile: monthly income ₹{request.monthly_income}, income type: {request.income_type}.
They are considering a loan of ₹{request.loan_amount} over {request.tenure_months} months at {request.loan_interest_rate}% annual interest.

PATH A - TAKE LOAN:
EMI per month: ₹{loan_result['emi']}
Total amount paid back: ₹{loan_result['total_payment']}
Total interest paid: ₹{loan_result['total_interest']}

PATH B - SAVE + SIP INSTEAD (investing the same ₹{loan_result['emi']}/month into a mutual fund SIP at {request.expected_sip_return_rate}% expected annual return, instead of taking the loan):
Total invested: ₹{sip_result['total_invested']}
Final value after {request.tenure_months} months: ₹{sip_result['final_value']}
Total growth earned: ₹{sip_result['total_growth']}

Explain this comparison to the user.
"""

    raw_response = ask_llm(explanation_prompt, system=SIMULATOR_SYSTEM_PROMPT)

    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    try:
        explanation = json.loads(cleaned)
    except json.JSONDecodeError:
        explanation = {
            "comparison_points": [
                "The loan path gives you money now but costs extra in interest.",
                "The save + SIP path takes longer but can grow your money instead.",
                "Compare the total interest cost against the total growth shown above."
            ],
            "recommendation": "Consider your urgent needs versus long-term savings before deciding."
        }

    db = SessionLocal()
    log = LoanSimulation(
        monthly_income=request.monthly_income,
        income_type=request.income_type,
        loan_amount=request.loan_amount,
        tenure_months=request.tenure_months,
        emi=loan_result["emi"],
        total_interest=loan_result["total_interest"],
        sip_final_value=sip_result["final_value"]
    )
    db.add(log)
    db.commit()
    db.close()

    return {
        "loan_path": loan_result,
        "sip_path": sip_result,
        "explanation": explanation,
        "matched_schemes": matched_schemes
    }