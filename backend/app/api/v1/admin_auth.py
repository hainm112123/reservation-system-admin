from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from app.schemas.admin_auth import Token
from app.services.admin_auth_service import verify_admin_credentials, create_access_token

router = APIRouter()


@router.post("/login", response_model=Token)
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """Login endpoint for Admin to get JWT token."""
    if not verify_admin_credentials(form_data.username, form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"username": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}
