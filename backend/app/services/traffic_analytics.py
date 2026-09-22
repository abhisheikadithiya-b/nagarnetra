import random

def get_congestion_segments(db=None) -> list[dict]:
    """
    Returns real-time congestion metrics for primary corridors
    """
    segments = [
        {
            "segment_id": "ORR-TF-01",
            "name": "Tin Factory Junction Underpass",
            "corridor": "500-D (Outer Ring Road)",
            "observed_speed_kmh": 11.4,
            "free_flow_speed_kmh": 52.0,
            "congestion_index": 0.22,
            "status": "SEVERE_CHOKEPOINT",
            "density_pcu_per_km": 5400,
            "delay_minutes": 24,
            "contributing_factors": [
                "Underpass waterlogging (35cm standing water)",
                "Corridor pinch point with merging metro traffic",
                "High heavy-vehicle proportion (32%)"
            ],
            "coords": [[13.0030, 77.6650], [12.9980, 77.6680]]
        },
        {
            "segment_id": "CBD-MG-04",
            "name": "MG Road prior to Brigade Junction",
            "corridor": "Central CBD Artery",
            "observed_speed_kmh": 16.2,
            "free_flow_speed_kmh": 40.0,
            "congestion_index": 0.40,
            "status": "MODERATE_BOTTLENECK",
            "density_pcu_per_km": 4200,
            "delay_minutes": 11,
            "contributing_factors": [
                "Open road crater & exposed rebar (INC-2025-0849)",
                "Two-wheeler lane swerves"
            ],
            "coords": [[12.9756, 77.6060], [12.9752, 77.6094]]
        },
        {
            "segment_id": "OAR-DOM-02",
            "name": "Old Airport Road at Command Hospital",
            "corridor": "335-E (Old Airport Road)",
            "observed_speed_kmh": 34.8,
            "free_flow_speed_kmh": 45.0,
            "congestion_index": 0.77,
            "status": "NOMINAL_FLOW",
            "density_pcu_per_km": 2800,
            "delay_minutes": 3,
            "contributing_factors": [
                "Corridor transit incursion cleared",
                "Signal timing synchronized"
            ],
            "coords": [[12.9620, 77.6380], [12.9600, 77.6490]]
        },
        {
            "segment_id": "KIA-EXP-08",
            "name": "Hebbal Flyover Elevated Ramp",
            "corridor": "KIA-8 (Airport Expressway)",
            "observed_speed_kmh": 48.0,
            "free_flow_speed_kmh": 75.0,
            "congestion_index": 0.64,
            "status": "MODERATE_FLOW",
            "density_pcu_per_km": 3100,
            "delay_minutes": 8,
            "contributing_factors": [
                "Utility trench road cut (WO-2025-0863) on ramp shoulder"
            ],
            "coords": [[13.0150, 77.5850], [13.0350, 77.5970]]
        }
    ]
    return segments

def get_origin_destination_flows() -> list[dict]:
    """
    Returns zone-to-zone desire lines and bus passenger flows
    """
    return [
        {
            "origin": "Silk Board Transit Node",
            "destination": "Hebbal Outer Ring Artery",
            "origin_coords": [12.9170, 77.6230],
            "dest_coords": [13.0350, 77.5970],
            "daily_trips": 48200,
            "transit_share": "42%",
            "avg_traversal_mins": 84,
            "corridor": "500-D"
        },
        {
            "origin": "Majestic Central Terminal",
            "destination": "ITPL Whitefield Tech Hub",
            "origin_coords": [12.9770, 77.5720],
            "dest_coords": [12.9850, 77.7310],
            "daily_trips": 39500,
            "transit_share": "48%",
            "avg_traversal_mins": 62,
            "corridor": "335-E"
        },
        {
            "origin": "Electronic City Gate 1",
            "destination": "BIAL Kempegowda Airport",
            "origin_coords": [12.8450, 77.6630],
            "dest_coords": [13.1980, 77.7060],
            "daily_trips": 18400,
            "transit_share": "31%",
            "avg_traversal_mins": 95,
            "corridor": "KIA-8"
        },
        {
            "origin": "Banashankari Ring Junction",
            "destination": "Domlur Flyover Core",
            "origin_coords": [12.9250, 77.5750],
            "dest_coords": [12.9620, 77.6380],
            "daily_trips": 22100,
            "transit_share": "39%",
            "avg_traversal_mins": 44,
            "corridor": "201-R"
        }
    ]
