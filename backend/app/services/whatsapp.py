from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
FROM_NUMBER = os.getenv("TWILIO_WHATSAPP_FROM")  # "whatsapp:+14155238886"

client = Client(ACCOUNT_SID, AUTH_TOKEN)


REMINDER_TEMPLATES = {
    "en": "💊 Reminder: Time to take *{medicine}*!\nDosage: {dosage}\n📝 {instruction}",
    "hi": "💊 याद दिलाएं: *{medicine}* लेने का समय हो गया है!\nखुराक: {dosage}\n📝 {instruction}",
    "gu": "💊 રિમાઇન્ડર: *{medicine}* લેવાનો સમય થઈ ગયો છે!\nડોઝ: {dosage}\n📝 {instruction}",
    "mr": "💊 आठवण: *{medicine}* घेण्याची वेळ झाली आहे!\nमात्रा: {dosage}\n📝 {instruction}",
}

FALLBACK_TEMPLATE = REMINDER_TEMPLATES["en"]


def build_message(medicine_name: str, dosage: str, instruction: str, language: str) -> str:
    template = REMINDER_TEMPLATES.get(language, FALLBACK_TEMPLATE)
    return template.format(
        medicine=medicine_name,
        dosage=dosage or "As prescribed",
        instruction=instruction or "Follow doctor's advice",
    )


def send_whatsapp_reminder(
    to_number: str,
    medicine_name: str,
    dosage: str,
    instruction: str,
    language: str = "en",
) -> bool:
    """
    Send a WhatsApp reminder via Twilio.
    Returns True on success, False on failure.
    to_number should be just the digits e.g. "+919876543210"
    """
    try:
        body = build_message(medicine_name, dosage, instruction, language)
        message = client.messages.create(
            body=body,
            from_=FROM_NUMBER,
            to=f"whatsapp:{to_number}",
        )
        print(f"[WHATSAPP SENT] SID: {message.sid} → {to_number}")
        return True
    except Exception as e:
        print(f"[WHATSAPP ERROR] Failed to send to {to_number}: {e}")
        return False