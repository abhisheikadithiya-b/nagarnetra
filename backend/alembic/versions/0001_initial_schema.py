"""0001_initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-21 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), server_default=""),
        sa.Column("role", sa.String(), server_default="Viewer"),
        sa.Column("is_active", sa.Boolean(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # Devices table (per-device HMAC and key rotation)
    op.create_table(
        "devices",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("bus_id", sa.String(), nullable=True),
        sa.Column("node_id", sa.String(), server_default=""),
        sa.Column("key_id", sa.String(), nullable=False, server_default="KID-2026-PRIMARY"),
        sa.Column("hmac_secret", sa.String(), nullable=False),
        sa.Column("previous_key_id", sa.String(), nullable=True),
        sa.Column("previous_hmac_secret", sa.String(), nullable=True),
        sa.Column("status", sa.String(), server_default="active"),
        sa.Column("last_seen", sa.DateTime(timezone=True)),
        sa.Column("last_lat", sa.Float(), server_default="12.9716"),
        sa.Column("last_lon", sa.Float(), server_default="77.5946"),
        sa.Column("last_speed_kmh", sa.Float(), server_default="0.0"),
        sa.Column("firmware_version", sa.String(), server_default="v2.4.0"),
        sa.Column("registered_at", sa.DateTime(timezone=True)),
    )

    # Routes table
    op.create_table(
        "routes",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("corridor_name", sa.String(), server_default="Outer Ring Rd Transit Ring"),
        sa.Column("total_km", sa.Float(), server_default="34.2"),
        sa.Column("nominal_buses", sa.Integer(), server_default="22"),
        sa.Column("status", sa.String(), server_default="nominal"),
        sa.Column("schedule_latency_min", sa.String(), server_default="+0m"),
        sa.Column("route_fidelity", sa.String(), server_default="Nominal Track"),
        sa.Column("headway_gap", sa.String(), server_default="8m Headway"),
        sa.Column("peak_hour_delay_min", sa.String(), server_default="+0m"),
        sa.Column("geojson_waypoints", sa.Text(), server_default="[]"),
    )

    # Buses table
    op.create_table(
        "buses",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("plate_number", sa.String(), server_default=""),
        sa.Column("route_id", sa.String(), sa.ForeignKey("routes.id"), nullable=True),
        sa.Column("node_id", sa.String(), server_default=""),
        sa.Column("pilot_name", sa.String(), server_default="S. Kumar"),
        sa.Column("model", sa.String(), server_default="Volvo B9R"),
        sa.Column("depot", sa.String(), server_default="BMTC Depot 25"),
        sa.Column("status", sa.String(), server_default="nominal"),
        sa.Column("fps", sa.Float(), server_default="60.0"),
        sa.Column("latency_ms", sa.Float(), server_default="82.0"),
        sa.Column("sync_lag_s", sa.Float(), server_default="0.1"),
        sa.Column("current_lat", sa.Float(), server_default="12.9716"),
        sa.Column("current_lon", sa.Float(), server_default="77.5946"),
        sa.Column("speed_kmh", sa.Float(), server_default="38.0"),
        sa.Column("heading", sa.Float(), server_default="90.0"),
        sa.Column("vibration_iri", sa.Float(), server_default="1.2"),
        sa.Column("battery_pct", sa.Float(), server_default="94.0"),
        sa.Column("temperature_c", sa.Float(), server_default="38.5"),
        sa.Column("queue_depth", sa.Integer(), server_default="0"),
        sa.Column("bytes_today_kb", sa.Float(), server_default="1420.0"),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    # Detections table
    op.create_table(
        "detections",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("bus_id", sa.String(), nullable=False),
        sa.Column("t", sa.Integer(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("hdg", sa.Float(), server_default="0.0"),
        sa.Column("acc", sa.Float(), server_default="5.0"),
        sa.Column("edge_id", sa.String(), server_default=""),
        sa.Column("offset_m", sa.Float(), server_default="0.0"),
        sa.Column("cls", sa.String(), nullable=False),
        sa.Column("conf", sa.Float(), nullable=False),
        sa.Column("severity", sa.Integer(), server_default="3"),
        sa.Column("imu_z", sa.Float(), server_default="0.0"),
        sa.Column("size_m2", sa.Float(), server_default="0.1"),
        sa.Column("track_id", sa.String(), server_default=""),
        sa.Column("snap_hash", sa.String(), server_default=""),
        sa.Column("source", sa.String(), server_default="real"),
        sa.Column("model_version", sa.String(), server_default="v3.2.1"),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # Incidents table
    op.create_table(
        "incidents",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("type", sa.String(), server_default="road_defect"),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("subtitle", sa.String(), server_default=""),
        sa.Column("ward", sa.String(), server_default="Ward 04"),
        sa.Column("zone", sa.String(), server_default="Bengaluru North Central"),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("state", sa.String(), server_default="candidate"),
        sa.Column("priority_level", sa.String(), server_default="P1_CRITICAL"),
        sa.Column("evidence_conf", sa.Float(), server_default="0.85"),
        sa.Column("priority", sa.Float(), server_default="50.0"),
        sa.Column("priority_s", sa.Float(), server_default="0.8"),
        sa.Column("priority_e", sa.Float(), server_default="0.8"),
        sa.Column("priority_v", sa.Float(), server_default="1.0"),
        sa.Column("priority_a", sa.Float(), server_default="1.0"),
        sa.Column("first_seen", sa.DateTime(timezone=True)),
        sa.Column("last_seen", sa.DateTime(timezone=True)),
        sa.Column("n_buses", sa.Integer(), server_default="1"),
        sa.Column("sightings_count", sa.Integer(), server_default="1"),
        sa.Column("clean_pass_count", sa.Integer(), server_default="0"),
        sa.Column("clean_passes_required", sa.Integer(), server_default="6"),
        sa.Column("depth_cm", sa.Float(), server_default="12.0"),
        sa.Column("image_url", sa.String(), server_default=""),
        sa.Column("source", sa.String(), server_default="real"),
        sa.Column("plate_number", sa.String(), server_default=""),
        sa.Column("plate_conf", sa.Float(), server_default="0.0"),
        sa.Column("plate_alternatives", sa.Text(), server_default="[]"),
        sa.Column("vehicle_classification", sa.String(), server_default=""),
        sa.Column("trajectory_vector", sa.String(), server_default=""),
        sa.Column("environmental_telemetry", sa.String(), server_default=""),
        sa.Column("chain_of_custody_hash", sa.String(), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    # Incident Detections mapping table
    op.create_table(
        "incident_detections",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("incident_id", sa.String(), sa.ForeignKey("incidents.id")),
        sa.Column("detection_id", sa.String(), sa.ForeignKey("detections.id")),
    )

    # Work Orders table
    op.create_table(
        "work_orders",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("incident_id", sa.String(), sa.ForeignKey("incidents.id"), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), server_default=""),
        sa.Column("state", sa.String(), server_default="open_unassigned"),
        sa.Column("severity", sa.String(), server_default="P1_CRITICAL"),
        sa.Column("assigned_to", sa.String(), server_default=""),
        sa.Column("ward", sa.String(), server_default="Ward 112"),
        sa.Column("location_desc", sa.String(), server_default=""),
        sa.Column("sla_hours", sa.Integer(), server_default="24"),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("sla_due", sa.DateTime(timezone=True)),
        sa.Column("breached", sa.Boolean(), server_default="0"),
        sa.Column("remaining_time_str", sa.String(), server_default="24h remaining"),
        sa.Column("passes_completed", sa.Integer(), server_default="0"),
        sa.Column("passes_total", sa.Integer(), server_default="6"),
        sa.Column("repair_progress_pct", sa.Integer(), server_default="0"),
        sa.Column("auto_verified", sa.Boolean(), server_default="0"),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("acceleration_delta", sa.String(), server_default=""),
        sa.Column("image_url", sa.String(), server_default=""),
        sa.Column("repair_image_url", sa.String(), server_default=""),
        sa.Column("source", sa.String(), server_default="real"),
    )

    # Evidence Steps table
    op.create_table(
        "evidence_steps",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("incident_id", sa.String(), sa.ForeignKey("incidents.id")),
        sa.Column("step_num", sa.String(), server_default="01"),
        sa.Column("title", sa.String(), server_default="Edge Ingestion"),
        sa.Column("timestamp_str", sa.String(), server_default=""),
        sa.Column("description", sa.String(), server_default=""),
        sa.Column("sha_hash", sa.String(), server_default=""),
        sa.Column("pki_cert", sa.String(), server_default=""),
        sa.Column("verified", sa.Boolean(), server_default="1"),
    )

    # Road Edges table
    op.create_table(
        "road_edges",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), server_default="Outer Ring Road"),
        sa.Column("corridor", sa.String(), server_default="500-D"),
        sa.Column("start_lat", sa.Float(), server_default="12.9716"),
        sa.Column("start_lon", sa.Float(), server_default="77.5946"),
        sa.Column("end_lat", sa.Float(), server_default="12.9750"),
        sa.Column("end_lon", sa.Float(), server_default="77.6000"),
        sa.Column("speed_limit_kmh", sa.Float(), server_default="50.0"),
        sa.Column("free_flow_speed", sa.Float(), server_default="48.0"),
        sa.Column("current_speed", sa.Float(), server_default="28.0"),
        sa.Column("density_pcu", sa.Float(), server_default="3200.0"),
        sa.Column("congestion_idx", sa.Float(), server_default="0.58"),
        sa.Column("health_score", sa.Float(), server_default="72.0"),
        sa.Column("iri_roughness", sa.Float(), server_default="2.8"),
    )

    # Audit Logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("timestamp", sa.DateTime(timezone=True)),
        sa.Column("operator_id", sa.String(), server_default="#SYSTEM"),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("resource_type", sa.String(), nullable=False),
        sa.Column("resource_id", sa.String(), nullable=False),
        sa.Column("details", sa.Text(), server_default=""),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("road_edges")
    op.drop_table("evidence_steps")
    op.drop_table("work_orders")
    op.drop_table("incident_detections")
    op.drop_table("incidents")
    op.drop_table("detections")
    op.drop_table("buses")
    op.drop_table("routes")
    op.drop_table("devices")
    op.drop_table("users")
