import datetime
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.schema import Bus, Route, Incident, WorkOrder, EvidenceStep, RoadEdge, AuditLog, User, Device
from backend.app.models.types import IncidentState, WorkOrderState, PriorityLevel
from backend.app.services.crypto import compute_merkle_root
from backend.app.services.auth import PILOT_USERS
from backend.app.config import settings

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Seed Users if not present
    if db.query(User).count() == 0:
        for u in PILOT_USERS.values():
            db.add(User(
                id=u["id"],
                email=u["email"],
                hashed_password=u["password_hash"],
                full_name=u["full_name"],
                role=u["role"],
                is_active=u["is_active"],
                created_at=utcnow()
            ))
        db.commit()

    # Seed Devices if not present
    if db.query(Device).count() == 0:
        devices_to_seed = [
            Device(
                id="MTC-TN-01-N-9412",
                bus_id="MTC-TN-01-N-9412",
                node_id="NODE-9412-A1",
                key_id="KID-2026-PRIMARY",
                hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
                status="active",
                last_lat=12.9800,
                last_lon=80.2450,
                registered_at=utcnow()
            ),
            Device(
                id="MTC-TN-01-N-8819",
                bus_id="MTC-TN-01-N-8819",
                node_id="NODE-8819-B2",
                key_id="KID-2026-PRIMARY",
                hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
                status="active",
                last_lat=12.9650,
                last_lon=80.2450,
                registered_at=utcnow()
            ),
            Device(
                id="MTC-TN-01-N-4102",
                bus_id="MTC-TN-01-N-4102",
                node_id="NODE-4102-C3",
                key_id="KID-2026-PRIMARY",
                hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
                status="active",
                last_lat=13.0400,
                last_lon=80.2500,
                registered_at=utcnow()
            ),
            Device(
                id="MTC-TN-01-N-0118",
                bus_id="MTC-TN-01-N-0118",
                node_id="NODE-0118-D4",
                key_id="KID-2026-PRIMARY",
                hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
                status="active",
                last_lat=12.9150,
                last_lon=80.2520,
                registered_at=utcnow()
            ),
            Device(
                id="BUS-1042",
                bus_id="BUS-1042",
                node_id="NODE-1042-E5",
                key_id="KID-2026-PRIMARY",
                hmac_secret=settings.DEFAULT_HMAC_SECRET_KEY,
                status="active",
                last_lat=13.0827,
                last_lon=80.2707,
                registered_at=utcnow()
            ),
        ]
        db.add_all(devices_to_seed)
        db.commit()

    # Avoid duplicate incident seeding
    if db.query(Incident).count() > 0:
        db.close()
        return

    # 1. Routes (Chennai MTC Key Corridors)
    routes_data = [
        Route(
            id="570",
            name="Koyambedu CMBT ⇄ Siruseri IT Park",
            corridor_name="Rajiv Gandhi Salai (OMR) IT Corridor",
            total_km=32.5,
            nominal_buses=24,
            status="chokepoint",
            schedule_latency_min="+22m",
            route_fidelity="380m Detour @ Perungudi Metro Construction",
            headway_gap="18m Headway Gap",
            peak_hour_delay_min="+28m @ 09:15"
        ),
        Route(
            id="21G",
            name="Broadway ⇄ Vandalur Zoo",
            corridor_name="Anna Salai (Mount Road) Central Artery",
            total_km=28.4,
            nominal_buses=20,
            status="nominal",
            schedule_latency_min="+4m",
            route_fidelity="Nominal Alignment 0m deviation",
            headway_gap="Headway 7m Synchronized",
            peak_hour_delay_min="+12m @ 08:50"
        ),
        Route(
            id="102",
            name="Broadway ⇄ Kelambakkam",
            corridor_name="East Coast Road (ECR) Coastal Corridor",
            total_km=36.0,
            nominal_buses=16,
            status="moderate",
            schedule_latency_min="+8m",
            route_fidelity="ECR Thiruvanmiyur Toll Link",
            headway_gap="Headway 10m Coastal Schedule",
            peak_hour_delay_min="+16m @ 09:45"
        ),
        Route(
            id="29C",
            name="Perambur ⇄ Besant Nagar",
            corridor_name="Inner City Cross-Radial Axis",
            total_km=18.2,
            nominal_buses=14,
            status="nominal",
            schedule_latency_min="-1m",
            route_fidelity="Sterling Road & Mylapore Axis Nominal",
            headway_gap="Headway 8m Evenly Distributed",
            peak_hour_delay_min="+9m @ 18:30"
        )
    ]
    for r in routes_data:
        db.add(r)
    db.commit()

    # 2. Key Buses (MTC Fleet)
    buses_data = [
        Bus(
            id="BUS-1042",
            plate_number="TN 01 N 1042",
            route_id="570",
            node_id="NODE-1042-E5",
            pilot_name="M. Selvam",
            model="Ashok Leyland BS6 Viking",
            depot="MTC Anna Nagar Depot",
            status="nominal",
            fps=60.0,
            latency_ms=78.0,
            current_lat=13.0827,
            current_lon=80.2707,
            speed_kmh=36.0,
            heading=92.0,
            vibration_iri=1.4
        ),
        Bus(
            id="MTC-TN-01-N-9412",
            plate_number="TN 01 N 9412",
            route_id="570",
            node_id="NODE-9412-A1",
            pilot_name="S. Ramanathan",
            model="Ashok Leyland BS6 Viking",
            depot="MTC Central Depot",
            status="nominal",
            fps=60.0,
            latency_ms=82.0,
            current_lat=12.9800,
            current_lon=80.2450,
            speed_kmh=38.0,
            heading=85.0,
            vibration_iri=1.2
        ),
        Bus(
            id="MTC-TN-01-N-8819",
            plate_number="TN 01 N 8819",
            route_id="570",
            node_id="NODE-8819-B2",
            pilot_name="A. Murugan",
            model="Tata Marcopolo BS6",
            depot="MTC Adyar Depot",
            status="delayed",
            fps=60.0,
            latency_ms=145.0,
            sync_lag_s=2.1,
            current_lat=12.9650,
            current_lon=80.2450,
            speed_kmh=14.0,
            heading=70.0,
            vibration_iri=5.8  # Heavy Road Ruts
        ),
        Bus(
            id="MTC-TN-01-N-4102",
            plate_number="TN 01 N 4102",
            route_id="21G",
            node_id="NODE-4102-C3",
            pilot_name="R. Anbarasan",
            model="Ashok Leyland BS6 Viking",
            depot="MTC T. Nagar Depot",
            status="nominal",
            fps=60.0,
            latency_ms=94.0,
            current_lat=13.0400,
            current_lon=80.2500,
            speed_kmh=42.0,
            heading=105.0,
            vibration_iri=1.1
        ),
        Bus(
            id="MTC-TN-01-N-0118",
            plate_number="TN 01 N 0118",
            route_id="102",
            node_id="NODE-0118-D4",
            pilot_name="K. Sundaram",
            model="Tata Marcopolo BS6",
            depot="MTC Thiruvanmiyur Depot",
            status="nominal",
            fps=58.0,
            latency_ms=86.0,
            current_lat=12.9150,
            current_lon=80.2520,
            speed_kmh=38.0,
            heading=270.0,
            vibration_iri=1.5
        ),
        Bus(
            id="MTC-TN-01-N-2104",
            plate_number="TN 01 N 2104",
            route_id="29C",
            node_id="NODE-2104-E5",
            pilot_name="V. Karthik",
            model="Ashok Leyland JanBus",
            depot="MTC Mandaveli Depot",
            status="nominal",
            fps=55.0,
            latency_ms=90.0,
            current_lat=13.0350,
            current_lon=80.2670,
            speed_kmh=29.0,
            heading=180.0,
            vibration_iri=1.8
        )
    ]
    for b in buses_data:
        db.add(b)
    db.commit()

    # 3. Incidents matching Greater Chennai Corporation Pilot
    # Incident 1: Exposed Rebar on Anna Salai (Teynampet)
    inc1 = Incident(
        id="INC-2025-0849",
        type="road_defect",
        title="Severe Crater & Exposed Structural Rebar",
        subtitle="Anna Salai Northbound, 40m prior to DMS Signal",
        ward="Ward 117",
        zone="Zone 09 Teynampet",
        lat=13.0420,
        lon=80.2505,
        state=IncidentState.TICKETED,
        priority_level=PriorityLevel.P1_CRITICAL,
        evidence_conf=0.962,
        priority=96.4,
        priority_s=0.95,
        priority_e=0.92,
        priority_v=0.88,
        priority_a=0.64,
        n_buses=6,
        sightings_count=11,
        depth_cm=18.0,
        image_url="/images/pothole_rebar.jpg",
        source="real",
        environmental_telemetry="Dry Asphalt • 33°C • 14,200 Lux • High Visibility",
        chain_of_custody_hash="e5a019ff88bc27a091823"
    )

    # Incident 2: Rash Driving Corridor Incursion on OMR
    inc2 = Incident(
        id="INC-2025-0914",
        type="safety_hazard",
        title="Dangerous Reckless Driving & Illegal Lane Incursion into Bus Rapid Corridor",
        subtitle="Near Madhya Kailash Junction, Rajiv Gandhi Salai (OMR)",
        ward="Ward 173",
        zone="Zone 13 Adyar",
        lat=12.9805,
        lon=80.2455,
        state=IncidentState.CONFIRMED,
        priority_level=PriorityLevel.P1_CRITICAL,
        evidence_conf=0.984,
        priority=88.2,
        priority_s=0.96,
        priority_e=0.89,
        priority_v=0.85,
        priority_a=0.58,
        n_buses=8,
        sightings_count=14,
        depth_cm=0.0,
        image_url="/images/truck_incursion.jpg",
        source="real",
        plate_number="TN 09 BG 8842",
        plate_conf=0.948,
        plate_alternatives='[{"plate": "TN 09 BG 8842", "conf": 94.8, "note": "Primary prediction"}, {"plate": "TN 09 BG 8848", "conf": 4.2, "note": "Bumper bolt shadow"}, {"plate": "TN 08 BG 8842", "conf": 1.0, "note": "Reflective glare"}]',
        vehicle_classification="Tata Ace Commercial Goods LCV",
        trajectory_vector="Southward to Tidel Park (Track ID: #TRK-88492-B)",
        environmental_telemetry="Dry Asphalt • 33°C • 14,200 Lux • High Visibility",
        chain_of_custody_hash="e5a019ff88bc27a0918237799ef"
    )

    # Other incidents for priority queue & map
    inc3 = Incident(
        id="INC-2025-0820",
        type="safety_hazard",
        title="Wrong-Way Commercial Tempo",
        subtitle="Poonamallee High Road Bus Lane • 3 bus cameras",
        ward="Ward 104",
        zone="Zone 08 Shenoy Nagar",
        lat=13.0785,
        lon=80.2155,
        state=IncidentState.CONFIRMED,
        priority_level=PriorityLevel.P1_CRITICAL,
        evidence_conf=0.912,
        priority=88.2,
        priority_s=0.92,
        priority_e=0.88,
        priority_v=0.82,
        priority_a=0.55,
        n_buses=3,
        sightings_count=5,
        image_url="/images/wrong_way.jpg",
        source="real"
    )

    inc4 = Incident(
        id="INC-2025-0811",
        type="road_defect",
        title="Deep Cavity near Storm Drain",
        subtitle="OMR Km 8 • Perungudi Junction • 4 bus cameras",
        ward="Ward 180",
        zone="Zone 14 Perungudi",
        lat=12.9655,
        lon=80.2452,
        state=IncidentState.TICKETED,
        priority_level=PriorityLevel.P1_CRITICAL,
        evidence_conf=0.895,
        priority=81.5,
        priority_s=0.88,
        priority_e=0.82,
        priority_v=0.78,
        priority_a=0.52,
        n_buses=4,
        sightings_count=8,
        depth_cm=14.2,
        image_url="/images/storm_drain_cavity.jpg",
        source="real"
    )

    db.add_all([inc1, inc2, inc3, inc4])
    db.commit()

    # Evidence steps for INC-2025-0914 (Chain of Custody)
    steps = [
        EvidenceStep(
            incident_id="INC-2025-0914",
            step_num="01",
            title="Edge Ingestion",
            timestamp_str="09:38:11.204 IST",
            description="Captured via Sony IMX728 on MTC Bus #9412. Hardware TPM v2.0 signed.",
            sha_hash="8f9b2c3d88190fa7e4a1",
            pki_cert="TPM2.0_ED25519",
            verified=True
        ),
        EvidenceStep(
            incident_id="INC-2025-0914",
            step_num="02",
            title="Edge Neural Inference",
            timestamp_str="09:38:11.450 IST",
            description="YOLO-v11-Urban (Model v3.2.1) • Latency: 246ms • Zero Cloud Offload.",
            sha_hash="c71d41890abf42e1998b",
            pki_cert="MODEL_INT8_SHA256",
            verified=True
        ),
        EvidenceStep(
            incident_id="INC-2025-0914",
            step_num="03",
            title="Civic 5G MQTT Broadcast",
            timestamp_str="09:38:12.012 IST",
            description="Transmitted via encrypted slice APN-GCC-URBAN. Network transit: 180ms.",
            sha_hash="a19f8e45bbd09871cc20",
            pki_cert="TLS1.3_ECDSA_P384 VERIFIED",
            verified=True
        ),
        EvidenceStep(
            incident_id="INC-2025-0914",
            step_num="04",
            title="Merkle Root Fusion",
            timestamp_str="09:38:12.380 IST",
            description="Cross-validated by 2 adjacent MTC units. Root Hash committed to node.",
            sha_hash="MERKLE: e5a019ff...7799ef",
            pki_cert="PBFT-Quorum (14 Validators)",
            verified=True
        )
    ]
    for s in steps:
        db.add(s)
    db.commit()

    # 4. Work Orders (GCC Infrastructure Kanban)
    work_orders_data = [
        # Column 1: Open / Unassigned
        WorkOrder(
            id="WO-2025-0849",
            incident_id="INC-2025-0849",
            title="Severe Crater & Exposed Rebar",
            description="Major structural road cavity compromising bus axle stability. Multiple accelerometer shock detections.",
            state=WorkOrderState.OPEN_UNASSIGNED,
            severity="P1_CRITICAL",
            ward="Ward 117",
            location_desc="Anna Salai Northbound, Ward 117",
            sla_hours=24,
            breached=True,
            remaining_time_str="BREACHED -02h 14m",
            image_url="/images/pothole_rebar.jpg",
            acceleration_delta="1.42G (HEAVY SHOCK)"
        ),
        WorkOrder(
            id="WO-2025-0863",
            title="Open Unpaved Pipeline Trench",
            description="Utility excavation trench left unpaved by CMWSSB across flyover entry lane.",
            state=WorkOrderState.OPEN_UNASSIGNED,
            severity="P2_MAJOR",
            ward="Ward 54",
            location_desc="Royapuram Bridge Approach, Ward 54",
            sla_hours=48,
            breached=False,
            remaining_time_str="04h 12m remaining",
            image_url="/images/trench.jpg",
            acceleration_delta="0.88G (MODERATE)"
        ),
        WorkOrder(
            id="WO-2025-0902",
            title="Missing Reflective Studs & Median Delimitation",
            description="Missing cat-eye reflectors and degraded kerb marking over 150m stretch.",
            state=WorkOrderState.OPEN_UNASSIGNED,
            severity="P3_MINOR",
            ward="Ward 173",
            location_desc="OMR Tidel Park Stretch, Ward 173",
            sla_hours=72,
            breached=False,
            remaining_time_str="19h 40m remaining",
            image_url="/images/median_studs.jpg",
            acceleration_delta="0.10G (SMOOTH)"
        ),

        # Column 2: Assigned / In Progress
        WorkOrder(
            id="WO-2025-0781",
            title="Sunken Storm Drain Grate",
            description="Severe wheel drop risk for two-wheelers and low floor buses in kerbside bay.",
            state=WorkOrderState.ASSIGNED_IN_PROGRESS,
            severity="P1_CRITICAL",
            assigned_to="GCC Civil Infra Team B",
            ward="Ward 180",
            location_desc="OMR Km 8 Perungudi, Ward 180",
            sla_hours=24,
            breached=False,
            remaining_time_str="07h 15m remaining",
            repair_progress_pct=40,
            image_url="/images/sunken_grate.jpg"
        ),
        WorkOrder(
            id="WO-2025-0814",
            title="Sheared Steel Median Crash Barrier",
            description="High risk vehicle impact penetration point on bridge approach.",
            state=WorkOrderState.ASSIGNED_IN_PROGRESS,
            severity="P2_MAJOR",
            assigned_to="GCC Central Rapid Repair #4",
            ward="Ward 117",
            location_desc="Anna Salai / Gemini Flyover Approach",
            sla_hours=48,
            breached=False,
            remaining_time_str="12h 00m remaining",
            repair_progress_pct=65,
            image_url="/images/crash_barrier.jpg"
        ),

        # Column 3: Fixed (Pending Verif.) - Clean pass closed-loop
        WorkOrder(
            id="WO-2025-0733",
            title="Resurfaced Depression & Edge Sealing",
            description="Contractor finished hot-mix asphalt rolling 3h ago. Pending fleet telemetry clean passes.",
            state=WorkOrderState.FIXED_PENDING_VERIF,
            severity="P1_CRITICAL",
            assigned_to="GCC Zone 09 Rapid Team",
            ward="Ward 117",
            location_desc="Cathedral Road Junction, Ward 117",
            sla_hours=24,
            breached=False,
            remaining_time_str="Passes: 4 / 6",
            passes_completed=4,
            passes_total=6,
            repair_progress_pct=100,
            image_url="/images/paving_repair.jpg",
            repair_image_url="/images/paving_repaired.jpg",
            acceleration_delta="< 0.18G (CALM)"
        ),
        WorkOrder(
            id="WO-2025-0750",
            title="Level-Corrected Sewage Chamber Rim",
            description="Manhole frame raised and sealed flush with wearing course.",
            state=WorkOrderState.FIXED_PENDING_VERIF,
            severity="P2_MAJOR",
            assigned_to="GCC Zone 05 Rapid Team",
            ward="Ward 54",
            location_desc="Rajaji Salai Port Gate 3, Ward 54",
            sla_hours=48,
            breached=False,
            remaining_time_str="Passes: 5 / 6",
            passes_completed=5,
            passes_total=6,
            repair_progress_pct=100,
            image_url="/images/manhole_repair.jpg"
        ),

        # Column 4: Verified & Closed (Auto-verified by bus fleet!)
        WorkOrder(
            id="WO-2025-0692",
            title="Multi-Layer Milling & Asphalt Overlay",
            description="Auto-Verified by Bus Fleet. Confirmed smooth surface by 14 MTC transit buses over 48h.",
            state=WorkOrderState.VERIFIED_CLOSED,
            severity="P1_CRITICAL",
            assigned_to="Contractor Discharged",
            ward="Ward 117",
            location_desc="Anna Salai Metro Pillar 144, Ward 117",
            sla_hours=24,
            breached=False,
            remaining_time_str="CLOSED",
            passes_completed=6,
            passes_total=6,
            repair_progress_pct=100,
            auto_verified=True,
            verified_at=utcnow(),
            acceleration_delta="< 0.12G (SMOOTH)",
            image_url="/images/smooth_road.jpg"
        ),
        WorkOrder(
            id="WO-2025-0701",
            title="Ductile Iron Manhole Installation",
            description="Corroborated Telemetry: 8 transit passes with 0 accelerometer spikes.",
            state=WorkOrderState.VERIFIED_CLOSED,
            severity="P2_MAJOR",
            assigned_to="GCC Zone 13 Rapid Team",
            ward="Ward 173",
            location_desc="LB Road Thiruvanmiyur Junction, Ward 173",
            sla_hours=48,
            breached=False,
            remaining_time_str="CLOSED",
            passes_completed=6,
            passes_total=6,
            repair_progress_pct=100,
            auto_verified=True,
            verified_at=utcnow(),
            acceleration_delta="< 0.08G (SMOOTH)",
            image_url="/images/manhole_done.jpg"
        )
    ]

    for wo in work_orders_data:
        db.add(wo)
    db.commit()
    db.close()
    print("NagarNetra Database Successfully Seeded for Greater Chennai Corporation & MTC!")

if __name__ == "__main__":
    seed_database()
