from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MedicineCreate(BaseModel):
    medicine_name : str
    dosage : Optional[str] = None
    instruction : Optional[str] = None

class MedicineUpdate(BaseModel):
    medicine_name : Optional[str] = None
    dosage : Optional[str] = None
    instruction : Optional[str] = None

class MedicineOut(BaseModel):
    id : int
    patient_id : int
    medicine_name : str
    dosage: Optional[str] = None
    instruction: Optional[str] = None
    created_at : datetime

    class Config:
        from_attributes = True