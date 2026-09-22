import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    role = Column(String, default="Viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True)                     # dev ID, e.g. MTC-TN-01-N-9412
    bus_id = Column(String, nullable=True)
    node_id = Column(String, default="")
    key_id = Column(String, nullable=False, default="KID-2026-PRIMARY")
    hmac_secret = Column(String, nullable=False)
    previous_key_id = Column(String, nullable=True)
    previous_hmac_secret = Column(String, nullable=True)
    status = Column(String, default="active")                 # active, suspended, retired
    last_seen = Column(DateTime(timezone=True), default=utcnow)
    last_lat = Column(Float, default=13.0827)
    last_lon = Column(Float, default=80.2707)
    last_speed_kmh = Column(Float, default=0.0)
    firmware_version = Column(String, default="v2.4.0")
    registered_at = Column(DateTime(timezone=True), default=utcnow)


class Bus(Base):
    __tablename__ = "buses"

    id = Column(String, primary_key=True)                     # e.g. BUS-1042, MTC-TN-01-N-9412
    plate_number = Column(String, default="")
    route_id = Column(String, ForeignKey("routes.id"), nullable=True)
    node_id = Column(String, default="")                     # e.g. NODE-9f2a-7c01
    pilot_name = Column(String, default="S. Ramanathan")
    model = Column(String, default="Ashok Leyland BS6 Viking")
    depot = Column(String, default="MTC Anna Nagar Depot")
    status = Column(String, default="nominal")               # nominal, delayed, offline
    fps = Column(Float, default=60.0)
    latency_ms = Column(Float, default=82.0)
    sync_lag_s = Column(Float, default=0.1)
    current_lat = Column(Float, default=13.0827)
    current_lon = Column(Float, default=80.2707)
    speed_kmh = Column(Float, default=38.0)
    heading = Column(Float, default=90.0)
    vibration_iri = Column(Float, default=1.2)
    battery_pct = Column(Float, default=94.0)
    temperature_c = Column(Float, default=38.5)
    queue_depth = Column(Integer, default=0)
    bytes_today_kb = Column(Float, default=1420.0)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    route = relationship("Route", back_populates="buses")


class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True)                     # e.g. 500-D
    name = Column(String, nullable=False)                     # Silk Board ⇄ Hebbal ORR
    corridor_name = Column(String, default="Outer Ring Rd Transit Ring")
    total_km = Column(Float, default=34.2)
    nominal_buses = Column(Integer, default=22)
    status = Column(String, default="chokepoint")            # chokepoint, nominal, moderate
    schedule_latency_min = Column(String, default="+24m")
    route_fidelity = Column(String, default="420m Detour @ Tin Factory Waterlogged")
    headway_gap = Column(String, default="22m Headway Gap")
    peak_hour_delay_min = Column(String, default="+32m @ 09:30")
    geojson_waypoints = Column(Text, default="[]")

    buses = relationship("Bus", back_populates="route")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True)                     # ULID
    bus_id = Column(String, nullable=False)
    t = Column(Integer, nullable=False)                       # Unix epoch seconds
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    hdg = Column(Float, default=0.0)
    acc = Column(Float, default=5.0)                          # GPS accuracy meters
    edge_id = Column(String, default="")
    offset_m = Column(Float, default=0.0)
    cls = Column(String, nullable=False)                      # D40, rebar_defect, etc.
    conf = Column(Float, nullable=False)
    severity = Column(Integer, default=3)                     # 1 to 5
    imu_z = Column(Float, default=0.0)                        # Vertical jerk in G
    size_m2 = Column(Float, default=0.1)
    track_id = Column(String, default="")
    snap_hash = Column(String, default="")
    source = Column(String, default="real")                  # real, demo, sim
    model_version = Column(String, default="v3.2.1")
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)                     # e.g. INC-2025-0849
    type = Column(String, default="road_defect")             # road_defect, safety_hazard, asset_missing, waterlogging
    title = Column(String, nullable=False)
    subtitle = Column(String, default="")
    ward = Column(String, default="Ward 117")
    zone = Column(String, default="Zone 09 Teynampet")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    state = Column(String, default="candidate")              # candidate, confirmed, ticketed, fixed_pending_verif, verified_closed, reopened, dismissed
    priority_level = Column(String, default="P1_CRITICAL")   # P1_CRITICAL, P2_MAJOR, P3_MINOR
    evidence_conf = Column(Float, default=0.85)               # Noisy-OR confidence 0.0 - 1.0
    priority = Column(Float, default=50.0)                    # 0 - 100 risk score
    priority_s = Column(Float, default=0.8)                   # Severity factor
    priority_e = Column(Float, default=0.8)                   # Exposure factor
    priority_v = Column(Float, default=1.0)                   # Vulnerability factor
    priority_a = Column(Float, default=1.0)                   # Age factor
    first_seen = Column(DateTime(timezone=True), default=utcnow)
    last_seen = Column(DateTime(timezone=True), default=utcnow)
    n_buses = Column(Integer, default=1)                      # Count of unique transit buses
    sightings_count = Column(Integer, default=1)
    clean_pass_count = Column(Integer, default=0)             # Count of clean passes since fixed
    clean_passes_required = Column(Integer, default=6)
    depth_cm = Column(Float, default=12.0)
    image_url = Column(String, default="")
    source = Column(String, default="real")                  # real, demo, sim
    plate_number = Column(String, default="")
    plate_conf = Column(Float, default=0.0)
    plate_alternatives = Column(Text, default="[]")          # JSON array of confusions
    vehicle_classification = Column(String, default="")
    trajectory_vector = Column(String, default="")
    environmental_telemetry = Column(String, default="Dry Asphalt • 32°C • 12,400 Lux")
    chain_of_custody_hash = Column(String, default="")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    work_orders = relationship("WorkOrder", back_populates="incident")
    evidence_steps = relationship("EvidenceStep", back_populates="incident")


