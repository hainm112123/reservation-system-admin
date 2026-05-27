import random
from sqlalchemy.orm import Session
from app.models.booking import Booking

def process_pending_refunds(db: Session) -> int:
    bookings = db.query(Booking).filter(Booking.payment_status == "Refunding").all()
    if not bookings:
        return 0

    failed_booking = None
    if len(bookings) > 1:
        failed_booking = random.choice(bookings)

    for booking in bookings:
        if failed_booking and booking.booking_id == failed_booking.booking_id:
            booking.payment_status = "RefundFailed"
        else:
            booking.payment_status = "Refunded"

    db.commit()
    return len(bookings)
