import pytest
from backend.app.services.dedup_engine import (
    run_dbscan_clustering, compute_confidence_weighted_centroid, compute_noisy_or_confidence
)

def test_dbscan_clustering():
    # Two points close within 5m
    pts = [
        {"lat": 12.975200, "lon": 77.609400},
        {"lat": 12.975205, "lon": 77.609403}
    ]
    labels = run_dbscan_clustering(pts, eps_m=8.0)
    assert len(labels) == 2
    assert labels[0] == labels[1]  # In the same cluster!

def test_dbscan_separates_distant_points():
    # Points 500m apart
    pts = [
        {"lat": 12.975200, "lon": 77.609400},
        {"lat": 12.980000, "lon": 77.615000}
    ]
    labels = run_dbscan_clustering(pts, eps_m=8.0)
    assert labels[0] != labels[1]  # Separate clusters

def test_noisy_or_confidence():
    # Sighting from bus 1 with 0.85, and bus 2 with 0.90
    sightings = [
        {"bus_id": "BUS-1", "conf": 0.85},
        {"bus_id": "BUS-2", "conf": 0.90}
    ]
    fused = compute_noisy_or_confidence(sightings)
    # Fused confidence should be higher than either individual confidence
    assert fused > 0.90
    assert fused <= 0.999
