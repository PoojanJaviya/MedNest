from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, index=True, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    instruction = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True),server_default=func.now())

    patient = relationship("Patient",back_populates="medicines")
    schedules = relationship("Schedule", back_populates="medicine", cascade="all, delete-orphan")
