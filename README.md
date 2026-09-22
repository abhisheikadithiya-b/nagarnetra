# NagarNetra • Bus-Fleet Urban Intelligence Platform

> **Fleet Intelligence Fusion**: Turning public buses into mobile edge-AI perception sensors. Small verified events; centralized spatial deduplication; explainable multi-factor risk ranking; and automated closed-loop repair verification without human field inspectors.

---

## 1. Key Architectural Pillars

- **Edge Perception & Privacy by Design**:
  - Operates on driver smartphones / on-board units as a PWA using camera, GPS, and 3-axis IMU.
  - **DPDP Act 2023 Compliant**: Real-time bystander and face anonymization executed in RAM before writing to the ring buffer or uplinking.
  - Event-only uplink (~250 bytes JSON with HMAC-SHA256 signature) + 15 KB blurred snapshot. Raw video never leaves the bus unless explicitly requested via authenticated audit.
- **Central Hub (ICCC)**:
  - High-throughput FastAPI ingest with HMAC verification, replay drop (idempotent ULID), and GPS plausibility checks.
  - OSM road-edge snapping with Shapely STRtree.
  - Spatial deduplication: DBSCAN clustering with Haversine metric ($\varepsilon \approx 8\text{m}$, 48h rolling window) and confidence-weighted centroid.
  - Multi-bus Evidence Confidence via Noisy-OR formulation: $C = 1 - \prod (1 - w \cdot \text{conf})$.
- **Explainable 4-Factor Risk Priority ($P = S \times E \times V \times A$)**:
  - **Severity ($S$, 1–5)**: Class weight $\times$ optical confidence $\times$ size factor.
  - **Exposure ($E$, 0.5–2.0)**: Bus passes & traffic density on the corridor.
  - **Vulnerability ($V$, 1.0–2.5)**: Proximity to hospitals, schools, and vulnerable pedestrian mix.
  - **Age ($A$, $\ge 1.0$)**: $1 + (\text{days open} / \text{SLA days})$ — overdue tickets escalate automatically.
- **Closed-Loop Auto-Verification by Clean Passes**:
  - Replaces manual road inspectors: when a contractor marks a work order as `Fixed`, the platform tracks subsequent equipped bus passes.
  - When $>6$ consecutive passes with active cameras register smooth surface ($z\text{-axis shock} < 0.25G$) and zero re-detections, the ticket is **Auto-Verified & Closed**.
  - If a vibration spike or defect is observed ($z \ge 0.40G$), the ticket is **Reopened** automatically.
- **Tamper-Proof Chain of Custody**:
  - Cryptographic WORM audit tracking across 4 sequential stages (Edge Ingestion, Neural Inference, Civic 5G MQTT Broadcast, Merkle Root Fusion).
  - High-speed plate OCR with Indian state format validation and multi-frame voting.
- **Dual-Theme Design System**:
  - **Paper-and-Ink Cartography** (Light): `#FAF8F5` cream background, dark ink typography, brick-red critical indicators, teal verified badges, and serif headings.
  - **Control Room Mode** (Dark): `#0B0F17` deep slate-navy, tactical glows, high-contrast cartography, and ambient status lighting.

---

## 2. System Architecture

```
                                  EDGE ON-BUS PERCEPTION (PWA)
  [Front Cam 60 FPS] ──► [Face/PII Blur in RAM] ──► [YOLOv8 INT8 Detectors]
  [GPS / RTK Receiver] ───────────────────────────► [ByteTrack Multi-Object Tracker]
  [3-Axis IMU (Vibration)] ───────────────────────► [Debounce Logic (>=3 hits / IMU jerk)]
                                                           │
                                                           ▼
                                               [HMAC-SHA256 Signer & Buffer]
                                                           │
                                        ~250 B JSON Event  │  MQTT / TLS or HTTPS
                                                           ▼
                             CENTRAL HUB INGEST & SPATIAL FUSION (FastAPI)
  [HMAC Signature Verify & Replay Drop] ◄──────────────────┘
            │
            ▼
  [OSM Edge Snapping (Shapely STRtree)]
            │
            ▼
  [DBSCAN Clustering (eps=8m, Haversine, 48h)] ──► [Noisy-OR Multi-Bus Fusion]
            │
            ▼
  [Explainable Priority Engine (P = S x E x V x A)]
            │
            ▼
  [Closed-Loop Clean Pass Engine] ──► [Work Order Lifecycle & PDF Export]
            │
            ▼
  [WebSocket & REST APIs] ──► [8 Interactive Dashboards & Mobile PWA]
```

---

## 3. Frontend Pages & Screen Layout

