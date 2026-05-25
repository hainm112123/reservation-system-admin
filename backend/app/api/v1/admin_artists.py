from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.artist import ArtistCreate, ArtistUpdate, ArtistRead, EventArtistCreate, EventArtistRead
from app.crud import artist as crud_artist
from app.services.artist_service import validate_backup_count

router = APIRouter(dependencies=[Depends(get_current_admin)])


# -- Artist CRUD --

@router.get("", response_model=List[ArtistRead])
def list_artists(db: Session = Depends(get_db)):
    return crud_artist.get_artists(db)


@router.get("/{artist_id}", response_model=ArtistRead)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = crud_artist.get_artist(db, artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist


@router.post("", response_model=ArtistRead)
def add_artist(artist: ArtistCreate, db: Session = Depends(get_db)):
    return crud_artist.create_artist(db, artist)


@router.put("/{artist_id}", response_model=ArtistRead)
def edit_artist(artist_id: int, artist_in: ArtistUpdate, db: Session = Depends(get_db)):
    artist = crud_artist.get_artist(db, artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return crud_artist.update_artist(db, artist, artist_in)


@router.delete("/{artist_id}")
def delete_artist_endpoint(artist_id: int, db: Session = Depends(get_db)):
    artist = crud_artist.get_artist(db, artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    crud_artist.delete_artist(db, artist)
    return {"message": "Artist deleted successfully."}


# -- Day Assignments --

@router.get("/days/{event_day_id}", response_model=List[EventArtistRead])
def list_event_artists(event_day_id: int, db: Session = Depends(get_db)):
    return crud_artist.get_event_artists_by_day(db, event_day_id)


@router.post("/assign", response_model=EventArtistRead)
def assign_artist(obj_in: EventArtistCreate, db: Session = Depends(get_db)):
    # Check if artist exists
    artist = crud_artist.get_artist(db, obj_in.artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    assignment = crud_artist.assign_artist_to_event_day(db, obj_in)
    
    # Check current backup count
    ok, warning = validate_backup_count(db, obj_in.event_day_id)
    
    return assignment


@router.post("/unassign")
def unassign_artist(event_day_id: int, artist_id: int, db: Session = Depends(get_db)):
    success = crud_artist.remove_artist_assignment(db, event_day_id, artist_id)
    if not success:
        raise HTTPException(status_code=404, detail="Artist assignment not found")
        
    # Check current backup count
    ok, warning = validate_backup_count(db, event_day_id)
    
    return {"message": "Artist unassigned successfully.", "warning": warning if not ok else None}


@router.get("/days/{event_day_id}/validate-backups")
def check_backups(event_day_id: int, db: Session = Depends(get_db)):
    ok, warning = validate_backup_count(db, event_day_id)
    return {"valid": ok, "warning": warning if not ok else None}
