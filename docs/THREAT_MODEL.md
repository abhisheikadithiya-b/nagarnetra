# NagarNetra STRIDE Threat Model & Defense Architecture

## 1. Threat Matrix

| Threat Category | Potential Attack Vector | NagarNetra Defense Implementation |
| :--- | :--- | :--- |
| **Spoofing Identity** | Adversary injects fake defect reports pretending to be BMTC bus | Per-device HMAC-SHA256 signatures with secret key registered in secure device table. Unregistered device IDs dropped. |
| **Tampering with Data** | Attacker modifies GPS coordinates or defect severity en-route | Cryptographic Merkle tree hash and HMAC verification over entire payload (bus_id + timestamp + coordinates + class). Any bit flip fails signature validation. |
| **Repudiation** | Road contractor denies work order or claims pothole was repaired | Multi-bus consensus auto-verification: 6 independent clean passes with vertical accelerometer shock < 0.25G required to close work orders. Append-only `audit_logs` record all actions. |
| **Information Disclosure** | Interception of commuter faces or private license plates | DPDP Act 2023 compliant on-device pixelation in RAM prior to network serialization. Transport Layer Security (TLS 1.3) on all MQTT/HTTPS channels. |
| **Denial of Service** | Flooding ingestion endpoint with millions of bogus events | IP-level rate limiting (120 req/min), maximum request payload cap (1 MB), and ULID duplicate rejection cache. |
| **Elevation of Privilege** | Road contractor attempts to approve emergency police enforcement notice | Role-Based Access Control (RBAC) with 5 distinct role tiers enforced via cryptographically signed JWT tokens and FastAPI security dependencies. |

---

## 2. Geofence & Impossible Teleportation Defenses
Attacks attempting to fabricate defects across geographic regions are blocked by two physical sanity checks:
1. **BBMP Municipal Geofence**: All coordinates must reside within Greater Bengaluru bounds (Latitude: 12.75°N to 13.15°N, Longitude: 77.40°E to 77.80°E).
2. **Kinematic Velocity Guard**: Telemetry reports calculating an implied transit velocity exceeding 130 km/h between consecutive sightings are quarantined as GPS spoofing anomalies.
