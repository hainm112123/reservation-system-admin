from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.venue import VenueCreate, VenueUpdate, VenueRead
from app.crud import venue as crud_venue

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("", response_model=List[VenueRead])
def list_venues(db: Session = Depends(get_db)):
    return crud_venue.get_venues(db)


@router.get("/{venue_id}", response_model=VenueRead)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    venue = crud_venue.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@router.post("", response_model=VenueRead)
def add_venue(venue: VenueCreate, db: Session = Depends(get_db)):
    return crud_venue.create_venue(db, venue)


@router.put("/{venue_id}", response_model=VenueRead)
def edit_venue(venue_id: int, venue_in: VenueUpdate, db: Session = Depends(get_db)):
    venue = crud_venue.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return crud_venue.update_venue(db, venue, venue_in)


@router.delete("/{venue_id}")
def delete_venue_endpoint(venue_id: int, db: Session = Depends(get_db)):
    venue = crud_venue.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    crud_venue.delete_venue(db, venue)
    return {"message": "Venue deleted successfully."}
