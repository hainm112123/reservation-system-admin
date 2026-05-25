from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.booking import BookingRead, BookingListItem
from app.schemas.refund import RefundRead
from app.crud import booking as crud_booking
from app.models.booking import Booking
from app.models.e_ticket import ETicket

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("", response_model=List[BookingListItem])
def list_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_booking.get_bookings(db, skip=skip, limit=limit)


@router.get("/{booking_id}", response_model=BookingRead)
def get_booking_details(booking_id: int, db: Session = Depends(get_db)):
    booking = crud_booking.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # We retrieve e_tickets directly attached to this booking
    tickets = db.query(ETicket).filter(ETicket.booking_id == booking_id).all()
    booking.e_tickets = tickets
    
    return booking


@router.post("/{booking_id}/manual-refund")
def trigger_manual_refund(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.payment_status = "Refunded"
    
    # Mark tickets as Canceled / Refunded
    tickets = db.query(ETicket).filter(ETicket.booking_id == booking_id).all()
    for ticket in tickets:
         ticket.ticket_status = "Canceled"

    db.commit()
    return {"message": "Manual refund processed successfully.", "booking_status": booking.booking_status}


# -- Refunds views --

@router.get("/refunds/all", response_model=List[RefundRead])
def list_refunds(db: Session = Depends(get_db)):
    """Summary of all refunding and refunded bookings since our database schema aggregates them in bookings."""
    bookings = db.query(Booking).filter(Booking.payment_status.in_(["Refunding", "Refunded"])).all()
    refunds = []
    for b in bookings:
        refunds.append({
            "refund_id": b.booking_id, # using booking_id as a dummy refund_id
            "booking_id": b.booking_id,
            "gateway_refund_id": f"REFUND-GATEWAY-{b.booking_id}",
            "amount": b.total_amount,
            "status": "SUCCESS" if b.payment_status == "Refunded" else "PENDING",
            "reason": "Event Cancelled",
            "is_manual": False,
            "created_at": b.created_at,
            "updated_at": b.created_at
        })
    return refunds
