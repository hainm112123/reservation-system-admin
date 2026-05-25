from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EventBase(BaseModel):
    event_name: str
    description: Optional[str] = None
    number_of_days: Optional[int] = None
    banner_url: Optional[str] = None
    status: Optional[str] = "ACTIVE"


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    description: Optional[str] = None
    number_of_days: Optional[int] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None


class EventRead(EventBase):
    event_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class EventListItem(BaseModel):
    event_id: int
    event_name: str
    description: Optional[str] = None
    number_of_days: Optional[int] = None
    banner_url: Optional[str] = None
    status: str = "ACTIVE"

    model_config = {"from_attributes": True}