1. **Live Command Center** (`/`): Real-time cartographic map, moving bus telemetry, pulsing incident pins with priority scores, layer toggles (Defects, Hazards, Bus Mesh), time machine, priority queue, and instant QRU hazard squad dispatch.
2. **Safety Alerts & Evidence** (`/safety-alerts`): Forensic video player with scrubber, speed badges, PII blur mask, tamper-proof chain of custody (WORM storage), high-speed yellow Indian plate OCR card (`KA 03 MG 8842`), and transit triangulation.
3. **Civic Infrastructure Work Orders** (`/work-orders`): 4-column Kanban (`Open/Unassigned`, `Assigned/In Progress`, `Fixed/Pending Verif.`, `Verified & Closed`), SLA breach countdowns, contractor squad tracking, clean pass corroboration progress (Passes: 4/6), and auto-verified badges.
4. **Transit Sensor Mesh & Route Operations** (`/fleet-ops`): Active corridors (500-D, 335-E, 201-R, KIA-8), route fidelity detours (Tin Factory flood), delay-by-hour progression curve (+32m peak), active vision buses, and ping diagnostics.
5. **Analytics & GIS Audit** (`/analytics`): Congestion index (15-min bins), recurring bottlenecks list, and origin-destination desire lines.
6. **Edge Nodes Health** (`/edge-nodes`): Per-device FPS, inference latency, temperature, battery %, buffer queue depth, and bytes uploaded.
7. **Assistant + Analytics** (`/assistant`): Tool-calling AI copilot with "Show Evidence" feature citing exact tool called, time window, row counts, and deep links.
8. **Dashcam PWA** (`/pwa` & `/pwa/live`): Mobile onboarding & pairing HUD lock, bus ID link, sensor permissions grant, and live windshield HUD mode with live defect bounding, audio tone chime, and emergency report buttons.

---

## 4. Quickstart Guide (1-Click Offline Execution)

### Windows 1-Click Launch:
Double-click `start_local.bat` or run:
```powershell
.\run_local.ps1
```

### Manual Offline Launch:
1. **Start Backend**:
   ```bash
   python -m backend.app.main
   ```
   *Swagger Docs available at: `http://localhost:8000/docs`*

2. **Start Web Dashboard & PWA**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Dashboard available at: `http://localhost:3000`*
   *Mobile PWA available at: `http://localhost:3000/pwa`*

### Docker Deployment:
```bash
# Production Profile (PostgreSQL + PostGIS, Redis, API, Next.js)
docker compose --profile prod up -d

# Standalone Demo Profile (SQLite + Next.js)
docker compose --profile demo up -d

# Run CI Test Container
docker compose --profile test run api pytest backend/tests
```

---

## 5. Security, RBAC & Observability

### Pilot Seed Credentials (JWT Authentication)
All endpoints enforce Role-Based Access Control (RBAC) across 5 municipal clearance tiers:
| Email | Clearance Role | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| `admin@nagarnetra.gov.in` | **Admin** | `AdminPassword2026!` | Superuser, device registration, key rotation |
| `officer@bmtc.gov.in` | **Incident Officer** | `OfficerPassword2026!` | Incident triage, QRU dispatch, police referral |
| `planner@bbmp.gov.in` | **Transport Planner** | `PlannerPassword2026!` | Corridor analysis, OD matrix, simulation triggers |
| `contractor@infra.gov.in` | **Road Authority** | `AuthorityPassword2026!` | Work order status update, contractor squad dispatch |
| `viewer@public.gov.in` | **Viewer** | `ViewerPassword2026!` | Read-only audit access, citizen transparency view |

### Observability & Probes
- **Liveness Probe**: `GET /healthz` (returns service status and database state)
- **Readiness Probe**: `GET /readyz` (verifies active database pool connectivity)
- **Prometheus Metrics**: `GET /metrics` (scraped by municipal monitoring clusters)
- **Security Headers**: Strict `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and payload limits (1 MB).

---

## 6. Database Migrations (Alembic)
Schema changes are managed via Alembic for both local SQLite development and PostgreSQL/PostGIS production environments:
```bash
python -m alembic current          # Inspect active schema revision
python -m alembic upgrade head     # Migrate database to latest revision
python -m alembic downgrade -1     # Rollback single migration step
```

---

## 7. Automated Test Suite & Load Testing
```bash
# Run complete 19-test suite (RBAC, HMAC, DBSCAN, Priority, Verification, Observability)
python -m pytest backend/tests/ -v

# Run 100-request concurrent load test simulating 50 bus nodes
python scripts/load_test.py
```
