from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id"), nullable=False, index=True)

    # Customer info (no account required)
    customer_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    payment_account = Column(Text, nullable=True)

    payment_status = Column(String(50), nullable=True, default="Pending")
    created_at = Column(DateTime, nullable=True)

    schedule = relationship("EventSchedule", back_populates="bookings")
    e_tickets = relationship("ETicket", back_populates="booking")

    @property
    def booking_status(self):
        status_map = {
            "Pending": "PENDING_PAYMENT",
            "Paid": "PAID",
            "Failed": "PAYMENT_FAILED",
            "Refunding": "REFUNDING",
            "Refunded": "REFUNDED",
            "RefundFailed": "REFUND_FAILED",
        }
        return status_map.get(self.payment_status, self.payment_status or "PENDING_PAYMENT")

    @booking_status.setter
    def booking_status(self, value):
        status_map = {
            "PENDING_PAYMENT": "Pending",
            "PAID": "Paid",
            "PAYMENT_FAILED": "Failed",
            "REFUNDING": "Refunding",
            "REFUNDED": "Refunded",
            "REFUND_FAILED": "RefundFailed",
        }
        self.payment_status = status_map.get(value, value)

    @property
    def total_amount(self):
        return sum((Decimal(str(ticket.ticket_config.price)) for ticket in self.e_tickets if ticket.ticket_config), Decimal("0"))

    @property
    def expires_at(self):
        return None

    @property
    def updated_at(self):
        return self.created_at
