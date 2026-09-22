from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.traffic_analytics import get_congestion_segments, get_origin_destination_flows

router = APIRouter(prefix="/v1", tags=["traffic"])

@router.get("/segments/congestion")
def get_segments_congestion():
    return get_congestion_segments()

@router.get("/traffic/od-flows")
def get_od_flows():
    return get_origin_destination_flows()

@router.get("/metrics")
def get_metrics():
    return {
        "sight_to_cloud_latency_s": 3.82,
        "daily_km_scanned": 48240,
        "roadway_audited_km": 1842.6,
        "active_ai_defects": 184,
        "active_mesh_buses": 418,
        "total_fleet_target": 450,
        "today_defects": 74,
        "today_wards_covered": 14,
        "p1_critical_count": 6,
        "p2_major_count": 29,
        "p3_minor_count": 38,
        "contractor_squads_deployed": 26,
        "mean_time_to_repair_hours": 18.4,
        "sla_compliance_pct": 84.2
    }
