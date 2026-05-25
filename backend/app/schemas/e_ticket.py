from typing import Optional
from pydantic import BaseModel


class ETicketRead(BaseModel):
    ticket_id: int
    ticket_config_id: int
    event_day_id: int
    booking_id: Optional[int] = None
    ticket_code: Optional[str] = None
    ticket_status: str
    row_label: Optional[str] = None
    col_number: Optional[int] = None

    model_config = {"from_attributes": True}


class ETicketDetailRead(ETicketRead):
    ticket_type: Optional[str] = None
    price: Optional[float] = None
    event_name: Optional[str] = None
    venue_name: Optional[str] = None
    date: Optional[str] = None

    model_config = {"from_attributes": True}


# Visual seat design model for input/output
class SeatDesign(BaseModel):
    row_label: str
    col_number: int
    seat_type: str # 'normal', 'special', 'vip'


class SeatLayoutSave(BaseModel):
    seats: list[SeatDesign]
