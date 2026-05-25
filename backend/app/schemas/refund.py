from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class RefundCreate(BaseModel):
    booking_id: int
    reason: Optional[str] = None


class RefundRead(BaseModel):
    refund_id: int
    booking_id: int
    gateway_refund_id: Optional[str] = None
    amount: Decimal
    status: str
    reason: Optional[str] = None
    is_manual: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
