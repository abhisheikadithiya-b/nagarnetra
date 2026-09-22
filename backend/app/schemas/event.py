from typing import Optional
from pydantic import BaseModel, Field

class IngestEvent(BaseModel):
    id: str = Field(..., description="ULID unique event identifier")
    dev: str = Field(..., description="Bus/Phone device ID, e.g. BUS-1042")
    t: int = Field(..., description="Epoch timestamp in seconds")
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    hdg: float = Field(0.0, description="Heading in degrees")
    acc: float = Field(5.0, description="GPS accuracy in meters")
    cls: str = Field(..., description="Defect/Hazard class, e.g. D40, rebar_defect")
    conf: float = Field(..., description="Optical confidence 0.0 to 1.0")
    size_m2: float = Field(0.1, description="Estimated surface area in m2")
    imu_z: float = Field(0.0, description="Z-axis accelerometer vertical jerk in G")
    edge: Optional[str] = Field(None, description="OSM edge identifier w12345:0.42")
    snap: Optional[str] = Field(None, description="SHA-256 hash of 15KB blurred snapshot")
    sig: str = Field(..., description="HMAC-SHA256 signature of the payload")
    source: str = Field("real", description="real or sim")
    plate_number: Optional[str] = None
    plate_conf: Optional[float] = None
    model_version: Optional[str] = "v3.2.1"

class IngestResponse(BaseModel):
    status: str
    event_id: str
    dedup_action: str  # e.g. 'created_candidate', 'merged_existing', 'confirmed'
    incident_id: Optional[str] = None
    priority: Optional[float] = None
    message: str
