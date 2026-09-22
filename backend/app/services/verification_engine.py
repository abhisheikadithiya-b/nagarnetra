import datetime
from sqlalchemy.orm import Session
from backend.app.models.schema import Incident, WorkOrder, AuditLog
from backend.app.models.types import IncidentState, WorkOrderState
from backend.app.services.geo_snapper import haversine_distance_m

def process_clean_pass_corroboration(
    db: Session,
    bus_id: str,
    lat: float,
    lon: float,
    imu_z: float,
    camera_ok: bool = True
) -> list[dict]:
    """
    Evaluates passing bus against any pending repairs near (lat, lon).
    Returns list of updated work order notices.
    """
    updated_tickets = []
    if not camera_ok:
        return updated_tickets

    # Find work orders in fixed_pending_verif state
    pending_orders = db.query(WorkOrder).filter(
        WorkOrder.state == WorkOrderState.FIXED_PENDING_VERIF
    ).all()

    for wo in pending_orders:
        incident = wo.incident
        if not incident:
            continue

        dist_m = haversine_distance_m(lat, lon, incident.lat, incident.lon)
        if dist_m <= 25.0:
            # Within verification vicinity
            if abs(imu_z) < 0.25:
                # Smooth surface clean pass confirmed!
                incident.clean_pass_count += 1
                wo.passes_completed = min(wo.passes_total, incident.clean_pass_count)
                
                # Check if threshold reached
                if wo.passes_completed >= wo.passes_total:
                    wo.state = WorkOrderState.VERIFIED_CLOSED
                    wo.auto_verified = True
                    wo.verified_at = datetime.datetime.now(datetime.timezone.utc)
                    wo.acceleration_delta = f"< {abs(imu_z):.2f}G (SMOOTH)"
                    incident.state = IncidentState.VERIFIED_CLOSED

                    log = AuditLog(
                        action="AUTO_VERIFY_CLOSED",
                        resource_type="WORK_ORDER",
                        resource_id=wo.id,
                        details=f"Auto-verified by bus fleet. Confirmed smooth surface by {wo.passes_total} MTC transit buses. Corroborated z-axis shock < 0.25G."
                    )
                    db.add(log)
                    updated_tickets.append({
                        "work_order_id": wo.id,
                        "incident_id": incident.id,
                        "action": "auto_verified_closed",
                        "passes": f"{wo.passes_completed}/{wo.passes_total}"
                    })
                else:
                    updated_tickets.append({
                        "work_order_id": wo.id,
                        "incident_id": incident.id,
                        "action": "clean_pass_recorded",
                        "passes": f"{wo.passes_completed}/{wo.passes_total}"
                    })
            elif abs(imu_z) >= 0.40:
                # Anomaly spike! Defect persists or repair failed
                wo.state = WorkOrderState.OPEN_UNASSIGNED
                incident.state = IncidentState.REOPENED
                log = AuditLog(
                    action="VERIFICATION_FAILED_REOPEN",
                    resource_type="WORK_ORDER",
                    resource_id=wo.id,
                    details=f"Verification failed: bus {bus_id} registered high z-axis vibration {imu_z}G at repair site. Ticket reopened."
                )
                db.add(log)
                updated_tickets.append({
                    "work_order_id": wo.id,
                    "incident_id": incident.id,
                    "action": "reopened_anomaly_detected",
                    "shock": imu_z
                })
    
    db.commit()
    return updated_tickets
