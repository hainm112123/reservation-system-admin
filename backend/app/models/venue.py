from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Venue(Base):
    __tablename__ = "venues"

    venue_id = Column(Integer, primary_key=True, index=True)
    venue_name = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False)
    city = Column(String(100), nullable=False)

    schedules = relationship("EventSchedule", back_populates="venue", cascade="all, delete-orphan")

    @property
    def address(self):
        return None

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
