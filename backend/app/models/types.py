from enum import Enum

class IncidentState(str, Enum):
    CANDIDATE = "candidate"
    CONFIRMED = "confirmed"
    TICKETED = "ticketed"
    FIXED_PENDING_VERIF = "fixed_pending_verif"
    VERIFIED_CLOSED = "verified_closed"
    REOPENED = "reopened"
    DISMISSED = "dismissed"

class IncidentType(str, Enum):
    ROAD_DEFECT = "road_defect"
    SAFETY_HAZARD = "safety_hazard"
    ASSET_MISSING = "asset_missing"
    WATERLOGGING = "waterlogging"

class WorkOrderState(str, Enum):
    OPEN_UNASSIGNED = "open_unassigned"
    ASSIGNED_IN_PROGRESS = "assigned_in_progress"
    FIXED_PENDING_VERIF = "fixed_pending_verif"
    VERIFIED_CLOSED = "verified_closed"

class PriorityLevel(str, Enum):
    P1_CRITICAL = "P1_CRITICAL"
    P2_MAJOR = "P2_MAJOR"
    P3_MINOR = "P3_MINOR"

class DefectClass(str, Enum):
    D40 = "D40"                   # Critical Pothole
    D20 = "D20"                   # Alligator Crack
    D10 = "D10"                   # Longitudinal Crack
    D00 = "D00"                   # Transverse Crack
    REBAR_DEFECT = "rebar_defect" # Exposed Rebar
    SUNKEN_GRATE = "sunken_grate" # Storm Drain Grate
    CRASH_BARRIER = "crash_barrier"
    WATERLOGGING = "waterlogging"
    VEHICLE_INCURSION = "vehicle_incursion"
    MISSING_ZEBRA = "missing_zebra"
    DAMAGED_SIGN = "damaged_sign"

class DataSource(str, Enum):
    REAL = "real"
    SIM = "sim"
