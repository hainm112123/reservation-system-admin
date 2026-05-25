from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.event_day import EventDay
from app.schemas.schedule import EventDayCreate, EventDayUpdate


def create_event_day(db: Session, obj_in: EventDayCreate) -> EventDay:
    data = obj_in.model_dump()
    # Map schedule_id to event_schedule_id for internal consistency
    data["event_schedule_id"] = data.pop("schedule_id")
    db_obj = EventDay(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_event_day(db: Session, event_day_id: int) -> Optional[EventDay]:
    return db.query(EventDay).filter(EventDay.event_day_id == event_day_id).first()


def get_event_days_by_schedule(db: Session, schedule_id: int) -> List[EventDay]:
    return db.query(EventDay).filter(EventDay.event_schedule_id == schedule_id).all()


def update_event_day(db: Session, db_obj: EventDay, obj_in: EventDayUpdate) -> EventDay:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_event_day(db: Session, db_obj: EventDay) -> bool:
    db.delete(db_obj)
    db.commit()
    return True
