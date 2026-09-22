with open("backend/app/routers/auth.py", "w", encoding="utf-8") as f:
    f.write('''from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, List
from backend.app.services.auth import (
    PILOT_USERS, verify_password, create_access_token, get_current_user,
    Role, UserRecord
)
from backend.app.config import settings

router = APIRouter(prefix="/v1/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class SwitchRoleRequest(BaseModel):
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    email: str
    full_name: str

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username.strip().lower()
    user = PILOT_USERS.get(email)
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account deactivated")
    
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"]
    })
    return TokenResponse(
        access_token=token,
        role=user["role"],
        user_id=user["id"],
        email=user["email"],
        full_name=user["full_name"]
    )

@router.post("/login", response_model=TokenResponse)
def login_json(payload: LoginRequest):
    email = payload.username.strip().lower()
    user = PILOT_USERS.get(email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"]
    })
    return TokenResponse(
        access_token=token,
        role=user["role"],
        user_id=user["id"],
        email=user["email"],
        full_name=user["full_name"]
    )

@router.get("/me", response_model=UserRecord)
def get_authenticated_user(current_user: UserRecord = Depends(get_current_user)):
    return current_user

@router.post("/switch-role", response_model=TokenResponse)
def switch_pilot_role(payload: SwitchRoleRequest, current_user: UserRecord = Depends(get_current_user)):
    """
    Pilot development role switcher: allows rapid emulation of different municipal roles.
    """
    if payload.role not in Role.ALL_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {Role.ALL_ROLES}")
    
    # Generate token with requested role
    token = create_access_token({
        "sub": current_user.id,
        "email": current_user.email,
        "role": payload.role
    })
    return TokenResponse(
        access_token=token,
        role=payload.role,
        user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name
    )

@router.get("/roles")
def get_available_roles():
    return {
        "roles": Role.ALL_ROLES,
        "pilot_accounts": [
            {"email": u["email"], "role": u["role"], "full_name": u["full_name"]}
            for u in PILOT_USERS.values()
        ]
    }
''')
print("Successfully generated backend/app/routers/auth.py")
