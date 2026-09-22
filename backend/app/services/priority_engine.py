from backend.app.models.types import DefectClass

CLASS_SEVERITY_MAP = {
    DefectClass.D40: 4.5,
    DefectClass.REBAR_DEFECT: 4.8,
    DefectClass.CRASH_BARRIER: 4.2,
    DefectClass.SUNKEN_GRATE: 4.0,
    DefectClass.VEHICLE_INCURSION: 4.8,
    DefectClass.WATERLOGGING: 3.8,
    DefectClass.MISSING_ZEBRA: 3.5,
    DefectClass.D20: 3.0,
    DefectClass.DAMAGED_SIGN: 2.5,
    DefectClass.D10: 2.0,
    DefectClass.D00: 1.5,
}

def calculate_priority(
    defect_cls: str,
    conf: float,
    size_m2: float = 0.12,
    sightings: int = 1,
    near_hospital: bool = False,
    near_school: bool = False,
    high_pedestrian: bool = True,
    days_open: float = 0.5,
    sla_days: float = 2.0,
    density_pcu: float = 4800.0,
    corridor_max_pcu: float = 6000.0
) -> dict:
    """
    Computes explainable 4-factor risk score: P = S x E x V x A
    Returns dict with raw P, normalized 0-100 score, and individual components.
    """
    # 1. Severity S (1.0 to 5.0)
    base_s = CLASS_SEVERITY_MAP.get(defect_cls, 3.0)
    # Scale with confidence and size
    size_multiplier = min(1.3, max(0.8, 1.0 + (size_m2 - 0.1) * 0.5))
    s_raw = base_s * conf * size_multiplier
    s_score = round(min(5.0, max(1.0, s_raw)), 2)
    s_norm = round(min(1.0, max(0.2, s_score / 5.0)), 2)

    # 2. Exposure E (0.5 to 2.0)
    bus_passes_factor = min(1.0, sightings / 15.0)
    traffic_density_factor = min(1.0, density_pcu / corridor_max_pcu)
    e_raw = 0.5 + (0.5 * bus_passes_factor + 0.5 * traffic_density_factor) * 1.5
    e_score = round(min(2.0, max(0.5, e_raw)), 2)
    e_norm = round(min(1.0, max(0.25, e_score / 2.0)), 2)

    # 3. Vulnerability V (1.0 to 2.5)
    v_raw = 1.0
    if near_hospital:
        v_raw += 0.5
    if near_school:
        v_raw += 0.5
    if high_pedestrian:
        v_raw += 0.25
    v_score = round(min(2.5, max(1.0, v_raw)), 2)
    v_norm = round(min(1.0, max(0.4, v_score / 2.5)), 2)

    # 4. Age A (1.0 to 3.0)
    a_raw = 1.0 + (days_open / max(0.5, sla_days))
    a_score = round(min(3.0, max(1.0, a_raw)), 2)
    a_norm = round(min(1.0, max(0.33, a_score / 3.0)), 2)

    # Combined raw product: P = S x E x V x A
    # Maximum possible product = 5.0 * 2.0 * 2.5 * 3.0 = 75.0
    # Rescale to 0-100 percentile rank:
    p_product = s_score * e_score * v_score * a_score
    p_percentile = round(min(99.9, max(10.0, (p_product / 75.0) * 100.0)), 1)

    # Priority Level tier
    if p_percentile >= 75.0 or s_score >= 4.0:
        level = "P1_CRITICAL"
    elif p_percentile >= 45.0:
        level = "P2_MAJOR"
    else:
        level = "P3_MINOR"

    return {
        "priority_score": p_percentile,
        "priority_level": level,
        "product_raw": round(p_product, 2),
        "s_score": s_score,
        "s_norm": s_norm,
        "e_score": e_score,
        "e_norm": e_norm,
        "v_score": v_score,
        "v_norm": v_norm,
        "a_score": a_score,
        "a_norm": a_norm
    }
