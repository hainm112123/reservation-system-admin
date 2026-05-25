from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ETicket(Base):
    __tablename__ = "e_tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)
    ticket_config_id = Column(Integer, ForeignKey("ticket_configs.config_id", ondelete="CASCADE"), nullable=False, index=True)
    event_day_id = Column(Integer, ForeignKey("event_days.event_day_id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id", ondelete="SET NULL"), nullable=True, index=True)
    ticket_code = Column(String(255), nullable=True)
    ticket_status = Column(String(50), nullable=False, default="Available") # 'Available', 'Holding', 'Valid', 'Used', 'Canceled', 'Reserved'
    row_label = Column(String(50), nullable=True)
    col_number = Column(Integer, nullable=True)

    ticket_config = relationship("TicketConfig", back_populates="e_tickets")
    event_day = relationship("EventDay", back_populates="e_tickets")
    booking = relationship("Booking", back_populates="e_tickets")

    @property
    def qr_code_url(self):
        return None

    @property
    def issued_at(self):
        return None

    @property
    def used_at(self):
        return None

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
