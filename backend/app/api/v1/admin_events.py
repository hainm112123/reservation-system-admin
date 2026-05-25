from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.event import EventCreate, EventUpdate, EventRead, EventListItem
from app.schemas.schedule import EventScheduleCreate, EventScheduleUpdate, EventScheduleRead, EventDayCreate, EventDayUpdate, EventDayRead
from app.schemas.ticket_config import TicketConfigCreate, TicketConfigUpdate, TicketConfigRead
from app.crud import event as crud_event
from app.crud import event_schedule as crud_schedule
from app.crud import event_day as crud_day
from app.crud import ticket_config as crud_ticket_config
from app.services.admin_event_service import validate_schedule_capacity, cancel_event as service_cancel

router = APIRouter(dependencies=[Depends(get_current_admin)])


# -- Events CRUD --

@router.get("", response_model=List[EventListItem])
def list_events(db: Session = Depends(get_db)):
    return crud_event.get_events(db)


@router.post("", response_model=EventRead)
def add_event(event: EventCreate, db: Session = Depends(get_db)):
    return crud_event.create_event(db, event)


@router.get("/schedules", response_model=List[EventScheduleRead])
def list_schedules(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    if event_id:
        return crud_schedule.get_schedules_by_event(db, event_id)
    return crud_schedule.get_schedules(db)


@router.get("/schedules/{schedule_id}", response_model=EventScheduleRead)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = crud_schedule.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.post("/schedules", response_model=EventScheduleRead)
def add_schedule(schedule: EventScheduleCreate, db: Session = Depends(get_db)):
    return crud_schedule.create_schedule(db, schedule)


@router.put("/schedules/{schedule_id}", response_model=EventScheduleRead)
def edit_schedule(schedule_id: int, schedule_in: EventScheduleUpdate, db: Session = Depends(get_db)):
    schedule = crud_schedule.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return crud_schedule.update_schedule(db, schedule, schedule_in)


@router.delete("/schedules/{schedule_id}")
def delete_schedule_endpoint(schedule_id: int, db: Session = Depends(get_db)):
    schedule = crud_schedule.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    crud_schedule.delete_schedule(db, schedule)
    return {"message": "Schedule deleted successfully."}


# -- Event Days CRUD --

@router.get("/days", response_model=List[EventDayRead])
def list_event_days(schedule_id: Optional[int] = None, db: Session = Depends(get_db)):
    if schedule_id:
        return crud_day.get_event_days_by_schedule(db, schedule_id)
    raise HTTPException(status_code=400, detail="schedule_id query parameter is required.")


@router.post("/days", response_model=EventDayRead)
def add_event_day(day: EventDayCreate, db: Session = Depends(get_db)):
    return crud_day.create_event_day(db, day)


@router.put("/days/{day_id}", response_model=EventDayRead)
def edit_event_day(day_id: int, day_in: EventDayUpdate, db: Session = Depends(get_db)):
    day = crud_day.get_event_day(db, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Event day not found")
    return crud_day.update_event_day(db, day, day_in)


@router.delete("/days/{day_id}")
def delete_event_day_endpoint(day_id: int, db: Session = Depends(get_db)):
    day = crud_day.get_event_day(db, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Event day not found")
    crud_day.delete_event_day(db, day)
    return {"message": "Event day deleted successfully."}


# -- Ticket Configs CRUD --

@router.get("/ticket-configs", response_model=List[TicketConfigRead])
def list_ticket_configs(schedule_id: int, db: Session = Depends(get_db)):
    return crud_ticket_config.get_ticket_configs_by_schedule(db, schedule_id)


@router.post("/ticket-configs", response_model=TicketConfigRead)
def add_ticket_config(config: TicketConfigCreate, db: Session = Depends(get_db)):
    sched = crud_schedule.get_schedule(db, config.schedule_id)
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    # Validate capacity limits
    ok, err = validate_schedule_capacity(db, config.schedule_id, sched.venue_id, config.max_quantity)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
        
    return crud_ticket_config.create_ticket_config(db, config)


@router.delete("/ticket-configs/{config_id}")
def delete_ticket_config_endpoint(config_id: int, db: Session = Depends(get_db)):
    config = crud_ticket_config.get_ticket_config(db, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Ticket config not found")
    crud_ticket_config.delete_ticket_config(db, config)
    return {"message": "Ticket config deleted successfully."}


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud_event.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventRead)
def edit_event(event_id: int, event_in: EventUpdate, db: Session = Depends(get_db)):
    event = crud_event.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return crud_event.update_event(db, event, event_in)


@router.post("/{event_id}/cancel")
def cancel_event_endpoint(event_id: int, reason: str = "Event cancelled by company", db: Session = Depends(get_db)):
    success = service_cancel(db, event_id, reason)
    if not success:
        raise HTTPException(status_code=400, detail="Could not cancel event")
    return {"message": "Event cancelled. Refunds triggered successfully."}
