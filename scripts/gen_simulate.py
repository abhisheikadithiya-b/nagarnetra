with open("backend/app/routers/simulate.py", "w", encoding="utf-8") as f:
    f.write('''import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Incident, WorkOrder, Bus, Route, Detection, AuditLog
from backend.app.models.types import IncidentState, WorkOrderState, PriorityLevel
from backend.app.services.crypto import generate_ulid, compute_merkle_root
from backend.app.services.auth import require_role, Role, UserRecord
from backend.app.services.connection_manager import manager

router = APIRouter(prefix="/v1/simulate", tags=["simulation"])

class ScenarioRequest(BaseModel):
    scenario: str

@router.post("/scenario")
def trigger_scenario(
    req: ScenarioRequest,
    current_user: UserRecord = Depends(require_role([Role.TRANSPORT_PLANNER, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    sc = req.scenario.lower()
    operator_tag = f"{current_user.full_name} ({current_user.role})"
    
    if sc == "new_pothole":
        new_id = f"INC-2025-SIM{db.query(Incident).count() + 1}"
        inc = Incident(
            id=new_id,
            type="road_defect",
            title="Severe Asphalt Cavity & Rut Depth 16cm",
            subtitle="Outer Ring Road Km 12 (Near Bellandur Flyover)",
            ward="Ward 142",
            zone="Bengaluru East",
            lat=12.9350,
            lon=77.6850,
            state=IncidentState.TICKETED,
            priority_level=PriorityLevel.P1_CRITICAL,
            evidence_conf=0.945,
            priority=92.1,
            priority_s=0.94,
            priority_e=0.90,
            priority_v=0.86,
            priority_a=0.55,
            n_buses=2,
            sightings_count=4,
            depth_cm=16.0,
            image_url="/images/pothole_rebar.jpg",
            source="sim"
        )
        db.add(inc)

        wo_id = f"WO-2025-SIM{db.query(WorkOrder).count() + 1}"
        wo = WorkOrder(
            id=wo_id,
            incident_id=new_id,
            title="Severe Asphalt Cavity & Rut Depth 16cm",
            description="Simulated emergency road defect injected via edge telematics.",
            state=WorkOrderState.OPEN_UNASSIGNED,
            severity="P1_CRITICAL",
            ward="Ward 142",
            location_desc="Outer Ring Road Km 12",
            sla_hours=24,
            remaining_time_str="24h remaining",
            image_url="/images/pothole_rebar.jpg",
            source="sim"
        )
        db.add(wo)
        db.commit()

        manager.broadcast_sync({
            "type": "SIMULATION_TRIGGERED",
            "payload": {
                "scenario": "new_pothole",
                "incident_id": new_id,
                "work_order_id": wo_id,
                "operator": operator_tag
            }
        })

        return {
            "status": "triggered",
            "scenario": "new_pothole",
            "incident_id": new_id,
            "work_order_id": wo_id,
            "operator": operator_tag
        }

    elif sc == "rush_hour":
        buses = db.query(Bus).all()
        for b in buses:
            b.speed_kmh = max(12.0, b.speed_kmh * 0.55)
            b.status = "delayed"
        db.commit()
        manager.broadcast_sync({
            "type": "SIMULATION_TRIGGERED",
            "payload": {"scenario": "rush_hour", "operator": operator_tag}
        })
        return {"status": "triggered", "scenario": "rush_hour", "affected_buses": len(buses)}

    elif sc == "verify_pass":
        wo = db.query(WorkOrder).filter(WorkOrder.state == WorkOrderState.FIXED_PENDING_VERIF).first()
        if wo:
            wo.passes_completed = min(wo.passes_total, wo.passes_completed + 1)
            if wo.passes_completed >= wo.passes_total:
                wo.state = WorkOrderState.VERIFIED_CLOSED
                wo.auto_verified = True
                wo.remaining_time_str = "CLOSED"
            db.commit()
            manager.broadcast_sync({
                "type": "WORK_ORDER_UPDATED",
                "payload": {"work_order_id": wo.id, "passes": wo.passes_completed, "state": wo.state}
            })
            return {"status": "triggered", "scenario": "verify_pass", "work_order_id": wo.id, "passes": wo.passes_completed, "closed": wo.auto_verified}
        return {"status": "skipped", "message": "No work orders in Fixed (Pending Verif.) state"}

    elif sc == "normal":
        buses = db.query(Bus).all()
        for b in buses:
            b.speed_kmh = 38.0
            b.status = "nominal"
        db.commit()
        return {"status": "triggered", "scenario": "normal", "message": "Fleet reset to nominal patrol"}

    return {"status": "unknown_scenario", "scenario": sc}
''')
print("Successfully generated backend/app/routers/simulate.py")
