from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import or_
from datetime import date, datetime
from app.database import SessionLocal
from app.models.schedule_model import Schedule
from app.models.medicine_model import Medicine
from app.models.patient_model import Patient
from app.services.whatsapp import send_whatsapp_reminder


def check_and_send_reminders():
    db = SessionLocal()
    try:
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        current_day = now.strftime("%a")
        today = date.today()

        schedules = db.query(Schedule).join(Medicine).join(Patient).filter(
            Schedule.is_active == True,
            Schedule.start_date <= today,
            or_(Schedule.end_date == None, Schedule.end_date >= today)
        ).all()

        for schedule in schedules:
            if current_time not in schedule.times_of_day:
                continue

            if schedule.days_of_week and current_day not in schedule.days_of_week:
                continue

            patient = schedule.medicine.patient
            send_whatsapp_reminder(
                to_number=patient.whatsapp_number,
                medicine_name=schedule.medicine.medicine_name,
                dosage=schedule.medicine.dosage,
                instruction=schedule.medicine.instruction,
                language=patient.language,
            )

    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_reminders, "interval", minutes=1)
    scheduler.start()
    return scheduler