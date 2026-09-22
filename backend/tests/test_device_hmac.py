import pytest
from unittest.mock import MagicMock
from backend.app.services.crypto import (
    generate_hmac_signature, verify_hmac_signature, compute_payload_string,
    verify_device_credentials, generate_ulid
)

def test_device_hmac_signature_generation_and_validation():
    secret = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
    event_dict = {
        "id": generate_ulid(),
        "dev": "BMTC-1042",
        "t": 1789900000,
        "lat": 12.9716,
        "lon": 77.5946,
        "cls": "D40"
    }
    payload_str = compute_payload_string(event_dict)
    sig = generate_hmac_signature(payload_str, secret)
    event_dict["sig"] = sig

    assert verify_hmac_signature(event_dict, secret) is True

def test_device_hmac_tamper_rejection():
    secret = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
    event_dict = {
        "id": generate_ulid(),
        "dev": "BMTC-1042",
        "t": 1789900000,
        "lat": 12.9716,
        "lon": 77.5946,
        "cls": "D40"
    }
    payload_str = compute_payload_string(event_dict)
    event_dict["sig"] = generate_hmac_signature(payload_str, secret)

    # Tamper with defect classification
    event_dict["cls"] = "rebar_defect_tampered"
    assert verify_hmac_signature(event_dict, secret) is False

def test_device_key_rotation_grace_period():
    old_secret = "old_secret_key_0123456789abcdef0123456789abcdef0123456789abcdef"
    new_secret = "new_secret_key_fedcba9876543210fedcba9876543210fedcba9876543210"

    # Mock device in rotation window
    mock_device = MagicMock()
    mock_device.id = "BMTC-KA-01-F-9412"
    mock_device.status = "active"
    mock_device.key_id = "KID-2026-Q3"
    mock_device.hmac_secret = new_secret
    mock_device.previous_key_id = "KID-2026-Q2"
    mock_device.previous_hmac_secret = old_secret

    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_device

    # Payload signed with previous key KID-2026-Q2
    event_dict = {
        "dev": "BMTC-KA-01-F-9412",
        "kid": "KID-2026-Q2",
        "t": 1789900000,
        "lat": 12.9716,
        "lon": 77.5946,
        "cls": "D40"
    }
    payload_str = compute_payload_string(event_dict)
    event_dict["sig"] = generate_hmac_signature(payload_str, old_secret)

    valid, msg, dev = verify_device_credentials(event_dict, mock_db)
    assert valid is True
    assert msg == "Verified"
