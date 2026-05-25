from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class EventArtist(Base):
    __tablename__ = "event_artists"
    event_artist_id = Column(Integer, primary_key=True, index=True)
    event_day_id = Column(Integer, ForeignKey("event_days.event_day_id", ondelete="CASCADE"), nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("artists.artist_id", ondelete="CASCADE"), nullable=False, index=True)
    is_backup = Column(Boolean, nullable=False, default=False)

    event_day = relationship("EventDay", back_populates="event_artists")
    artist = relationship("Artist", back_populates="event_artists")

    @property
    def artist_name(self):
        return self.artist.artist_name if self.artist else ""
