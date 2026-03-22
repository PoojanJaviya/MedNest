from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.schedule_model import Schedule
from app.models.medicine_model import Medicine
from app.models.patient_model import Patient
from app.models.user_model import User
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate, ScheduleOut

router = APIRouter(prefix="/schedules", tags=["Schedules"])


def get_medicine_or_404(medicine_id: int, user_id: int, db: Session) -> Medicine:
    medicine = (
        db.query(Medicine)
        .join(Patient)
        .filter(Medicine.id == medicine_id, Patient.user_id == user_id)
        .first()
    )
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


@router.get("/medicine/{medicine_id}", response_model=list[ScheduleOut])
def get_schedules(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_medicine_or_404(medicine_id, current_user.id, db)
    return db.query(Schedule).filter(Schedule.medicine_id == medicine_id).all()


@router.post("/medicine/{medicine_id}", response_model=ScheduleOut, status_code=status.HTTP_201_CREATED)
def create_schedule(medicine_id: int, payload: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_medicine_or_404(medicine_id, current_user.id, db)
    schedule = Schedule(**payload.model_dump(), medicine_id=medicine_id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleOut)
def update_schedule(schedule_id: int, payload: ScheduleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = (
        db.query(Schedule)
        .join(Medicine).join(Patient)
        .filter(Schedule.id == schedule_id, Patient.user_id == current_user.id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = (
        db.query(Schedule)
        .join(Medicine).join(Patient)
        .filter(Schedule.id == schedule_id, Patient.user_id == current_user.id)
        .first()
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()