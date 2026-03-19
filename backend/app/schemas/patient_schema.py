from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PatientCreate(BaseModel):
    full_name : str
    whatsapp_number : str
    language : str = "en"

class PatientOut(BaseModel):
    id : int
    user_id : int
    full_name : str
    whatsapp_number : str
    language : str
    created_at : datetime

    class Config:
        from_attributes = True

class PatientUpdate(BaseModel):
    full_name : Optional[str] = None
    whatsapp_number : Optional[str] = None
    language : Optional[str] = None
