with open("backend/app/services/crypto.py", "w", encoding="utf-8") as f:
    f.write('''import hmac
import hashlib
import json
import time
from typing import Optional, Tuple
import ulid
from backend.app.config import settings

def generate_ulid() -> str:
    return str(ulid.new())

def compute_payload_string(event_dict: dict) -> str:
    filtered = {k: v for k, v in event_dict.items() if k != "sig"}
    return json.dumps(filtered, sort_keys=True)

def generate_hmac_signature(payload_str: str, secret: str = settings.HMAC_SECRET_KEY) -> str:
    return hmac.new(secret.encode("utf-8"), payload_str.encode("utf-8"), hashlib.sha256).hexdigest()

def verify_hmac_signature(event_dict: dict, secret: Optional[str] = None) -> bool:
    if "sig" not in event_dict:
        return False
    received_sig = str(event_dict["sig"])
    if received_sig.startswith("hmac-sha256:"):
        received_sig = received_sig.split(":", 1)[1]
    
    payload_str = compute_payload_string(event_dict)
    active_secret = secret or settings.HMAC_SECRET_KEY
    expected_sig = generate_hmac_signature(payload_str, active_secret)
    return hmac.compare_digest(received_sig, expected_sig)

def verify_device_credentials(event_dict: dict, db_session) -> Tuple[bool, str, Optional[object]]:
    """
    Production per-device credential verification with Key ID (kid) and key rotation support.
    """
    dev_id = event_dict.get("dev")
    if not dev_id:
        return False, "Missing device identifier 'dev'", None

    from backend.app.models.schema import Device
    device = db_session.query(Device).filter(Device.id == dev_id).first()

    # In development, auto-register known dev IDs with fallback key if missing
    if not device and settings.ENVIRONMENT == "development":
        device = Device(
            id=dev_id,
            bus_id=dev_id,
            node_id=f"NODE-{dev_id}",
            key_id="KID-2026-PRIMARY",
            hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
            status="active"
        )
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

    if not device:
        return False, f"Device '{dev_id}' is not registered with NagarNetra Fleet Authority", None

    if device.status != "active":
        return False, f"Device '{dev_id}' status is '{device.status}' (decommissioned or suspended)", device

    # Check key ID rotation
    kid = event_dict.get("kid", "KID-2026-PRIMARY")
    target_secret = None

    if kid == device.key_id:
        target_secret = device.hmac_secret
    elif device.previous_key_id and kid == device.previous_key_id:
        target_secret = device.previous_hmac_secret
    elif settings.ENVIRONMENT == "development":
        target_secret = device.hmac_secret or settings.DEFAULT_HMAC_SECRET_KEY
    else:
        return False, f"Unknown or expired Key ID '{kid}' for device '{dev_id}'", device

    if not target_secret:
        return False, "No active secret key configured for device", device

    is_valid = verify_hmac_signature(event_dict, secret=target_secret)
    if not is_valid:
        return False, "Invalid cryptographic HMAC signature for provided payload and device key", device

    return True, "Verified", device

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def compute_merkle_root(hashes: list) -> str:
    if not hashes:
        return hashlib.sha256(b"empty").hexdigest()
    current = [h.encode("utf-8") for h in hashes]
    while len(current) > 1:
        next_level = []
        for i in range(0, len(current), 2):
            left = current[i]
            right = current[i + 1] if i + 1 < len(current) else left
            combined = hashlib.sha256(left + right).hexdigest().encode("utf-8")
            next_level.append(combined)
        current = next_level
    return current[0].decode("utf-8")
''')
print("Successfully generated backend/app/services/crypto.py")
