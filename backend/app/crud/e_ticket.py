from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.e_ticket import ETicket
from app.models.event_day import EventDay


def get_ticket(db: Session, ticket_id: int) -> Optional[ETicket]:
    return db.query(ETicket).filter(ETicket.ticket_id == ticket_id).first()


def get_tickets_by_event_day(db: Session, event_day_id: int) -> List[ETicket]:
    return db.query(ETicket).filter(ETicket.event_day_id == event_day_id).all()


def get_tickets_by_schedule(db: Session, schedule_id: int) -> List[ETicket]:
    return db.query(ETicket).join(EventDay).filter(EventDay.event_schedule_id == schedule_id).all()


def delete_unbooked_tickets_for_schedule(db: Session, schedule_id: int) -> int:
    """Deletes all e_tickets for a schedule's event days where booking_id is NULL (unbooked)."""
    # Find all event days for this schedule
    event_days = db.query(EventDay).filter(EventDay.event_schedule_id == schedule_id).all()
    day_ids = [day.event_day_id for day in event_days]
    if not day_ids:
        return 0

    deleted_count = db.query(ETicket).filter(
        ETicket.event_day_id.in_(day_ids),
        ETicket.booking_id == None
    ).delete(synchronize_session=False)
    db.commit()
    return deleted_count


def create_tickets_batch(db: Session, tickets: List[ETicket]):
    db.add_all(tickets)
    db.commit()
