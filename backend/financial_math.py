"""
Pure financial math for ArthaRakshak's Cash-Flow + Loan Decision Simulator.
No database or LLM dependencies here on purpose — deterministic, testable calculations only.
"""

def calculate_emi_schedule(principal: float, annual_interest_rate: float, tenure_months: int) -> dict:
    """
    Standard reducing-balance EMI formula:
    EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    where r = monthly interest rate, n = tenure in months.
    Returns EMI, total payment, total interest, and a month-by-month schedule
    (used later to draw the chart).
    """
    monthly_rate = annual_interest_rate / 12 / 100

    if monthly_rate == 0:
        emi = principal / tenure_months
    else:
        factor = (1 + monthly_rate) ** tenure_months
        emi = principal * monthly_rate * factor / (factor - 1)

    emi = round(emi, 2)

    schedule = []
    balance = principal
    cumulative_interest = 0.0

    for month in range(1, tenure_months + 1):
        interest_payment = balance * monthly_rate
        principal_payment = emi - interest_payment
        balance = max(balance - principal_payment, 0)
        cumulative_interest += interest_payment

        schedule.append({
            "month": month,
            "remaining_balance": round(balance, 2),
            "cumulative_interest_paid": round(cumulative_interest, 2)
        })

    total_payment = round(emi * tenure_months, 2)
    total_interest = round(total_payment - principal, 2)

    return {
        "emi": emi,
        "total_payment": total_payment,
        "total_interest": total_interest,
        "schedule": schedule
    }


def calculate_sip_future_value(monthly_investment: float, annual_return_rate: float, tenure_months: int) -> dict:
    """
    Standard SIP future value formula (investment at start of each month):
    FV = P * [((1+r)^n - 1) / r] * (1+r)
    where r = monthly rate of return, n = number of months elapsed.
    Returns final value, total invested, total growth, and a month-by-month schedule.
    """
    monthly_rate = annual_return_rate / 12 / 100

    schedule = []
    invested_so_far = 0.0
    value_so_far = 0.0

    for month in range(1, tenure_months + 1):
        invested_so_far += monthly_investment
        if monthly_rate == 0:
            value_so_far = invested_so_far
        else:
            value_so_far = monthly_investment * (((1 + monthly_rate) ** month - 1) / monthly_rate) * (1 + monthly_rate)

        schedule.append({
            "month": month,
            "invested_so_far": round(invested_so_far, 2),
            "value_so_far": round(value_so_far, 2)
        })

    total_invested = round(invested_so_far, 2)
    final_value = round(value_so_far, 2)
    total_growth = round(final_value - total_invested, 2)

    return {
        "final_value": final_value,
        "total_invested": total_invested,
        "total_growth": total_growth,
        "schedule": schedule
    }