from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class ScheduleCreate(BaseModel):
    medicine_id: int
    times_of_day: List[str]
    days_of_week: Optional[List[str]] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True


class ScheduleUpdate(BaseModel):
    times_of_day: Optional[List[str]] = None
    days_of_week: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class ScheduleOut(BaseModel):
    id: int
    medicine_id: int
    times_of_day: List[str]
    days_of_week: Optional[List[str]] = None
    start_date: date
    end_date: Optional[date] = None
    is_active: bool

    class Config:
        from_attributes = True