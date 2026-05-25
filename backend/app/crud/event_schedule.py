from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.event_schedule import EventSchedule
from app.schemas.schedule import EventScheduleCreate, EventScheduleUpdate


def create_schedule(db: Session, obj_in: EventScheduleCreate) -> EventSchedule:
    db_obj = EventSchedule(**obj_in.model_dump(exclude_none=True))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_schedule(db: Session, schedule_id: int) -> Optional[EventSchedule]:
    return db.query(EventSchedule).filter(EventSchedule.schedule_id == schedule_id).first()


def get_schedules(db: Session, skip: int = 0, limit: int = 100) -> List[EventSchedule]:
    return db.query(EventSchedule).offset(skip).limit(limit).all()


def get_schedules_by_event(db: Session, event_id: int) -> List[EventSchedule]:
    return db.query(EventSchedule).filter(EventSchedule.event_id == event_id).all()


def update_schedule(db: Session, db_obj: EventSchedule, obj_in: EventScheduleUpdate) -> EventSchedule:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_schedule(db: Session, db_obj: EventSchedule) -> bool:
    db.delete(db_obj)
    db.commit()
    return True
