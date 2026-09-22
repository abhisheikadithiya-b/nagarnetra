import math
import numpy as np
from sklearn.cluster import DBSCAN
from backend.app.services.geo_snapper import haversine_distance_m

EARTH_RADIUS_M = 6371000.0

def run_dbscan_clustering(points: list[dict], eps_m: float = 8.0) -> list[int]:
    """
    points: list of dicts with 'lat' and 'lon'
    eps_m: distance in meters (default 8m)
    returns list of cluster labels
    """
    if not points:
        return []
    if len(points) == 1:
        return [0]

    # Convert coordinates to radians for haversine metric
    coords_rad = np.radians([[p["lat"], p["lon"]] for p in points])
    eps_rad = eps_m / EARTH_RADIUS_M

    db = DBSCAN(eps=eps_rad, min_samples=1, metric="haversine")
    labels = db.fit_predict(coords_rad)
    return labels.tolist()

def compute_confidence_weighted_centroid(points: list[dict]) -> tuple[float, float]:
    """
    Computes (lat, lon) weighted by observation confidence
    """
    if not points:
        return 12.9716, 77.5946
    total_w = 0.0
    sum_lat = 0.0
    sum_lon = 0.0
    for p in points:
        w = max(0.1, float(p.get("conf", 0.5)))
        total_w += w
        sum_lat += p["lat"] * w
        sum_lon += p["lon"] * w
    return (sum_lat / total_w, sum_lon / total_w)

def compute_noisy_or_confidence(sightings: list[dict]) -> float:
    """
    Noisy-OR over independent bus sightings:
    1 - product(1 - w * conf)
    w = 1.0 for the first sighting from a given bus_id,
    w = 0.4 for repeated sightings from the same bus_id.
    """
    if not sightings:
        return 0.5

    seen_buses = set()
    prod = 1.0

    for s in sightings:
        bus = s.get("bus_id", "default")
        conf = float(s.get("conf", 0.7))
        w = 1.0 if bus not in seen_buses else 0.4
        seen_buses.add(bus)
        
        factor = 1.0 - (w * conf)
        # Numerical guard: factor between 0.01 and 1.0
        factor = max(0.01, min(1.0, factor))
        prod *= factor

    fused = 1.0 - prod
    return round(max(0.10, min(0.999, fused)), 4)
