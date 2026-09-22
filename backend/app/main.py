import os
import time
import uuid
import asyncio
from typing import Callable
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.data.seed_data import seed_database
from backend.app.services.connection_manager import manager
from backend.app.routers import (
    auth, events, incidents, work_orders, fleet, traffic, assistant, simulate, websocket
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NagarNetra: Mobile Bus Sensor Fusion Urban Intelligence Platform"
)

# CORS Middleware with environment-specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory Rate Limiting Bucket
rate_limit_records = {}

# 1. Security Headers, Request ID & Rate Limiting Middleware
@app.middleware("http")
async def security_and_telemetry_middleware(request: Request, call_next: Callable):
    # Request Correlation ID
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    
    # Request Size Validation
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": f"Payload size exceeds allowed maximum of {settings.MAX_REQUEST_BODY_BYTES} bytes."}
        )

    # In-memory Rate Limiting (per client IP)
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip != "127.0.0.1" and client_ip != "localhost":
        history = rate_limit_records.get(client_ip, [])
        history = [t for t in history if now - t < 60.0]
        if len(history) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please throttle telemetry frequency."}
            )
        history.append(now)
        rate_limit_records[client_ip] = history

    # Process request
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000.0

    # Attach Security Headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Server-Timing"] = f"total;dur={round(duration_ms, 2)}"

    return response

# Startup lifecycle
@app.on_event("startup")
async def startup_event():
    manager.set_event_loop(asyncio.get_running_loop())
    Base.metadata.create_all(bind=engine)
    seed_database()

# Include Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(incidents.router)
app.include_router(work_orders.router)
app.include_router(fleet.router)
app.include_router(traffic.router)
app.include_router(assistant.router)
app.include_router(simulate.router)
app.include_router(websocket.router)

# Observability: Liveness & Readiness Probes
@app.get("/healthz")
def liveness_probe():
    return {
        "status": "ok",
        "service": "nagarnetra-backend",
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/readyz")
def readiness_probe():
    try:
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {
            "status": "ready",
            "database": "connected",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "error": str(e)}
        )

# Observability: Prometheus Metrics Endpoint
@app.get("/metrics", response_class=PlainTextResponse)
def prometheus_metrics():
    db = SessionLocal()
    from backend.app.models.schema import Detection, Incident, WorkOrder, Device
    detections_count = db.query(Detection).count()
    incidents_count = db.query(Incident).count()
    work_orders_count = db.query(WorkOrder).count()
    devices_count = db.query(Device).count()
    active_ws = len(manager.active_connections)
    db.close()

    metrics = [
        "# HELP nagarnetra_detections_total Total number of edge detections ingested",
        "# TYPE nagarnetra_detections_total counter",
        f"nagarnetra_detections_total {detections_count}",
        "# HELP nagarnetra_incidents_total Total number of deduplicated incidents",
        "# TYPE nagarnetra_incidents_total gauge",
        f"nagarnetra_incidents_total {incidents_count}",
        "# HELP nagarnetra_work_orders_total Total civic infrastructure work orders",
        "# TYPE nagarnetra_work_orders_total gauge",
        f"nagarnetra_work_orders_total {work_orders_count}",
        "# HELP nagarnetra_active_devices Registered active edge camera nodes",
        "# TYPE nagarnetra_active_devices gauge",
        f"nagarnetra_active_devices {devices_count}",
        "# HELP nagarnetra_websocket_subscribers Active connected WebSocket clients",
        "# TYPE nagarnetra_websocket_subscribers gauge",
        f"nagarnetra_websocket_subscribers {active_ws}",
    ]
    return "\n".join(metrics) + "\n"

@app.get("/")
def root_info():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "city": settings.CITY_NAME,
        "state": settings.STATE_NAME,
        "authority": settings.MUNICIPAL_AUTHORITY,
        "environment": settings.ENVIRONMENT,
        "telemetry_grid": f"{settings.MUNICIPAL_AUTHORITY} Smart Urban Mobility Telemetry v4.2"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
