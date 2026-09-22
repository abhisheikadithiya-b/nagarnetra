with open("backend/app/routers/work_orders.py", "w", encoding="utf-8") as f:
    f.write('''from typing import Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import case
from backend.app.database import get_db
from backend.app.models.schema import WorkOrder, AuditLog
from backend.app.schemas.work_order import WorkOrderOut, WorkOrderCreate, WorkOrderUpdate
from backend.app.services.pdf_generator import generate_work_order_pdf
from backend.app.services.auth import get_current_user, require_role, Role, UserRecord
from backend.app.services.connection_manager import manager

router = APIRouter(prefix="/v1/work-orders", tags=["work-orders"])

def utcnow():
    return datetime.now(timezone.utc)

@router.get("", response_model=List[WorkOrderOut])
def get_work_orders(
    state: Optional[str] = None,
    severity: Optional[str] = None,
    ward: Optional[str] = None,
    data_mode: Optional[str] = Query(None, description="Filter tier: real, demo, sim, or all"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(WorkOrder)
    if state and state != "All":
        query = query.filter(WorkOrder.state == state)
    if severity and severity != "All":
        query = query.filter(WorkOrder.severity == severity)
    if ward and ward != "All":
        query = query.filter(WorkOrder.ward == ward)
    if data_mode and data_mode != "all":
        query = query.filter(WorkOrder.source == data_mode)
    
    sev_order = case(
        (WorkOrder.severity == "P1_CRITICAL", 1),
        (WorkOrder.severity == "P2_MAJOR", 2),
        (WorkOrder.severity == "P3_MINOR", 3),
        else_=4
    )
    return query.order_by(sev_order, WorkOrder.id.asc()).offset(offset).limit(limit).all()

@router.post("", response_model=WorkOrderOut)
def create_work_order(
    data: WorkOrderCreate,
    current_user: UserRecord = Depends(require_role([Role.ROAD_AUTHORITY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    wo_count = db.query(WorkOrder).count()
    wo_id = f"WO-{utcnow().strftime('%Y')}-{1000 + wo_count}"
    
    new_wo = WorkOrder(
        id=wo_id,
        incident_id=data.incident_id,
        title=data.title,
        description=data.description or "",
        state="open_unassigned",
        severity=data.severity,
        assigned_to=data.assigned_to or "",
        ward=data.ward,
        location_desc=data.location_desc,
        sla_hours=data.sla_hours,
        sla_due=utcnow() + timedelta(hours=data.sla_hours),
        remaining_time_str=f"{data.sla_hours}h remaining",
        image_url="/images/pothole_rebar.jpg",
        source="real"
    )
    db.add(new_wo)
    
    log = AuditLog(
        operator_id=f"{current_user.full_name} ({current_user.role})",
        action="MANUAL_WORK_ORDER_CREATED",
        resource_type="WORK_ORDER",
        resource_id=wo_id,
        details=f"Created work order {wo_id} for {data.title}"
    )
    db.add(log)
    db.commit()
    db.refresh(new_wo)

    manager.broadcast_sync({
        "type": "WORK_ORDER_CREATED",
        "payload": {
            "work_order_id": new_wo.id,
            "title": new_wo.title,
            "state": new_wo.state,
            "severity": new_wo.severity
        }
    })

    return new_wo

@router.patch("/{work_order_id}", response_model=WorkOrderOut)
def update_work_order(
    work_order_id: str,
    data: WorkOrderUpdate,
    current_user: UserRecord = Depends(require_role([Role.ROAD_AUTHORITY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    wo = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    if data.state:
        wo.state = data.state
        if data.state == "verified_closed":
            wo.auto_verified = True
            wo.verified_at = utcnow()
            wo.remaining_time_str = "CLOSED"
    if data.assigned_to is not None:
        wo.assigned_to = data.assigned_to
    if data.repair_progress_pct is not None:
        wo.repair_progress_pct = data.repair_progress_pct
    if data.passes_completed is not None:
        wo.passes_completed = data.passes_completed

    log = AuditLog(
        operator_id=f"{current_user.full_name} ({current_user.role})",
        action="WORK_ORDER_UPDATED",
        resource_type="WORK_ORDER",
        resource_id=wo.id,
        details=f"Updated state to {wo.state}, assigned: {wo.assigned_to}"
    )
    db.add(log)
    db.commit()
    db.refresh(wo)

    manager.broadcast_sync({
        "type": "WORK_ORDER_UPDATED",
        "payload": {
            "work_order_id": wo.id,
            "new_state": wo.state,
            "assigned_to": wo.assigned_to
        }
    })

    return wo

@router.get("/{work_order_id}/pdf")
def get_work_order_pdf(
    work_order_id: str,
    token: Optional[str] = Query(None),
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wo = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    pdf_bytes = generate_work_order_pdf(wo)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=NagarNetra_WorkOrder_{wo.id}.pdf",
            "X-Audit-Operator": current_user.email
        }
    )
''')
print("Successfully generated backend/app/routers/work_orders.py")
