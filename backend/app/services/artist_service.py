from sqlalchemy.orm import Session
from typing import Tuple
from app.models.event_artist import EventArtist


def validate_backup_count(db: Session, event_day_id: int) -> Tuple[bool, str]:
    """Ensures at least 2 backup artists are assigned to the event day."""
    count = db.query(EventArtist).filter(
        EventArtist.event_day_id == event_day_id,
        EventArtist.is_backup == True
    ).count()
    
    if count < 2:
        return False, f"Not enough backup artists. Found {count}, requires at least 2."
    return True, ""
