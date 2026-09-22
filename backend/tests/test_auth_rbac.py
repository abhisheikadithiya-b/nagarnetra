import pytest
from backend.app.services.auth import (
    hash_password, verify_password, create_access_token, decode_access_token,
    Role, ROLE_HIERARCHY, has_sufficient_role
)

def test_password_hashing_and_verification():
    secret = "BangalorePilot2026!"
    hashed = hash_password(secret)
    assert hashed != secret
    assert verify_password(secret, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_issuance_and_decoding():
    token = create_access_token(
        subject="officer@nagarnetra.gov.in",
        role=Role.INCIDENT_OFFICER,
        user_id="user_officer_01"
    )
    assert token is not None
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.sub == "officer@nagarnetra.gov.in"
    assert payload.role == Role.INCIDENT_OFFICER
    assert payload.email == "officer@nagarnetra.gov.in"

def test_rbac_role_hierarchy():
    # Admin has all permissions
    assert has_sufficient_role(Role.ADMIN, Role.VIEWER) is True
    assert has_sufficient_role(Role.ADMIN, Role.ROAD_AUTHORITY) is True
    assert has_sufficient_role(Role.ADMIN, Role.ADMIN) is True

    # Road Authority has Road Authority and Viewer clearance
    assert has_sufficient_role(Role.ROAD_AUTHORITY, Role.VIEWER) is True
    assert has_sufficient_role(Role.ROAD_AUTHORITY, Role.ROAD_AUTHORITY) is True
    assert has_sufficient_role(Role.ROAD_AUTHORITY, Role.ADMIN) is False

    # Viewer has only Viewer clearance
    assert has_sufficient_role(Role.VIEWER, Role.VIEWER) is True
    assert has_sufficient_role(Role.VIEWER, Role.INCIDENT_OFFICER) is False
