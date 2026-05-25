from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.venue import Venue
from app.schemas.venue import VenueCreate, VenueUpdate


def create_venue(db: Session, obj_in: VenueCreate) -> Venue:
    db_obj = Venue(**obj_in.model_dump(exclude_none=True))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_venue(db: Session, venue_id: int) -> Optional[Venue]:
    return db.query(Venue).filter(Venue.venue_id == venue_id).first()


def get_venues(db: Session, skip: int = 0, limit: int = 100) -> List[Venue]:
    return db.query(Venue).offset(skip).limit(limit).all()


def update_venue(db: Session, db_obj: Venue, obj_in: VenueUpdate) -> Venue:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_venue(db: Session, db_obj: Venue) -> bool:
    db.delete(db_obj)
    db.commit()
    return True
