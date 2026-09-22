with open("backend/app/routers/events.py", "w", encoding="utf-8") as f:
    f.write('''import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.schemas.event import IngestEvent, IngestResponse
from backend.app.models.schema import Detection, Incident, IncidentDetection, WorkOrder, AuditLog, Device
from backend.app.models.types import IncidentState, WorkOrderState, PriorityLevel
from backend.app.services.crypto import verify_device_credentials, compute_merkle_root
from backend.app.services.geo_snapper import snapper, haversine_distance_m
from backend.app.services.dedup_engine import run_dbscan_clustering, compute_confidence_weighted_centroid, compute_noisy_or_confidence
from backend.app.services.priority_engine import calculate_priority
from backend.app.services.verification_engine import process_clean_pass_corroboration
from backend.app.services.connection_manager import manager

router = APIRouter(prefix="/v1/events", tags=["events"])

def utcnow():
    return datetime.now(timezone.utc)

@router.post("", response_model=IngestResponse)
def ingest_event(event: IngestEvent, db: Session = Depends(get_db)):
    event_dict = event.model_dump()
    now_epoch = time.time()

    # 1. Freshness Check: Reject stale or future timestamps (> 300 seconds)
    time_skew = abs(now_epoch - event.t)
    if time_skew > settings.TIMESTAMP_FRESHNESS_SEC and event.source != "sim":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Timestamp out of bounds: Event timestamp skew is {round(time_skew)}s (limit: {settings.TIMESTAMP_FRESHNESS_SEC}s)."
        )

    # 2. Coordinate Sanity & Geofence Check (Bangalore Greater Metropolitan Area)
    if not (12.70 <= event.lat <= 13.25 and 77.30 <= event.lon <= 77.85) and event.source != "sim":
        return IngestResponse(
            status="rejected",
            event_id=event.id,
            dedup_action="geofence_out_of_bounds",
            message=f"Coordinates ({event.lat}, {event.lon}) fall outside Bengaluru municipal telemetry bounds."
        )

    # 3. Cryptographic Verification: Per-Device HMAC & Key Rotation
    if event.source != "sim":
        is_valid_dev, reason, device = verify_device_credentials(event_dict, db)
        if not is_valid_dev:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Cryptographic device verification failed: {reason}"
            )

        # 4. Movement Plausibility / Impossible Teleportation Check
        if device and device.last_seen and device.last_lat and device.last_lon:
            dt = max(1.0, (utcnow() - device.last_seen.replace(tzinfo=timezone.utc if device.last_seen.tzinfo is None else device.last_seen.tzinfo)).total_seconds())
            dist_m = haversine_distance_m(event.lat, event.lon, device.last_lat, device.last_lon)
            speed_kmh = (dist_m / dt) * 3.6
            if speed_kmh > settings.MAX_GPS_SPEED_KMH and dt < 60:
                return IngestResponse(
                    status="rejected",
                    event_id=event.id,
                    dedup_action="impossible_movement_rejected",
                    message=f"Teleportation detected: Speed between successive pings is {round(speed_kmh, 1)} km/h (threshold: {settings.MAX_GPS_SPEED_KMH} km/h)."
                )
            device.last_speed_kmh = speed_kmh
            device.last_lat = event.lat
            device.last_lon = event.lon
            device.last_seen = utcnow()
            db.commit()

    # 5. Replay Protection: Drop duplicate ULID
    existing = db.query(Detection).filter(Detection.id == event.id).first()
    if existing:
        return IngestResponse(
            status="dropped",
            event_id=event.id,
            dedup_action="replay_dropped",
            message="Event ULID already processed (idempotent duplicate)."
        )

    # 6. GPS Accuracy Quality Check
    if event.acc > 50.0:
        return IngestResponse(
            status="rejected",
            event_id=event.id,
            dedup_action="gps_accuracy_poor",
            message="GPS accuracy > 50m, rejected from high-precision grid."
        )

    # 7. Snap to OSM road network
    osm_way_id, edge_offset, snapped_lat, snapped_lon, dist_m = snapper.snap_point(event.lat, event.lon)

    # 8. Check clean pass corroboration for existing pending repairs
    clean_pass_updates = process_clean_pass_corroboration(
        db=db,
        bus_id=event.dev,
        lat=event.lat,
        lon=event.lon,
        imu_z=event.imu_z,
        camera_ok=(event.conf >= 0.50)
    )

    # 9. Debounce Logic:
    has_imu_corroboration = abs(event.imu_z) >= 0.35
    is_valid_trigger = (event.conf >= 0.75) or (event.conf >= 0.55 and has_imu_corroboration) or (event.source == "sim")

    # Record append-only detection
    detection = Detection(
        id=event.id,
        bus_id=event.dev,
        t=event.t,
        lat=snapped_lat,
        lon=snapped_lon,
        hdg=event.hdg,
        acc=event.acc,
        edge_id=edge_offset,
        offset_m=dist_m,
        cls=event.cls,
        conf=event.conf,
        severity=4 if event.conf > 0.85 else 3,
        imu_z=event.imu_z,
        size_m2=event.size_m2,
        track_id=event.cls,
        snap_hash=event.snap or "",
        source=event.source,
        model_version=event.model_version or "v3.2.1"
    )
    db.add(detection)
    db.commit()

    if not is_valid_trigger and not clean_pass_updates:
        return IngestResponse(
            status="filtered",
            event_id=event.id,
            dedup_action="debounced_below_threshold",
            message="Detection logged but debounced below risk threshold."
        )

    # 10. DBSCAN Deduplication and Incident Fusion
    nearby_incidents = db.query(Incident).filter(
        Incident.state.in_([IncidentState.CANDIDATE, IncidentState.CONFIRMED, IncidentState.TICKETED])
    ).all()

    matched_incident = None
    for inc in nearby_incidents:
        d = haversine_distance_m(snapped_lat, snapped_lon, inc.lat, inc.lon)
        if d <= 12.0:
            matched_incident = inc
            break

    if matched_incident:
        matched_incident.sightings_count += 1
        matched_incident.last_seen = utcnow()
        matched_incident.n_buses = min(matched_incident.sightings_count, matched_incident.n_buses + 1)
        
        sightings_mock = [{"bus_id": f"BUS-{i}", "conf": matched_incident.evidence_conf} for i in range(matched_incident.sightings_count)]
        sightings_mock.append({"bus_id": event.dev, "conf": event.conf})
        matched_incident.evidence_conf = compute_noisy_or_confidence(sightings_mock)

        p_calc = calculate_priority(
            defect_cls=event.cls,
            conf=matched_incident.evidence_conf,
            size_m2=event.size_m2,
            sightings=matched_incident.sightings_count,
            near_hospital=True,
            high_pedestrian=True
        )
        matched_incident.priority = p_calc["priority_score"]
        matched_incident.priority_s = p_calc["s_norm"]
        matched_incident.priority_e = p_calc["e_norm"]
        matched_incident.priority_v = p_calc["v_norm"]
        matched_incident.priority_a = p_calc["a_norm"]
        matched_incident.priority_level = p_calc["priority_level"]

        if matched_incident.state == IncidentState.CANDIDATE:
            if matched_incident.n_buses >= 2 or (matched_incident.evidence_conf >= 0.90 and has_imu_corroboration):
                matched_incident.state = IncidentState.CONFIRMED

        assoc = IncidentDetection(incident_id=matched_incident.id, detection_id=detection.id)
        db.add(assoc)
        db.commit()

        # Broadcast via Unified Connection Manager
        manager.broadcast_sync({
            "type": "INCIDENT_UPDATED",
            "payload": {
                "incident_id": matched_incident.id,
                "title": matched_incident.title,
                "priority": matched_incident.priority,
                "sightings": matched_incident.sightings_count,
                "state": matched_incident.state
            }
        })

        return IngestResponse(
            status="success",
            event_id=event.id,
            dedup_action="merged_existing",
            incident_id=matched_incident.id,
            priority=matched_incident.priority,
            message=f"Merged with {matched_incident.id}, sightings: {matched_incident.sightings_count}"
        )

    else:
        new_inc_id = f"INC-{datetime.now().strftime('%Y')}-{detection.id[-4:].upper()}"
        p_calc = calculate_priority(
            defect_cls=event.cls,
            conf=event.conf,
            size_m2=event.size_m2,
            sightings=1,
            near_hospital=False,
            high_pedestrian=True
        )

        title_prefix = {
            "D40": "Severe Pothole Cluster",
            "rebar_defect": "Severe Crater & Exposed Rebar",
            "crash_barrier": "Deformed Crash Barrier",
            "sunken_grate": "Sunken Storm Drain Grate",
            "vehicle_incursion": "Corridor Incursion Hazard"
        }.get(event.cls, f"Road Defect ({event.cls})")

        new_inc = Incident(
            id=new_inc_id,
            type="safety_hazard" if event.cls == "vehicle_incursion" else "road_defect",
            title=f"{title_prefix} on {osm_way_id}",
            subtitle=f"Near {edge_offset} • 1 bus camera",
            ward="Ward 04",
            zone="Bengaluru North Central",
            lat=snapped_lat,
            lon=snapped_lon,
            state=IncidentState.CONFIRMED if (event.conf >= 0.90 and has_imu_corroboration) else IncidentState.CANDIDATE,
            priority_level=p_calc["priority_level"],
            evidence_conf=event.conf,
            priority=p_calc["priority_score"],
            priority_s=p_calc["s_norm"],
            priority_e=p_calc["e_norm"],
            priority_v=p_calc["v_norm"],
            priority_a=p_calc["a_norm"],
            n_buses=1,
            sightings_count=1,
            depth_cm=14.0 if event.cls == "rebar_defect" else 8.0,
            image_url="/images/pothole_rebar.jpg" if event.cls == "rebar_defect" else "/images/trench.jpg",
            source=event.source,
            chain_of_custody_hash=compute_merkle_root([event.id, event.dev, str(event.t)])
        )
        db.add(new_inc)
        db.commit()

        assoc = IncidentDetection(incident_id=new_inc.id, detection_id=detection.id)
        db.add(assoc)
        db.commit()

        manager.broadcast_sync({
            "type": "INCIDENT_CREATED",
            "payload": {
                "incident_id": new_inc.id,
                "title": new_inc.title,
                "priority": new_inc.priority,
                "state": new_inc.state
            }
        })

        return IngestResponse(
            status="success",
            event_id=event.id,
            dedup_action="created_new",
            incident_id=new_inc.id,
            priority=new_inc.priority,
            message=f"Created incident {new_inc.id} with priority {new_inc.priority}"
        )
''')
print("Successfully generated backend/app/routers/events.py")
