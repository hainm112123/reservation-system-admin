from sqlalchemy.orm import Session
from typing import Tuple
from app.models.event import Event
from app.models.event_schedule import EventSchedule
from app.models.ticket_config import TicketConfig
from app.models.venue import Venue
from app.models.booking import Booking
from app.models.e_ticket import ETicket
from app.models.event_day import EventDay


def validate_schedule_capacity(db: Session, schedule_id: int, venue_id: int, new_max_quantity: int = 0) -> Tuple[bool, str]:
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return False, "Venue not found"
        
    configs = db.query(TicketConfig).filter(TicketConfig.schedule_id == schedule_id).all()
    current_total = sum([c.max_quantity for c in configs])
    
    if current_total + new_max_quantity > venue.capacity:
        return False, f"Exceeds venue capacity ({venue.capacity})"
        
    return True, ""


def cancel_event(db: Session, event_id: int, reason: str) -> bool:
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        return False

    # Mark event as cancelled
    event.status = "CANCELLED"

    # Find all schedules under this event
    schedules = db.query(EventSchedule).filter(EventSchedule.event_id == event_id).all()
    schedule_ids = [s.schedule_id for s in schedules]
    
    if schedule_ids:
        # Find all bookings for these schedules
        bookings = db.query(Booking).filter(
            Booking.schedule_id.in_(schedule_ids),
            Booking.payment_status.in_(["Paid", "PAID"])
        ).all()

        for booking in bookings:
            booking.payment_status = "Refunding"
            # Update all e_tickets for this booking
            tickets = db.query(ETicket).filter(ETicket.booking_id == booking.booking_id).all()
            for ticket in tickets:
                ticket.ticket_status = "Canceled"

    db.commit()
    return True
