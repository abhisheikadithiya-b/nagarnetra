from typing import Optional
from pydantic import BaseModel
import datetime

class WorkOrderOut(BaseModel):
    id: str
    incident_id: Optional[str] = None
    title: str
    description: str
    state: str
    severity: str
    assigned_to: str
    ward: str
    location_desc: str
    sla_hours: int
    created_at: datetime.datetime
    sla_due: datetime.datetime
    breached: bool
    remaining_time_str: str
    passes_completed: int
    passes_total: int
    repair_progress_pct: int
    auto_verified: bool
    verified_at: Optional[datetime.datetime] = None
    acceleration_delta: str
    image_url: str
    repair_image_url: str
    source: str

    class Config:
        from_attributes = True

class WorkOrderCreate(BaseModel):
    incident_id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    severity: str = "P2_MAJOR"
    assigned_to: Optional[str] = ""
    ward: str = "Ward 112"
    location_desc: str = ""
    sla_hours: int = 24

class WorkOrderUpdate(BaseModel):
    state: Optional[str] = None
    assigned_to: Optional[str] = None
    repair_progress_pct: Optional[int] = None
    repair_image_url: Optional[str] = None
