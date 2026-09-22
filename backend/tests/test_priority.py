import pytest
from backend.app.services.priority_engine import calculate_priority

def test_priority_calculation():
    # Test with severe pothole, high confidence, hospital and school proximity
    res = calculate_priority(
        defect_cls="rebar_defect",
        conf=0.96,
        size_m2=0.18,
        sightings=11,
        near_hospital=True,
        near_school=False,
        high_pedestrian=True,
        days_open=2.0,
        sla_days=1.0
    )
    assert res["priority_score"] > 20.0
    assert res["priority_level"] == "P1_CRITICAL"
    assert "s_score" in res
    assert "e_score" in res
    assert "v_score" in res
    assert "a_score" in res
    assert res["s_norm"] > 0.8  # High severity
