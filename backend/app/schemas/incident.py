from typing import Optional, List
from pydantic import BaseModel
import datetime

class EvidenceStepOut(BaseModel):
    step_num: str
    title: str
    timestamp_str: str
    description: str
    sha_hash: str
    pki_cert: str
    verified: bool

    class Config:
        from_attributes = True

class IncidentOut(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    ward: str
    zone: str
    lat: float
    lon: float
    state: str
    priority_level: str
    evidence_conf: float
    priority: float
    priority_s: float
    priority_e: float
    priority_v: float
    priority_a: float
    first_seen: datetime.datetime
    last_seen: datetime.datetime
    n_buses: int
    sightings_count: int
    clean_pass_count: int
    clean_passes_required: int
    depth_cm: float
    image_url: str
    source: str
    plate_number: Optional[str] = ""
    plate_conf: Optional[float] = 0.0
    plate_alternatives: Optional[str] = "[]"
    vehicle_classification: Optional[str] = ""
    trajectory_vector: Optional[str] = ""
    environmental_telemetry: Optional[str] = ""
    chain_of_custody_hash: Optional[str] = ""
    evidence_steps: List[EvidenceStepOut] = []

    class Config:
        from_attributes = True

class IncidentActionRequest(BaseModel):
    action: str  # 'dispatch_qru', 'acknowledge', 'verify_interceptor', 'escalate_gcc', 'dismiss'
    reason: Optional[str] = None
    operator_id: Optional[str] = "#GCC-RAMANATHAN-01"
