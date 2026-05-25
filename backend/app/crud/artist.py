from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.artist import Artist
from app.models.event_artist import EventArtist
from app.schemas.artist import ArtistCreate, ArtistUpdate, EventArtistCreate


def create_artist(db: Session, obj_in: ArtistCreate) -> Artist:
    db_obj = Artist(**obj_in.model_dump(exclude_none=True))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_artist(db: Session, artist_id: int) -> Optional[Artist]:
    return db.query(Artist).filter(Artist.artist_id == artist_id).first()


def get_artists(db: Session, skip: int = 0, limit: int = 100) -> List[Artist]:
    return db.query(Artist).offset(skip).limit(limit).all()


def update_artist(db: Session, db_obj: Artist, obj_in: ArtistUpdate) -> Artist:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_artist(db: Session, db_obj: Artist) -> bool:
    db.delete(db_obj)
    db.commit()
    return True


def assign_artist_to_event_day(db: Session, obj_in: EventArtistCreate) -> EventArtist:
    # Check if assignment already exists
    existing = db.query(EventArtist).filter(
        EventArtist.event_day_id == obj_in.event_day_id,
        EventArtist.artist_id == obj_in.artist_id
    ).first()
    if existing:
        existing.is_backup = obj_in.is_backup
        db.commit()
        db.refresh(existing)
        return existing

    db_obj = EventArtist(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove_artist_assignment(db: Session, event_day_id: int, artist_id: int) -> bool:
    assignment = db.query(EventArtist).filter(
        EventArtist.event_day_id == event_day_id,
        EventArtist.artist_id == artist_id
    ).first()
    if assignment:
        db.delete(assignment)
        db.commit()
        return True
    return False


def get_event_artists_by_day(db: Session, event_day_id: int) -> List[EventArtist]:
    return db.query(EventArtist).filter(EventArtist.event_day_id == event_day_id).all()
