from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    number_of_days = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")
    banner_url = Column(Text, nullable=True)

    schedules = relationship("EventSchedule", back_populates="event", cascade="all, delete-orphan")

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
