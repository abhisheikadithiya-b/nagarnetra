import pytest
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.schema import Incident, WorkOrder
from backend.app.models.types import IncidentState, WorkOrderState
from backend.app.services.verification_engine import process_clean_pass_corroboration

def test_clean_pass_auto_verification():
    # Setup in-memory sqlite test db
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    inc = Incident(
        id="INC-TEST-01",
        title="Test Repaired Pothole",
        lat=12.9752,
        lon=77.6094,
        state=IncidentState.FIXED_PENDING_VERIF,
        clean_pass_count=4
    )
    db.add(inc)

    wo = WorkOrder(
        id="WO-TEST-01",
        incident_id="INC-TEST-01",
        title="Test Repaired Pothole",
        state=WorkOrderState.FIXED_PENDING_VERIF,
        passes_completed=4,
        passes_total=6
    )
    db.add(wo)
    db.commit()

    # Pass 5: Smooth pass (shock 0.12G)
    res1 = process_clean_pass_corroboration(db, "BUS-01", 12.9752, 77.6094, imu_z=0.12)
    assert len(res1) == 1
    assert res1[0]["passes"] == "5/6"
    assert wo.state == WorkOrderState.FIXED_PENDING_VERIF

    # Pass 6: Smooth pass (shock 0.08G) -> Reaches 6/6, should auto-close!
    res2 = process_clean_pass_corroboration(db, "BUS-02", 12.9752, 77.6094, imu_z=0.08)
    assert len(res2) == 1
    assert res2[0]["action"] == "auto_verified_closed"
    assert wo.state == WorkOrderState.VERIFIED_CLOSED
    assert wo.auto_verified is True
    assert inc.state == IncidentState.VERIFIED_CLOSED

    db.close()
