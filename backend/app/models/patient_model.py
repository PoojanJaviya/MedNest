from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    patient_name = Column(String, nullable=False)
    whatsapp_number = Column(String, nullable=False, unique=True)
    language = Column(String, server_default="en")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    caregiver = relationship("User", back_populates="patients")
    medicines = relationship("Medicine", back_populates="patient", cascade="all, delete-orphan")