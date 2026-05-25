from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, field_validator


class TicketConfigBase(BaseModel):
    ticket_type: str
    price: Decimal
    max_quantity: int

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("price must be >= 0")
        return v

    @field_validator("max_quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("max_quantity must be > 0")
        return v


class TicketConfigCreate(TicketConfigBase):
    schedule_id: int


class TicketConfigUpdate(BaseModel):
    ticket_type: Optional[str] = None
    price: Optional[Decimal] = None
    max_quantity: Optional[int] = None


class TicketConfigRead(TicketConfigBase):
    config_id: int
    schedule_id: int
    remaining_quantity: Optional[int] = None

    model_config = {"from_attributes": True}
