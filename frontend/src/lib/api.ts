/**
 * NagarNetra Central API & Real-time WebSocket Client
 * Production client with JWT Bearer authentication, RBAC role-switching,
 * exponential-backoff WebSocket reconnection, and Data Mode isolation.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const WS_BASE = API_BASE 
  ? API_BASE.replace(/^http/, 'ws') 
  : (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` : 'ws://localhost:8000');

// Local storage keys
const TOKEN_KEY = 'nagarnetra_auth_token';
const ROLE_KEY = 'nagarnetra_auth_role';
const USER_KEY = 'nagarnetra_auth_user';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, role?: string, user?: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentRole(): string {
  if (typeof window === 'undefined') return 'Viewer';
  return localStorage.getItem(ROLE_KEY) || 'Viewer';
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication Endpoints
export async function loginPilot(role: string = 'Incident Officer') {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to obtain pilot role token');
    const data = await res.json();
    setAuthToken(data.access_token, data.role, data.user);
    return data;
  } catch (err) {
    console.warn('[API] Role switch error, running in guest/viewer mode:', err);
    return null;
  }
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/v1/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Incidents & Priority Queue
export async function fetchIncidents(params?: {
  ward?: string;
  priority_level?: string;
  source?: string;
  data_mode?: 'live' | 'real' | 'demo' | 'sim' | 'all';
}) {
  const query = new URLSearchParams();
  if (params?.ward) query.set('ward', params.ward);
  if (params?.priority_level) query.set('priority_level', params.priority_level);
  if (params?.source) query.set('source', params.source);
  if (params?.data_mode) {
    query.set('data_mode', params.data_mode === 'live' ? 'real' : params.data_mode);
  }

  const res = await fetch(`${API_BASE}/v1/incidents?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncident(id: string) {
  const res = await fetch(`${API_BASE}/v1/incidents/${id}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch incident');
  return res.json();
}

export async function postIncidentAction(id: string, action: string, reason?: string) {
  const res = await fetch(`${API_BASE}/v1/incidents/${id}/action`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, reason, operator_id: '#DESHMUKH-88' }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to execute officer action (insufficient role permissions)');
  }
  return res.json();
}

// Work Orders
export async function fetchWorkOrders(params?: {
  state?: string;
  severity?: string;
  ward?: string;
  data_mode?: 'live' | 'real' | 'demo' | 'sim' | 'all';
}) {
  const query = new URLSearchParams();
  if (params?.state) query.set('state', params.state);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.ward) query.set('ward', params.ward);
  if (params?.data_mode) {
    query.set('data_mode', params.data_mode === 'live' ? 'real' : params.data_mode);
  }

  const res = await fetch(`${API_BASE}/v1/work-orders?${query.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch work orders');
  return res.json();
}

export async function updateWorkOrder(id: string, data: any) {
  const res = await fetch(`${API_BASE}/v1/work-orders/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to update work order');
  }
  return res.json();
}

// Fleet Status & Corridors
export async function fetchFleetStatus() {
  const res = await fetch(`${API_BASE}/v1/fleet/status`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch fleet status');
  return res.json();
}

export async function fetchCorridors() {
  const res = await fetch(`${API_BASE}/v1/fleet/corridors`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch corridors');
  return res.json();
}

export async function fetchCorridorTelemetry(routeId: string) {
  const res = await fetch(`${API_BASE}/v1/fleet/corridor/${routeId}/telemetry`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch corridor telemetry');
  return res.json();
}

export async function fetchEdgeNodes() {
  const res = await fetch(`${API_BASE}/v1/fleet/edge-nodes`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch edge nodes');
  return res.json();
}

export async function fetchCongestionSegments() {
  const res = await fetch(`${API_BASE}/v1/segments/congestion`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch congestion segments');
  return res.json();
}

export async function fetchODFlows() {
  const res = await fetch(`${API_BASE}/v1/traffic/od-flows`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch OD flows');
  return res.json();
}

export async function postAssistantChat(query: string) {
  const res = await fetch(`${API_BASE}/v1/assistant/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Assistant query failed');
  return res.json();
}

export async function postScenario(scenario: string) {
  const res = await fetch(`${API_BASE}/v1/simulate/scenario`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Scenario trigger failed');
  }
  return res.json();
}

export function getWorkOrderPdfUrl(id: string) {
  return `${API_BASE}/v1/work-orders/${id}/pdf`;
}

export function getPoliceReportPdfUrl(incidentId: string) {
  return `${API_BASE}/v1/incidents/${incidentId}/police-report`;
}

/**
 * Resilient WebSocket Client with Heartbeats & Exponential Backoff Reconnection
 */
export function connectRealtimeWebSocket(
  onMessage: (data: any) => void,
  onStatusChange?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void
): () => void {
  let ws: WebSocket | null = null;
  let retryCount = 0;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let isClosedExplicitly = false;

  function connect() {
    if (isClosedExplicitly) return;
    onStatusChange?.(retryCount === 0 ? 'connecting' : 'reconnecting');

    const token = getAuthToken();
    const wsUrl = token ? `${WS_BASE}/ws?token=${encodeURIComponent(token)}` : `${WS_BASE}/ws`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retryCount = 0;
        onStatusChange?.('connected');
        // Heartbeat ping every 25s to keep NAT/firewall open
        heartbeatTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage(parsed);
        } catch {
          // Non-json payload
        }
      };

      ws.onclose = () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (!isClosedExplicitly) {
          onStatusChange?.('reconnecting');
          const delay = Math.min(30000, 1000 * Math.pow(2, retryCount));
          retryCount++;
          reconnectTimer = setTimeout(connect, delay);
        } else {
          onStatusChange?.('disconnected');
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    } catch {
      const delay = Math.min(30000, 1000 * Math.pow(2, retryCount));
      retryCount++;
      reconnectTimer = setTimeout(connect, delay);
    }
  }

  connect();

  return () => {
    isClosedExplicitly = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}
