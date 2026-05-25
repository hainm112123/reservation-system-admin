from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── EventSchedule ──────────────────────────────────────────────

class EventScheduleCreate(BaseModel):
    event_id: int
    venue_id: int
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None


class EventScheduleUpdate(BaseModel):
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    seat_layout: Optional[str] = None


class EventScheduleRead(BaseModel):
    schedule_id: int
    event_id: int
    venue_id: int
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    seat_layout: Optional[str] = None

    model_config = {"from_attributes": True}


# ── EventDay ──────────────────────────────────────────────────

class EventDayCreate(BaseModel):
    schedule_id: int
    date: datetime


class EventDayUpdate(BaseModel):
    date: Optional[datetime] = None


class EventDayRead(BaseModel):
    event_day_id: int
    schedule_id: int
    date: datetime

    model_config = {"from_attributes": True}
