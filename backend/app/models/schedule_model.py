from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    times_of_day = Column(ARRAY(String), nullable=False)  # ["08:00", "14:00"]
    days_of_week = Column(ARRAY(String), nullable=True)   # ["Mon", "Wed"] or None = every day
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)

    medicine = relationship("Medicine", back_populates="schedules")