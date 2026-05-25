from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class TicketConfig(Base):
    __tablename__ = "ticket_configs"
    config_id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_type = Column(String(100), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    max_quantity = Column(Integer, nullable=False)

    schedule = relationship("EventSchedule", back_populates="ticket_configs")
    e_tickets = relationship("ETicket", back_populates="ticket_config", cascade="all, delete-orphan")

    @property
    def remaining_quantity(self):
        return None

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
