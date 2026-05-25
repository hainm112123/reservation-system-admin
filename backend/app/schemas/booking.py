from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel
from app.schemas.e_ticket import ETicketRead


class BookingRead(BaseModel):
    booking_id: int
    schedule_id: int
    customer_name: str
    phone: str
    email: str
    payment_account: Optional[str] = None
    booking_status: str
    total_amount: Decimal
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    e_tickets: List[ETicketRead] = []

    model_config = {"from_attributes": True}


class BookingListItem(BaseModel):
    booking_id: int
    customer_name: str
    email: str
    phone: str
    booking_status: str
    total_amount: Decimal
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
