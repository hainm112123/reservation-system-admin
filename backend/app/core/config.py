from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+pg8000://postgres:password@localhost:5432/event_booking"

    # JWT Auth (Admin)
    secret_key: str = "change-me-in-production-super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8 hours

    # Admin credentials
    admin_username: str = "admin"
    admin_password: str = "admin123"

    # SMTP Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "Admin Event Booking"

    # App
    app_name: str = "Admin Event Booking Platform"
    frontend_url: str = "http://localhost:5174"
    backend_url: str = "http://localhost:8000"

    # Reservation timeout (minutes)
    reservation_timeout_minutes: int = 15

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