class IncidentDetection(Base):
    __tablename__ = "incident_detections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    detection_id = Column(String, ForeignKey("detections.id"))


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(String, primary_key=True)                     # e.g. WO-2025-0849
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    state = Column(String, default="open_unassigned")        # open_unassigned, assigned_in_progress, fixed_pending_verif, verified_closed
    severity = Column(String, default="P1_CRITICAL")
    assigned_to = Column(String, default="")                 # e.g. L&T Civil Infra Team B
    ward = Column(String, default="Ward 112")
    location_desc = Column(String, default="")
    sla_hours = Column(Integer, default=24)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    sla_due = Column(DateTime(timezone=True), default=utcnow)
    breached = Column(Boolean, default=False)
    remaining_time_str = Column(String, default="24h remaining")
    passes_completed = Column(Integer, default=0)
    passes_total = Column(Integer, default=6)
    repair_progress_pct = Column(Integer, default=0)
    auto_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    acceleration_delta = Column(String, default="")
    image_url = Column(String, default="")
    repair_image_url = Column(String, default="")
    source = Column(String, default="real")                  # real, demo, sim

    incident = relationship("Incident", back_populates="work_orders")


class EvidenceStep(Base):
    __tablename__ = "evidence_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    step_num = Column(String, default="01")                  # 01, 02, 03, 04
    title = Column(String, default="Edge Ingestion")
    timestamp_str = Column(String, default="09:38:11.204 IST")
    description = Column(String, default="")
    sha_hash = Column(String, default="")
    pki_cert = Column(String, default="")
    verified = Column(Boolean, default=True)

    incident = relationship("Incident", back_populates="evidence_steps")


class RoadEdge(Base):
    __tablename__ = "road_edges"

    id = Column(String, primary_key=True)                     # OSM Way ID, e.g. w_omr_570
    name = Column(String, default="Rajiv Gandhi Salai (OMR)")
    corridor = Column(String, default="570")
    start_lat = Column(Float, default=12.9800)
    start_lon = Column(Float, default=80.2450)
    end_lat = Column(Float, default=12.9750)
    end_lon = Column(Float, default=80.2480)
    speed_limit_kmh = Column(Float, default=50.0)
    free_flow_speed = Column(Float, default=48.0)
    current_speed = Column(Float, default=28.0)
    density_pcu = Column(Float, default=3200.0)
    congestion_idx = Column(Float, default=0.58)              # observed / free_flow
    health_score = Column(Float, default=72.0)                # 0 to 100
    iri_roughness = Column(Float, default=2.8)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
    operator_id = Column(String, default="#GCC-RAMANATHAN-01")
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    details = Column(Text, default="")
