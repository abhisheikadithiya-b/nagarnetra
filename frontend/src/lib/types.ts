export interface EvidenceStep {
  step_num: string;
  title: string;
  timestamp_str: string;
  description: string;
  sha_hash: string;
  pki_cert: string;
  verified: boolean;
}

export interface Incident {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  ward: string;
  zone: string;
  lat: number;
  lon: number;
  state: string;
  priority_level: string;
  evidence_conf: number;
  priority: number;
  priority_s: number;
  priority_e: number;
  priority_v: number;
  priority_a: number;
  first_seen: string;
  last_seen: string;
  n_buses: number;
  sightings_count: number;
  clean_pass_count: number;
  clean_passes_required: number;
  depth_cm: number;
  image_url: string;
  source: string;
  plate_number?: string;
  plate_conf?: number;
  plate_alternatives?: string;
  vehicle_classification?: string;
  trajectory_vector?: string;
  environmental_telemetry?: string;
  chain_of_custody_hash?: string;
  evidence_steps?: EvidenceStep[];
}

export interface WorkOrder {
  id: string;
  incident_id?: string;
  title: string;
  description: string;
  state: 'open_unassigned' | 'assigned_in_progress' | 'fixed_pending_verif' | 'verified_closed';
  severity: 'P1_CRITICAL' | 'P2_MAJOR' | 'P3_MINOR';
  assigned_to: string;
  ward: string;
  location_desc: string;
  sla_hours: number;
  created_at: string;
  sla_due: string;
  breached: boolean;
  remaining_time_str: string;
  passes_completed: number;
  passes_total: number;
  repair_progress_pct: number;
  auto_verified: boolean;
  verified_at?: string;
  acceleration_delta: string;
  image_url: string;
  repair_image_url?: string;
  source: string;
}

export interface Bus {
  id: string;
  plate_number: string;
  route_id: string;
  node_id: string;
  pilot_name: string;
  model: string;
  depot: string;
  status: string;
  fps: number;
  latency_ms: number;
  sync_lag_s: number;
  current_lat: number;
  current_lon: number;
  speed_kmh: number;
  heading: number;
  vibration_iri: number;
  battery_pct: number;
  temperature_c: number;
  queue_depth: number;
  bytes_today_kb: number;
}

export interface RouteItem {
  id: string;
  name: string;
  corridor_name: string;
  total_km: number;
  nominal_buses: number;
  sensor_status_text: string;
  status: string;
  schedule_latency_min: string;
  route_fidelity: string;
  headway_gap: string;
  peak_hour_delay_min: string;
}

export interface FleetStatus {
  active_mesh_str: string;
  active_mesh_pct: number;
  nominal_buses: number;
  nominal_pct: number;
  delayed_buses: number;
  delayed_avg_mins: string;
  sensor_offline: number;
  active_units: number;
  kpis: {
    optical_sync_latency_sec: number;
    daily_km_scanned: number;
    roadway_audited_km: number;
    active_ai_defects: number;
    today_defects: number;
    today_wards: number;
    p1_critical_count: number;
  };
}

export interface CongestionSegment {
  segment_id: string;
  name: string;
  corridor: string;
  observed_speed_kmh: number;
  free_flow_speed_kmh: number;
  congestion_index: number;
  status: string;
  density_pcu_per_km: number;
  delay_minutes: number;
  contributing_factors: string[];
  coords: number[][];
}
