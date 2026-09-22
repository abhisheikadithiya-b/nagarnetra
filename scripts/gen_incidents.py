with open("backend/app/routers/incidents.py", "w", encoding="utf-8") as f:
    f.write('''from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.schema import Incident, AuditLog
from backend.app.schemas.incident import IncidentOut, IncidentActionRequest
from backend.app.services.pdf_generator import generate_police_report_pdf
from backend.app.services.auth import get_current_user, require_role, Role, UserRecord
from backend.app.services.connection_manager import manager

router = APIRouter(prefix="/v1/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    ward: Optional[str] = None,
    priority_level: Optional[str] = None,
    source: Optional[str] = None,
    data_mode: Optional[str] = Query(None, description="Filter by data tier: real, demo, sim, or all"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if ward and ward != "All":
        query = query.filter(Incident.ward == ward)
    if priority_level and priority_level != "All":
        query = query.filter(Incident.priority_level == priority_level)
    
    # Data tier separation
    tier = data_mode or source
    if tier and tier != "all":
        query = query.filter(Incident.source == tier)

    return query.order_by(Incident.priority.desc()).offset(offset).limit(limit).all()

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/{incident_id}/action")
def take_incident_action(
    incident_id: str,
    req: IncidentActionRequest,
    current_user: UserRecord = Depends(require_role([Role.INCIDENT_OFFICER, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    operator_tag = f"{current_user.full_name} ({current_user.role})"
    log = AuditLog(
        operator_id=operator_tag,
        action=req.action.upper(),
        resource_type="INCIDENT",
        resource_id=inc.id,
        details=f"Officer protocol executed: {req.action}. Reason: {req.reason or 'Operational protocol'}"
    )
    db.add(log)

    if req.action == "dispatch_qru":
        inc.state = "ticketed"
        msg = "QRU Hazard Squad Dispatched to coordinates."
    elif req.action == "verify_interceptor":
        inc.state = "confirmed"
        msg = "Traffic Police Interceptor Unit dispatched for vehicle interception."
    elif req.action == "escalate_bbmp":
        inc.state = "ticketed"
        msg = "Escalated directly to BBMP Road Infrastructure Cell."
    elif req.action == "dismiss":
        inc.state = "dismissed"
        msg = f"Incident dismissed by officer. Reason: {req.reason}"
    else:
        inc.state = "confirmed"
        msg = "Action recorded."

    db.commit()
    db.refresh(inc)

    # Broadcast updated state
    manager.broadcast_sync({
        "type": "INCIDENT_STATE_CHANGED",
        "payload": {
            "incident_id": inc.id,
            "new_state": inc.state,
            "operator": operator_tag,
            "message": msg
        }
    })

    return {
        "status": "success",
        "incident_id": inc.id,
        "new_state": inc.state,
        "message": msg,
        "operator": operator_tag
    }

@router.get("/{incident_id}/police-report")
def get_police_report(
    incident_id: str,
    token: Optional[str] = Query(None),
    current_user: UserRecord = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    pdf_bytes = generate_police_report_pdf(inc)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=NagarNetra_Police_Notice_{inc.id}.pdf",
            "X-Audit-Operator": current_user.email
        }
    )
''')
print("Successfully generated backend/app/routers/incidents.py")
