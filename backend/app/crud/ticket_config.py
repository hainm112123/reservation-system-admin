from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.ticket_config import TicketConfig
from app.schemas.ticket_config import TicketConfigCreate, TicketConfigUpdate


def create_ticket_config(db: Session, obj_in: TicketConfigCreate) -> TicketConfig:
    # Check if a config with this ticket_type already exists for the schedule
    existing = db.query(TicketConfig).filter(
        TicketConfig.schedule_id == obj_in.schedule_id,
        TicketConfig.ticket_type == obj_in.ticket_type
    ).first()
    if existing:
        existing.price = obj_in.price
        existing.max_quantity = obj_in.max_quantity
        db.commit()
        db.refresh(existing)
        return existing

    db_obj = TicketConfig(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_ticket_config(db: Session, config_id: int) -> Optional[TicketConfig]:
    return db.query(TicketConfig).filter(TicketConfig.config_id == config_id).first()


def get_ticket_configs_by_schedule(db: Session, schedule_id: int) -> List[TicketConfig]:
    return db.query(TicketConfig).filter(TicketConfig.schedule_id == schedule_id).all()


def update_ticket_config(db: Session, db_obj: TicketConfig, obj_in: TicketConfigUpdate) -> TicketConfig:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_total_configured_quantity_for_schedule(db: Session, schedule_id: int) -> int:
    total = db.query(func.sum(TicketConfig.max_quantity)).filter(TicketConfig.schedule_id == schedule_id).scalar()
    return total or 0


def delete_ticket_config(db: Session, db_obj: TicketConfig) -> bool:
    db.delete(db_obj)
    db.commit()
    return True
