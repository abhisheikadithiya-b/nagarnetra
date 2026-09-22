# NagarNetra Architecture & Technical Design

## 1. Executive Summary
NagarNetra transforms ordinary municipal transit buses (BMTC Volvo & electric fleets) into mobile AI perception sensors without proprietary hardware. Mounted smartphones running a Progressive Web App (PWA) process real-time windshield optics, GPS, and 50Hz 3-axis accelerometer telemetry.

Events are HMAC-SHA256 signed on-device, buffered in IndexedDB during cellular blackouts, and transmitted via MQTT/TLS (HTTPS fallback) to a central FastAPI hub. Sightings are snapped to OpenStreetMap road edges, spatio-temporally clustered using DBSCAN, ranked via a multi-factor risk formula, dispatched as SLA-tracked work orders, and automatically verified as fixed by subsequent bus passes.

---

## 2. End-to-End Data Pipeline

```
[BMTC Bus Windshield Mount]
  │
  ├─► Camera (60 FPS HDR) ──► On-Device Face & Plate Blurring (DPDP Act 2023)
  ├─► GPS Fix (±3m)
  └─► IMU 50Hz (Z-Jerk) ───► WebGPU / ONNX Edge Detection (D40 Pothole, Rebar)
                                │
                                ▼
                   HMAC-SHA256 Per-Device Signature
                                │
                                ▼
                 IndexedDB Store & Forward Queue
                                │
                                ▼ (MQTT / HTTPS Uplink)
[Central Ingestion Hub (ICCC)]
  │
  ├─► Security Guard: Token Freshness (300s), Geofence, Replay Drop
  ├─► OSM Road Snapping: KD-Tree haversine nearest-edge projection
  ├─► DBSCAN Spatial Clustering (eps=20m, min_samples=3)
  ├─► Bayesian Noisy-OR Fusion: P(defect) = 1 - ∏(1 - p_i)
  ├─► Risk Priority Ranking: P = (0.35S + 0.25E + 0.25V + 0.15A) × 100
  │
  ├─► Auto Work Order Dispatch (SLA: 24h P1, 72h P2, 168h P3)
  └─► Fleet Auto-Verification Engine (6 clean passes with Z-Jerk < 0.25G)
                                │
                                ▼
[Real-Time Command Center (Next.js)]
  ├─► Cartographic SVG + Geospatial MapLibre GL JS OpenStreetMap
  ├─► Persistent Data Mode Isolation (LIVE, DEMO, SIMULATION)
  ├─► Role-Based Access Control (Admin, Planner, Road Auth, Incident Officer)
  └─► Resilient WebSocket Stream with Exponential Reconnect
```

---

## 3. Data Isolation Tiers
NagarNetra enforces strict architectural isolation between data sources:
1. **LIVE (`real`)**: Genuine telemetry arriving from verified physical bus devices with authentic HMAC credentials registered in the `devices` table.
2. **DEMO (`demo`)**: High-fidelity pilot seed dataset with authentic Bangalore road photography, verified work orders, and realistic transit corridor routes.
3. **SIMULATION (`sim`)**: Dynamic scenario injections (waterlogging, tempo incursions, sudden sinkholes) generated for training and stress testing.

All API query parameters and frontend controls feature persistent, unambiguous markers separating these tiers.

---

## 4. Cryptographic Chain of Custody & Privacy
- **DPDP Act 2023 Compliance**: Raw video frames never leave the bus. Faces and non-infringing vehicle license plates are pixelated in volatile RAM prior to snapshot creation.
- **HMAC Signatures**: Each bus device maintains an independent cryptographic key (`hmac_secret`). The central hub verifies the signature using the device's key ID and supports a 24-hour key rotation grace window.
- **Evidence Steps**: Incidents maintain a verifiable SHA-256 Merkle chain linking edge ingestion, hub clustering, officer verification, and repair completion.
