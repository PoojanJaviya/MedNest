from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.medicine_model import Medicine
from app.models.patient_model import Patient
from app.models.user_model import User
from app.schemas.medicine_schema import MedicineCreate, MedicineUpdate, MedicineOut

router = APIRouter(prefix="/medicines", tags=["Medicines"])


def get_patient_or_404(patient_id: int, user_id: int, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/patient/{patient_id}", response_model=list[MedicineOut])
def get_medicines(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_patient_or_404(patient_id, current_user.id, db)
    return db.query(Medicine).filter(Medicine.patient_id == patient_id).all()


@router.post("/patient/{patient_id}", response_model=MedicineOut, status_code=status.HTTP_201_CREATED)
def create_medicine(patient_id: int, payload: MedicineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_patient_or_404(patient_id, current_user.id, db)
    medicine = Medicine(**payload.model_dump(), patient_id=patient_id)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.put("/{medicine_id}", response_model=MedicineOut)
def update_medicine(medicine_id: int, payload: MedicineUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicine = (
        db.query(Medicine)
        .join(Patient)
        .filter(Medicine.id == medicine_id, Patient.user_id == current_user.id)
        .first()
    )
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(medicine, key, value)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    medicine = (
        db.query(Medicine)
        .join(Patient)
        .filter(Medicine.id == medicine_id, Patient.user_id == current_user.id)
        .first()
    )
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(medicine)
    db.commit()