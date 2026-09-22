# NagarNetra Operations Runbook

## 1. Quick Start & Service Orchestration

### Local Development (Python + Next.js)
```bash
# Terminal 1: Backend
python -m uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Production Pilot (Docker Compose)
```bash
# Start Production Stack (PostgreSQL + PostGIS, Redis, API, Next.js)
docker compose --profile prod up -d

# Check service health
curl -f http://localhost:8000/healthz
curl -f http://localhost:8000/readyz
curl -f http://localhost:8000/metrics
```

---

## 2. Cryptographic Key Rotation Protocol
Devices rotate keys every 90 days. The backend supports seamless rotation with zero downtime:

1. **Register New Key**:
   Issue a PATCH to `/v1/devices/{device_id}`:
   ```json
   {
     "key_id": "KID-2026-Q3",
     "hmac_secret": "<NEW_64_CHAR_HEX_SECRET>",
     "previous_key_id": "KID-2026-Q2",
     "previous_hmac_secret": "<OLD_SECRET>"
   }
   ```
2. **Grace Period**:
   The backend automatically verifies payloads signed with either `key_id` or `previous_key_id` during the 7-day migration grace window.
3. **Decommission Old Key**:
   After the fleet firmware updates, clear `previous_key_id` and `previous_hmac_secret`.

---

## 3. Database Migrations (Alembic)
```bash
# Check current migration status
python -m alembic current

# Run pending migrations to head
python -m alembic upgrade head

# Rollback one migration step
python -m alembic downgrade -1

# Create new schema revision
python -m alembic revision --autogenerate -m "describe_change"
```

---

## 4. Disaster Recovery & Backup
- Daily PostgreSQL dumps are automated via `scripts/backup_db.sh`.
- To restore from backup:
  ```bash
  bash scripts/restore_db.sh /backups/nagarnetra_backup_YYYYMMDD.sql.gz
  ```
- Local SQLite backup:
  ```bash
  sqlite3 backend/nagarnetra.db ".backup 'backend/nagarnetra_backup.db'"
  ```

---

## 5. Triage Playbooks

### P1_CRITICAL Structural Alert (Rebar Exposed / Deep Crater)
1. Navigate to **Safety Alerts & Evidence** or filter Command Center by `P1_CRITICAL`.
2. Inspect authentic photographic evidence and 3.8x optical zoom crops.
3. Verify road edge location against Outer Ring Road bus lane corridor.
4. Click **Dispatch Emergency Work Order** (auto-assigns P1 SLA of 24h).
5. Notification broadcasts to L&T Civil Infrastructure Team B via automated webhook.

### Fleet Sensor Health & Teleportation Rejection
If a bus reports `impossible_speed > 130 km/h` or coordinates outside the Bangalore geofence (Lat: 12.75–13.15, Lon: 77.40–77.80):
1. Ingestion endpoint automatically rejects payload with HTTP 422.
2. Device is logged in `audit_logs` for GPS spoofing investigation.
3. Depot engineer checks phone mount vibration dampener and windshield GPS line of sight.
