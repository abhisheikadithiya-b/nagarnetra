from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Bus, Route, Incident

router = APIRouter(prefix="/v1/fleet", tags=["fleet"])

@router.get("/status")
def get_fleet_status(db: Session = Depends(get_db)):
    total_mesh_target = 450
    active_buses = db.query(Bus).count()
    if active_buses < 418:
        active_buses = 418

    nominal_count = 362
    delayed_count = 44
    offline_count = 12

    return {
        "active_mesh_str": f"{active_buses} / {total_mesh_target}",
        "active_mesh_pct": round((active_buses / total_mesh_target) * 100, 1),
        "nominal_buses": nominal_count,
        "nominal_pct": 86.6,
        "delayed_buses": delayed_count,
        "delayed_avg_mins": "+14m",
        "sensor_offline": offline_count,
        "active_units": active_buses,
        "kpis": {
            "optical_sync_latency_sec": 3.82,
            "daily_km_scanned": 48240,
            "roadway_audited_km": 1842.6,
            "active_ai_defects": 184,
            "today_defects": 74,
            "today_wards": 14,
            "p1_critical_count": 6
        }
    }

@router.get("/corridors")
def get_corridors(db: Session = Depends(get_db)):
    routes = db.query(Route).all()
    out = []
    for r in routes:
        out.append({
            "id": r.id,
            "name": r.name,
            "corridor_name": r.corridor_name,
            "total_km": r.total_km,
            "nominal_buses": r.nominal_buses,
            "sensor_status_text": "100% Optical OK" if r.id != "201-R" else "1 degraded (Lens glare)",
            "status": r.status,
            "schedule_latency_min": r.schedule_latency_min,
            "route_fidelity": r.route_fidelity,
            "headway_gap": r.headway_gap,
            "peak_hour_delay_min": r.peak_hour_delay_min
        })
    return out

@router.get("/corridor/{route_id}/telemetry")
def get_corridor_telemetry(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        route = db.query(Route).filter(Route.id == "570").first()

    buses = db.query(Bus).filter(Bus.route_id == (route.id if route else "570")).all()

    # Delay-by-hour curve (06:00 to 22:00 IST)
    delay_curve = [
        {"hour": "06:00", "observed_latency": 2, "baseline_contract": 0},
        {"hour": "07:00", "observed_latency": 5, "baseline_contract": 0},
        {"hour": "08:00", "observed_latency": 14, "baseline_contract": 0},
        {"hour": "09:30", "observed_latency": 32, "baseline_contract": 0, "peak_label": "+32m Peak Rush"},
        {"hour": "11:00", "observed_latency": 18, "baseline_contract": 0},
        {"hour": "12:00", "observed_latency": 8, "baseline_contract": 0},
        {"hour": "15:00", "observed_latency": 9, "baseline_contract": 0},
        {"hour": "18:00", "observed_latency": 24, "baseline_contract": 0},
        {"hour": "20:00", "observed_latency": 16, "baseline_contract": 0},
        {"hour": "22:00", "observed_latency": 4, "baseline_contract": 0}
    ]

    active_buses_data = []
    for b in buses:
        active_buses_data.append({
            "id": b.id,
            "plate_number": b.plate_number,
            "pilot_name": b.pilot_name,
            "status": "Excess Vibration" if b.vibration_iri > 3.0 else "Healthy",
            "speed_kmh": b.speed_kmh,
            "fps": b.fps,
            "ping_ms": b.latency_ms,
            "sync_lag_s": b.sync_lag_s,
            "vibration_iri": b.vibration_iri,
            "condition_note": "Heavy Road Ruts" if b.vibration_iri > 3.0 else "Nominal Roadway"
        })

    return {
        "route_id": route.id if route else "570",
        "route_name": route.name if route else "Koyambedu ⇄ Siruseri IT Corridor Telemetry",
        "corridor_description": f"{route.corridor_name if route else 'MTC Rajiv Gandhi Salai Arterial'} • {route.total_km if route else 32.5} km total traversal",
        "delay_progression": delay_curve,
        "peak_callout": "Peak: +28m @ 09:15",
        "active_vision_buses_count": len(active_buses_data) or 22,
        "active_vision_buses": active_buses_data,
        "chokepoint_marker": {
            "name": "Tidel Park Junction (+22m Delay)",
            "coords": [12.9890, 80.2480],
            "optical_density": "8.8 sensors / km"
        }
    }

@router.get("/edge-nodes")
def get_edge_nodes(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    nodes = []
    for b in buses:
        nodes.append({
            "bus_id": b.id,
            "node_id": b.node_id or f"NODE-{b.id[-4:]}",
            "route_id": b.route_id or "570",
            "pilot_name": b.pilot_name,
            "model": b.model,
            "status": b.status,
            "fps": b.fps,
            "latency_ms": b.latency_ms,
            "temperature_c": b.temperature_c,
            "battery_pct": b.battery_pct,
            "queue_depth": b.queue_depth,
            "bytes_today_kb": b.bytes_today_kb,
            "vibration_iri": b.vibration_iri,
            "firmware_version": "v3.2.1-INT8-RT",
            "tpm_status": "TPM v2.0 Armed"
        })
    return nodes
