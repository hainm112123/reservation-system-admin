from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Artist(Base):
    __tablename__ = "artists"

    artist_id = Column(Integer, primary_key=True, index=True)
    artist_name = Column(String(255), nullable=False)

    event_artists = relationship("EventArtist", back_populates="artist", cascade="all, delete-orphan")

    @property
    def bio(self):
        return None

    @property
    def image_url(self):
        return None

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None
