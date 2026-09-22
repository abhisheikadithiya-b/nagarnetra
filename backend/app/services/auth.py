import os
import time
import hashlib
import hmac
import secrets
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from backend.app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token", auto_error=False)

class Role:
    ADMIN = "Admin"
    TRANSPORT_PLANNER = "Transport Planner"
    ROAD_AUTHORITY = "Road Authority"
    INCIDENT_OFFICER = "Incident Officer"
    VIEWER = "Viewer"

    ALL_ROLES = [ADMIN, TRANSPORT_PLANNER, ROAD_AUTHORITY, INCIDENT_OFFICER, VIEWER]

ROLE_HIERARCHY = {
    Role.ADMIN: 5,
    Role.ROAD_AUTHORITY: 4,
    Role.INCIDENT_OFFICER: 3,
    Role.TRANSPORT_PLANNER: 2,
    Role.VIEWER: 1,
}

def has_sufficient_role(user_role: str, required_role: str) -> bool:
    if user_role == Role.ADMIN:
        return True
    if user_role == required_role:
        return True
    return ROLE_HIERARCHY.get(user_role, 0) >= ROLE_HIERARCHY.get(required_role, 0)

class TokenData(BaseModel):
    sub: str
    email: str
    role: str
    exp: int

class UserRecord(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool = True

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    if salt is None:
        salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + dk.hex()

def verify_password(plain_password: str, hashed_str: str) -> bool:
    try:
        salt_hex, dk_hex = hashed_str.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected_dk = bytes.fromhex(dk_hex)
        actual_dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(actual_dk, expected_dk)
    except Exception:
        return False

PILOT_USERS = {
    "admin@gcc.tn.gov.in": {
        "id": "USR-ADMIN-01",
        "email": "admin@gcc.tn.gov.in",
        "full_name": "Dr. Priya Nair (GCC Principal Director)",
        "role": Role.ADMIN,
        "password_hash": hash_password("AdminPassword2026!"),
        "is_active": True
    },
    "admin@nagarnetra.gov.in": {
        "id": "USR-ADMIN-MASTER",
        "email": "admin@nagarnetra.gov.in",
        "full_name": "NagarNetra System Administrator",
        "role": Role.ADMIN,
        "password_hash": hash_password("AdminPassword2026!"),
        "is_active": True
    },
    "officer@mtcbus.tn.gov.in": {
        "id": "USR-OFFICER-02",
        "email": "officer@mtcbus.tn.gov.in",
        "full_name": "Inspector S. Ramanathan (MTC Command Ops)",
        "role": Role.INCIDENT_OFFICER,
        "password_hash": hash_password("OfficerPassword2026!"),
        "is_active": True
    },
    "planner@cumta.tn.gov.in": {
        "id": "USR-PLANNER-03",
        "email": "planner@cumta.tn.gov.in",
        "full_name": "K. Sundaram (CUMTA Chief Mobility Planner)",
        "role": Role.TRANSPORT_PLANNER,
        "password_hash": hash_password("PlannerPassword2026!"),
        "is_active": True
    },
    "contractor@chennaicorporation.gov.in": {
        "id": "USR-INFRA-04",
        "email": "contractor@chennaicorporation.gov.in",
        "full_name": "GCC Road Infrastructure Directorate",
        "role": Role.ROAD_AUTHORITY,
        "password_hash": hash_password("AuthorityPassword2026!"),
        "is_active": True
    },
    "viewer@tn.gov.in": {
        "id": "USR-VIEWER-05",
        "email": "viewer@tn.gov.in",
        "full_name": "Civic Observer (Auditor Read-Only)",
        "role": Role.VIEWER,
        "password_hash": hash_password("ViewerPassword2026!"),
        "is_active": True
    }
}

def create_access_token(data: Optional[dict] = None, expires_delta: Optional[timedelta] = None, **kwargs) -> str:
    to_encode = {}
    if data:
        to_encode.update(data)
    if "subject" in kwargs:
        to_encode["sub"] = kwargs["subject"]
    if "role" in kwargs:
        to_encode["role"] = kwargs["role"]
    if "user_id" in kwargs:
        to_encode["uid"] = kwargs["user_id"]
    for k, v in kwargs.items():
        if k not in ("subject", "role", "user_id"):
            to_encode[k] = v

    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(now.timestamp())})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        sub = payload.get("sub")
        email = payload.get("email", sub)
        role = payload.get("role", Role.VIEWER)
        exp = payload.get("exp", 0)
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: missing subject claim",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return TokenData(sub=sub, email=email, role=role, exp=exp)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid cryptographic credentials or signature",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> UserRecord:
    if not token:
        if settings.ENVIRONMENT == "development":
            admin = PILOT_USERS["admin@nagarnetra.gov.in"]
            return UserRecord(
                id=admin["id"],
                email=admin["email"],
                full_name=admin["full_name"],
                role=admin["role"],
                is_active=admin["is_active"]
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: Bearer token required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token_data = decode_access_token(token)
    user_info = PILOT_USERS.get(token_data.email)
    if not user_info:
        return UserRecord(
            id=token_data.sub,
            email=token_data.email,
            full_name=token_data.email.split("@")[0].replace(".", " ").title(),
            role=token_data.role,
            is_active=True
        )
    return UserRecord(
        id=user_info["id"],
        email=user_info["email"],
        full_name=user_info["full_name"],
        role=token_data.role,
        is_active=user_info["is_active"]
    )

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: UserRecord = Depends(get_current_user)) -> UserRecord:
        if current_user.role == Role.ADMIN:
            return current_user
        if current_user.role not in allowed_roles:
            role_names = ", ".join(allowed_roles)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' lacks required permissions [{role_names}]"
            )
        return current_user
    return role_checker
