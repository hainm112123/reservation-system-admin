import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.e_ticket import SeatLayoutSave
from app.models.event_schedule import EventSchedule
from app.services.seat_layout_service import save_seat_layout_and_pregenerate

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/schedules/{schedule_id}/seats")
def get_seat_layout(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(EventSchedule).filter(EventSchedule.schedule_id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Event schedule not found")

    # If seat layout exists, parse it, otherwise return an empty layout list
    layout = []
    if schedule.seat_layout:
        try:
            layout = json.loads(schedule.seat_layout)
        except Exception:
            layout = []

    return {"schedule_id": schedule_id, "seats": layout}


@router.post("/schedules/{schedule_id}/seats")
def save_seat_layout(schedule_id: int, layout: SeatLayoutSave, db: Session = Depends(get_db)):
    # Raw representation
    seats_list = [s.model_dump() for s in layout.seats]
    res = save_seat_layout_and_pregenerate(db, schedule_id, seats_list)
    return res
