import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_healthz_endpoint():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert data.get("database") == "connected"
    assert "version" in data

def test_readyz_endpoint():
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json().get("status") == "ready"

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    text = response.text
    assert "nagarnetra_detections_total" in text
    assert "nagarnetra_incidents_total" in text
    assert "nagarnetra_work_orders_total" in text

def test_security_headers_present():
    response = client.get("/healthz")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") in ["SAMEORIGIN", "DENY"]
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-Request-ID" in response.headers
