from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class VenueBase(BaseModel):
    venue_name: str
    city: str
    capacity: int


class VenueCreate(VenueBase):
    pass


class VenueUpdate(BaseModel):
    venue_name: Optional[str] = None
    city: Optional[str] = None
    capacity: Optional[int] = None


class VenueRead(VenueBase):
    venue_id: int

    model_config = {"from_attributes": True}
