from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class EventDay(Base):
    __tablename__ = "event_days"

    event_day_id = Column(Integer, primary_key=True, index=True)
    event_schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime, nullable=False)

    schedule = relationship("EventSchedule", back_populates="event_days")
    event_artists = relationship("EventArtist", back_populates="event_day", cascade="all, delete-orphan")
    e_tickets = relationship("ETicket", back_populates="event_day", cascade="all, delete-orphan")

    @property
    def schedule_id(self):
        return self.event_schedule_id

    @schedule_id.setter
    def schedule_id(self, value):
        self.event_schedule_id = value

    @property
    def status(self):
        return "ACTIVE"

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
