from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ArtistBase(BaseModel):
    artist_name: str


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    artist_name: Optional[str] = None


class ArtistRead(ArtistBase):
    artist_id: int

    model_config = {"from_attributes": True}


class EventArtistCreate(BaseModel):
    event_day_id: int
    artist_id: int
    is_backup: bool = False


class EventArtistRead(BaseModel):
    event_artist_id: int
    event_day_id: int
    artist_id: int
    artist_name: str
    is_backup: bool

    model_config = {"from_attributes": True}
