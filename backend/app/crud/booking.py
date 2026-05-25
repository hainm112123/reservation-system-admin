from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.booking import Booking


def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
    return db.query(Booking).filter(Booking.booking_id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 100) -> List[Booking]:
    return db.query(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


def get_paid_bookings_by_event(db: Session, event_id: int) -> List[Booking]:
    from app.models.event_schedule import EventSchedule
    # Standardised paid status: 'Paid' or 'PAID'
    return db.query(Booking).join(EventSchedule).filter(
        EventSchedule.event_id == event_id,
        Booking.payment_status.in_(["Paid", "PAID"])
    ).all()
