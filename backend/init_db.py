from app.db.base import Base
from app.core.database import engine

# Import all models to register them with Base
from app.models.artist import *
from app.models.booking import *
from app.models.e_ticket import *
from app.models.event import *
from app.models.event_artist import *
from app.models.event_day import *
from app.models.event_schedule import *
from app.models.ticket_config import *
from app.models.venue import *

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully using SQLAlchemy!")

if __name__ == "__main__":
    init_db()
