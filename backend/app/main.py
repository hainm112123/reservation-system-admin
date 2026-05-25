from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import Routers
from app.api.v1.admin_auth import router as admin_auth_router
from app.api.v1.admin_events import router as admin_events_router
from app.api.v1.admin_venues import router as admin_venues_router
from app.api.v1.admin_artists import router as admin_artists_router
from app.api.v1.admin_bookings import router as admin_bookings_router
from app.api.v1.admin_seats import router as admin_seats_router

app = FastAPI(
    title=settings.app_name,
    description="Backend API for Event Booking Admin Platform",
    version="1.0.0",
)

# CORS configurations
origins = [
    settings.frontend_url,
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Admin Routers
app.include_router(admin_auth_router, prefix="/api/v1/admin", tags=["Admin Auth"])
app.include_router(admin_events_router, prefix="/api/v1/admin/events", tags=["Admin Events"])
app.include_router(admin_venues_router, prefix="/api/v1/admin/venues", tags=["Admin Venues"])
app.include_router(admin_artists_router, prefix="/api/v1/admin/artists", tags=["Admin Artists"])
app.include_router(admin_bookings_router, prefix="/api/v1/admin/bookings", tags=["Admin Bookings"])
app.include_router(admin_seats_router, prefix="/api/v1/admin", tags=["Admin Seats"])


@app.get("/health")
def health_check():
    return {"status": "ok", "app_name": settings.app_name}
