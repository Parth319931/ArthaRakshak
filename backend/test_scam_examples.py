import requests

scam_examples = [
    "Congratulations! You've won a lottery of Rs 25,00,000. Send your Aadhaar and bank details to claim now.",
    "Your KYC has expired. Update immediately by clicking this link or your account will be blocked within 24 hours.",
    "URGENT: Work from home job, earn Rs 50,000 per month. Pay Rs 2000 registration fee to start today.",
    "Dear customer, your electricity will be disconnected tonight. Pay the pending bill immediately via this UPI link.",
    "I am calling from RBI. Your account has suspicious activity. Please share the OTP you just received to verify.",
    "Investment opportunity: double your money in 7 days guaranteed, no risk. Limited slots available, invest now.",
    "Your parcel is held at customs. Pay Rs 199 customs fee via this link to release your package.",
]

safe_examples = [
    "Hey, are we still meeting for lunch today at 1pm?",
    "Your order has been shipped and will arrive in 3-5 business days. Track it on our website.",
    "Reminder: your gas cylinder booking is confirmed for tomorrow between 10am-2pm.",
    "Hi, this is a reminder that your electricity bill of Rs 1,240 is due on the 15th. Please pay through the official MSEB app.",
]

print("=" * 60)
print("TESTING SCAM EXAMPLES (should score high)")
print("=" * 60)
for msg in scam_examples:
    response = requests.post("http://localhost:8000/api/scam/check-text", json={"message": msg})
    data = response.json()
    print(f"\nMessage: {msg[:60]}...")
    print(f"Score: {data.get('scam_score')} | Verdict: {data.get('verdict')} | Pattern: {data.get('pattern_name')}")

print("\n" + "=" * 60)
print("TESTING SAFE EXAMPLES (should score low)")
print("=" * 60)
for msg in safe_examples:
    response = requests.post("http://localhost:8000/api/scam/check-text", json={"message": msg})
    data = response.json()
    print(f"\nMessage: {msg[:60]}...")
    print(f"Score: {data.get('scam_score')} | Verdict: {data.get('verdict')} | Pattern: {data.get('pattern_name')}")