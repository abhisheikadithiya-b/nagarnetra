#!/usr/bin/env python
"""
NagarNetra Synthetic Load Test Script
Simulates 50 concurrent BMTC buses transmitting HMAC-signed telemetry
and optical road defect sightings to the FastAPI ingestion hub.
Measures throughput, error rate, p50, and p95 latency.
"""

import time
import json
import random
import statistics
import concurrent.futures
import urllib.request
import urllib.error
import sys
import os
sys.path.insert(0, os.path.abspath("."))
from backend.app.services.crypto import generate_ulid, compute_payload_string, generate_hmac_signature

API_URL = "http://localhost:8000/v1/events"
SECRET = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
TOTAL_REQUESTS = 100
CONCURRENCY = 10

def generate_bus_event(bus_idx: int) -> dict:
    bus_id = f"BMTC-KA-01-F-{9400 + (bus_idx % 20)}"
    # Bengaluru Outer Ring Road coordinates
    base_lat = 12.9352 + (random.random() - 0.5) * 0.05
    base_lon = 77.6245 + (random.random() - 0.5) * 0.05

    event = {
        "id": generate_ulid(),
        "dev": bus_id,
        "kid": "KID-2026-PRIMARY",
        "t": int(time.time()),
        "lat": round(base_lat, 6),
        "lon": round(base_lon, 6),
        "hdg": round(random.uniform(0, 360), 1),
        "acc": 3.2,
        "cls": random.choice(["D40", "rebar_defect", "sunken_grate", "trench"]),
        "conf": round(random.uniform(0.82, 0.98), 3),
        "severity": random.choice([2, 3, 4, 5]),
        "imu_z": round(random.uniform(0.4, 1.8), 2),
        "size_m2": round(random.uniform(0.1, 0.8), 2),
        "track_id": f"TRK-{random.randint(100, 999)}",
        "snap_hash": "sha256_synthetic_evidence_hash",
        "source": "sim"
    }
    payload_str = compute_payload_string(event)
    event["sig"] = generate_hmac_signature(payload_str, SECRET)
    return event

def send_request(req_idx: int) -> tuple[bool, float, int, str]:
    event = generate_bus_event(req_idx)
    data = json.dumps(event).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Request-ID": f"loadtest-{req_idx}"
        }
    )

    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            elapsed = (time.perf_counter() - start) * 1000.0
            return True, elapsed, resp.status, ""
    except urllib.error.HTTPError as e:
        elapsed = (time.perf_counter() - start) * 1000.0
        return False, elapsed, e.code, e.reason
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000.0
        return False, elapsed, 0, str(e)

def run_load_test():
    print(f"[NagarNetra Load Test] Starting {TOTAL_REQUESTS} requests across {CONCURRENCY} worker threads...")
    latencies = []
    successes = 0
    failures = 0

    wall_start = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(send_request, i) for i in range(TOTAL_REQUESTS)]
        for f in concurrent.futures.as_completed(futures):
            ok, lat, code, err = f.result()
            latencies.append(lat)
            if ok:
                successes += 1
            else:
                failures += 1

    total_time = time.perf_counter() - wall_start
    rps = TOTAL_REQUESTS / total_time

    latencies.sort()
    p50 = statistics.median(latencies)
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0

    print("\n--- Load Test Results ---")
    print(f"Total Requests: {TOTAL_REQUESTS}")
    print(f"Concurrency:    {CONCURRENCY}")
    print(f"Success Rate:   {successes}/{TOTAL_REQUESTS} ({(successes/TOTAL_REQUESTS)*100:.1f}%)")
    print(f"Throughput:     {rps:.1f} req/sec")
    print(f"Latency Avg:    {statistics.mean(latencies):.1f} ms")
    print(f"Latency p50:    {p50:.1f} ms")
    print(f"Latency p95:    {p95:.1f} ms")
    print(f"Latency Min:    {min(latencies):.1f} ms")
    print(f"Latency Max:    {max(latencies):.1f} ms")

if __name__ == "__main__":
    run_load_test()
