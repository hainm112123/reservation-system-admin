from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def create_event(db: Session, obj_in: EventCreate) -> Event:
    db_obj = Event(**obj_in.model_dump(exclude_none=True))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_event(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.event_id == event_id).first()


def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    return db.query(Event).offset(skip).limit(limit).all()


def update_event(db: Session, db_obj: Event, obj_in: EventUpdate) -> Event:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def cancel_event(db: Session, db_obj: Event) -> Event:
    db_obj.status = "CANCELLED"
    db.commit()
    db.refresh(db_obj)
    return db_obj
