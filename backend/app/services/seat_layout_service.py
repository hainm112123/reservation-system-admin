import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.event_schedule import EventSchedule
from app.models.event_day import EventDay
from app.models.ticket_config import TicketConfig
from app.models.venue import Venue
from app.models.e_ticket import ETicket
from app.crud.e_ticket import delete_unbooked_tickets_for_schedule, create_tickets_batch


def save_seat_layout_and_pregenerate(db: Session, schedule_id: int, seats_layout: list) -> dict:
    # 1. Fetch EventSchedule and Venue
    schedule = db.query(EventSchedule).filter(EventSchedule.schedule_id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Event schedule not found")

    if schedule.event and schedule.event.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot modify seat layout or tickets for a cancelled event."
        )

    venue = db.query(Venue).filter(Venue.venue_id == schedule.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    # 2. Capacity Validation
    total_designed_seats = len(seats_layout)
    if total_designed_seats > venue.capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Designed seat count ({total_designed_seats}) exceeds venue capacity ({venue.capacity})"
        )

    # 3. Ticket Configurations check
    # Map ticket_type to config_id
    configs = db.query(TicketConfig).filter(TicketConfig.schedule_id == schedule_id).all()
    config_map = {c.ticket_type.lower(): c.config_id for c in configs}

    # Verify that all designed seat types have corresponding ticket configs
    designed_types = set(seat['seat_type'].lower() for seat in seats_layout)
    for stype in designed_types:
        if stype not in config_map:
            raise HTTPException(
                status_code=400,
                detail=f"Pricing config not found for seat type '{stype}'. Please configure ticket prices first."
            )

    # 4. Save visual layout JSON configuration
    schedule.seat_layout = json.dumps(seats_layout)
    db.commit()

    # 5. Pre-generate physical tickets for each EventDay under this schedule
    event_days = db.query(EventDay).filter(EventDay.event_schedule_id == schedule_id).all()
    
    total_generated = 0
    
    # We will process each event day
    for day in event_days:
        # Fetch already booked tickets for this day to avoid overwriting/deleting them
        booked_tickets = db.query(ETicket).filter(
            ETicket.event_day_id == day.event_day_id,
            ETicket.booking_id != None
        ).all()
        
        # Keep track of booked seats row/col
        booked_coords = set((t.row_label, t.col_number) for t in booked_tickets)

        # Delete all unbooked tickets for this day
        db.query(ETicket).filter(
            ETicket.event_day_id == day.event_day_id,
            ETicket.booking_id == None
        ).delete(synchronize_session=False)
        db.commit()

        # Generate new tickets for this day
        new_tickets = []
        for index, seat in enumerate(seats_layout):
            row = seat['row_label']
            col = seat['col_number']
            stype = seat['seat_type']

            # If the seat coordinates are already booked, skip creating it (keep the booked one)
            if (row, col) in booked_coords:
                continue

            config_id = config_map[stype.lower()]
            status = "Reserved" if stype.lower() == "vip" else "Available"
            ticket_code = f"TKT-{day.event_day_id}-{row}{col}-{index}"

            ticket = ETicket(
                ticket_config_id=config_id,
                event_day_id=day.event_day_id,
                booking_id=None,
                ticket_code=ticket_code,
                ticket_status=status,
                row_label=row,
                col_number=col
            )
            new_tickets.append(ticket)
            total_generated += 1

        if new_tickets:
            create_tickets_batch(db, new_tickets)

    return {
        "message": "Seat layout saved and physical tickets pre-generated successfully.",
        "days_processed": len(event_days),
        "total_seats_designed": total_designed_seats,
        "physical_tickets_created": total_generated
    }
