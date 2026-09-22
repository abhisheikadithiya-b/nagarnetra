import pytest
from backend.app.services.crypto import (
    generate_ulid, compute_payload_string, generate_hmac_signature, verify_hmac_signature, compute_merkle_root
)

def test_ulid_generation():
    uid = generate_ulid()
    assert isinstance(uid, str)
    assert len(uid) == 26

def test_hmac_verification_valid():
    secret = "test-secret-key-123"
    event_dict = {
        "id": generate_ulid(),
        "dev": "BUS-1042",
        "t": 1789900000,
        "lat": 12.9752,
        "lon": 77.6094,
        "cls": "D40",
        "conf": 0.88,
        "imu_z": 1.2
    }
    payload_str = compute_payload_string(event_dict)
    sig = generate_hmac_signature(payload_str, secret)
    event_dict["sig"] = sig

    assert verify_hmac_signature(event_dict, secret) is True

def test_hmac_verification_rejects_tampering():
    secret = "test-secret-key-123"
    event_dict = {
        "id": generate_ulid(),
        "dev": "BUS-1042",
        "t": 1789900000,
        "lat": 12.9752,
        "lon": 77.6094,
        "cls": "D40",
        "conf": 0.88
    }
    payload_str = compute_payload_string(event_dict)
    event_dict["sig"] = generate_hmac_signature(payload_str, secret)

    # Tamper with coordinate
    event_dict["lat"] = 12.9799
    assert verify_hmac_signature(event_dict, secret) is False

def test_merkle_root_computation():
    hashes = ["hash1", "hash2", "hash3", "hash4"]
    root = compute_merkle_root(hashes)
    assert isinstance(root, str)
    assert len(root) == 64
