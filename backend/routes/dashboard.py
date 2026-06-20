from fastapi import APIRouter
import random
from llm import ask_llm
from db import SessionLocal
from models import ChatLog, ScamCheck, LoanSimulation, ProactiveAlert

router = APIRouter()

ALERT_SCENARIOS = [
    {
        "alert_type": "cash_flow_stress",
        "severity": "warning",
        "context": "A gig worker's income dropped 30% over the last 10 days compared to their usual pattern, and a loan EMI is due in 5 days."
    },
    {
        "alert_type": "scam_pattern",
        "severity": "danger",
        "context": "Three users in the same community reported a near-identical 'KYC update' SMS within the last 48 hours, matching a known fraud pattern."
    },
    {
        "alert_type": "savings_milestone",
        "severity": "info",
        "context": "A user has maintained their monthly SIP contribution for 3 months in a row without missing one."
    },
    {
        "alert_type": "scheme_reminder",
        "severity": "info",
        "context": "A farmer's PM-KISAN installment window opens in 7 days and they have not yet applied this cycle."
    }
]

ALERT_SYSTEM_PROMPT = """You are ArthaRakshak, a proactive financial guardian AI. You will be given a short internal context describing a financial signal that was just detected in the background.

Write ONE short proactive alert message (maximum 2 sentences) that ArthaRakshak would surface to the user right now, in plain, warm, non-alarming language. Do not use jargon. Make it feel personally relevant and timely, not generic.

Respond with ONLY the alert message text, nothing else, no quotes, no labels.
"""


def calculate_health_score(scam_checks, simulations):
    score = 70

    dangerous_count = sum(1 for s in scam_checks if s.verdict == "SCAM")
    score -= dangerous_count * 5

    if simulations:
        latest = simulations[0]
        if latest.sip_final_value > latest.loan_amount:
            score += 10

    return max(0, min(100, score))


@router.get("/dashboard/summary")
async def dashboard_summary():
    db = SessionLocal()

    scam_checks = db.query(ScamCheck).order_by(ScamCheck.created_at.desc()).limit(20).all()
    simulations = db.query(LoanSimulation).order_by(LoanSimulation.created_at.desc()).limit(20).all()
    chats = db.query(ChatLog).order_by(ChatLog.created_at.desc()).limit(20).all()
    alerts = db.query(ProactiveAlert).order_by(ProactiveAlert.created_at.desc()).limit(5).all()

    health_score = calculate_health_score(scam_checks, simulations)

    activity = []
    for s in scam_checks[:5]:
        activity.append({
            "type": "scam_check",
            "summary": f"Scam check: {s.verdict} ({s.scam_score}%)",
            "created_at": s.created_at.isoformat()
        })
    for sim in simulations[:5]:
        activity.append({
            "type": "loan_simulation",
            "summary": f"Simulated ₹{sim.loan_amount} loan over {sim.tenure_months} months",
            "created_at": sim.created_at.isoformat()
        })
    for c in chats[:5]:
        activity.append({
            "type": "chat",
            "summary": f"Asked: {c.user_message[:60]}",
            "created_at": c.created_at.isoformat()
        })

    activity.sort(key=lambda x: x["created_at"], reverse=True)

    db.close()

    return {
        "health_score": health_score,
        "total_scam_checks": len(scam_checks),
        "total_simulations": len(simulations),
        "recent_activity": activity[:8],
        "recent_alerts": [
            {
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "created_at": a.created_at.isoformat()
            }
            for a in alerts
        ]
    }


@router.post("/dashboard/simulate-cycle")
async def simulate_cycle():
    scenario = random.choice(ALERT_SCENARIOS)

    message = ask_llm(scenario["context"], system=ALERT_SYSTEM_PROMPT).strip()

    db = SessionLocal()
    alert = ProactiveAlert(
        alert_type=scenario["alert_type"],
        severity=scenario["severity"],
        message=message
    )
    db.add(alert)
    db.commit()
    db.close()

    return {
        "alert_type": scenario["alert_type"],
        "severity": scenario["severity"],
        "message": message
    }