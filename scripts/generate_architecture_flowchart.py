import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_flowchart():
    width = 3400
    height = 2200
    
    # Create high-res canvas with deep dark tech background
    img = Image.new("RGBA", (width, height), (11, 15, 25, 255))
    draw = ImageDraw.Draw(img)

    # Load Fonts
    font_path = "C:/Windows/Fonts/segoeui.ttf"
    font_bold_path = "C:/Windows/Fonts/segoeuib.ttf"
    font_mono_path = "C:/Windows/Fonts/consola.ttf"
    
    def get_font(path, size):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            return ImageFont.load_default()

    f_title = get_font(font_bold_path, 48)
    f_sub = get_font(font_path, 22)
    f_badge = get_font(font_bold_path, 17)
    f_box_title = get_font(font_bold_path, 28)
    f_box_sub = get_font(font_path, 18)
    f_body = get_font(font_path, 20)
    f_bold = get_font(font_bold_path, 20)
    f_mono = get_font(font_mono_path, 18)
    f_arrow = get_font(font_bold_path, 17)
    f_footer = get_font(font_path, 18)

    # Background subtle grid pattern
    grid_color = (25, 33, 50, 70)
    for x in range(0, width, 80):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 80):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)

    # Header Section
    for i in range(12):
        draw.line([(0, i), (width, i)], fill=(14, 165, 233, 255 - i * 18), width=1)

    draw.text((80, 48), "NAGARNETRA • COMPLETE SYSTEM ARCHITECTURE & CALL FLOWCHART", fill=(248, 250, 252), font=f_title)
    draw.text((80, 114), "Greater Chennai Corporation (GCC) & Metropolitan Transport Corporation (MTC) Pilot • Full-Stack Urban Bus AI Intelligence Grid", fill=(148, 163, 184), font=f_sub)

    # Badges
    badges = [
        ("DPDP ACT 2023 COMPLIANT", (16, 185, 129)),
        ("BILINGUAL: TAMIL + ENGLISH (TA / EN)", (56, 189, 248)),
        ("ZERO HUMAN INSPECTOR VERIFICATION", (245, 158, 11)),
        ("WORM MERKLE AUDIT LEDGER", (168, 85, 247)),
        ("EDGE NEURAL LATENCY < 250ms", (236, 72, 153))
    ]
    bx = 80
    by = 162
    for text, col in badges:
        bbox = f_badge.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        bw = tw + 32
        bh = 36
        draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=18, fill=(col[0]//6, col[1]//6, col[2]//6, 220), outline=col, width=2)
        draw.ellipse([bx + 10, by + 13, bx + 20, by + 23], fill=col)
        draw.text((bx + 26, by + 7), text, fill=(241, 245, 249), font=f_badge)
        bx += bw + 16

    # Function to draw cards
    def draw_card(x, y, w, h, title, subtitle, accent_col, items):
        # Outer glow
        draw.rounded_rectangle([x-3, y-3, x+w+3, y+h+3], radius=18, fill=(accent_col[0]//6, accent_col[1]//6, accent_col[2]//6, 90), outline=(accent_col[0], accent_col[1], accent_col[2], 140), width=2)
        # Main card
        draw.rounded_rectangle([x, y, x+w, y+h], radius=16, fill=(15, 23, 42, 245), outline=(accent_col[0], accent_col[1], accent_col[2], 255), width=2)
        
        # Header banner
        draw.rounded_rectangle([x+1, y+1, x+w-1, y+82], radius=16, fill=(accent_col[0]//4, accent_col[1]//4, accent_col[2]//4, 200))
        draw.rectangle([x+1, y+60, x+w-1, y+82], fill=(accent_col[0]//4, accent_col[1]//4, accent_col[2]//4, 200))
        draw.line([(x, y+82), (x+w, y+82)], fill=accent_col, width=2)

        # Title
        draw.text((x+25, y+15), title, fill=(255, 255, 255), font=f_box_title)
        draw.text((x+25, y+52), subtitle, fill=(148, 163, 184), font=f_box_sub)

        # Content
        curr_y = y + 104
        for item in items:
            itype = item[0]
            if itype == "bullet":
                label, val, col = item[1], item[2], item[3]
                draw.ellipse([x+25, curr_y+6, x+35, curr_y+16], fill=accent_col)
                draw.text((x+45, curr_y), label + ": ", fill=(226, 232, 240), font=f_bold)
                lw = f_bold.getbbox(label + ": ")[2] - f_bold.getbbox(label + ": ")[0]
                draw.text((x+45+lw, curr_y), val, fill=col, font=f_body)
                curr_y += 37
            elif itype == "code":
                code_text = item[1]
                draw.rounded_rectangle([x+25, curr_y, x+w-25, curr_y+44], radius=8, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
                draw.text((x+38, curr_y+11), code_text, fill=(56, 189, 248), font=f_mono)
                curr_y += 56
            elif itype == "formula":
                form_text = item[1]
                draw.rounded_rectangle([x+25, curr_y, x+w-25, curr_y+46], radius=8, fill=(24, 24, 27, 255), outline=(234, 179, 8, 200), width=1)
                draw.text((x+38, curr_y+11), form_text, fill=(250, 204, 21), font=f_mono)
                curr_y += 58
            elif itype == "pill_row":
                pills = item[1]
                px = x + 25
                for ptext, pcol in pills:
                    pbbox = f_badge.getbbox(ptext)
                    pw = (pbbox[2] - pbbox[0]) + 24
                    draw.rounded_rectangle([px, curr_y, px + pw, curr_y + 32], radius=16, fill=(pcol[0]//6, pcol[1]//6, pcol[2]//6, 220), outline=pcol, width=1)
                    draw.text((px + 12, curr_y + 6), ptext, fill=(241, 245, 249), font=f_badge)
                    px += pw + 12
                curr_y += 46
            elif itype == "spacer":
                curr_y += item[1]

    # Helper function for directional arrows
    def draw_arrow(start, end, label, method="", accent_col=(56, 189, 248)):
        x1, y1 = start
        x2, y2 = end
        draw.line([start, end], fill=accent_col, width=4)
        
        angle = math.atan2(y2 - y1, x2 - x1)
        arrow_len = 16
        arrow_angle = math.pi / 6
        ax1 = x2 - arrow_len * math.cos(angle - arrow_angle)
        ay1 = y2 - arrow_len * math.sin(angle - arrow_angle)
        ax2 = x2 - arrow_len * math.cos(angle + arrow_angle)
        ay2 = y2 - arrow_len * math.sin(angle + arrow_angle)
        draw.polygon([(x2, y2), (ax1, ay1), (ax2, ay2)], fill=accent_col)

        if label or method:
            mx = (x1 + x2) / 2
            my = (y1 + y2) / 2
            full_text = f"{method} {label}".strip()
            bbox = f_arrow.getbbox(full_text)
            bw = (bbox[2] - bbox[0]) + 28
            bh = 34
            bx1 = mx - bw / 2
            by1 = my - bh / 2
            draw.rounded_rectangle([bx1, by1, bx1 + bw, by1 + bh], radius=8, fill=(15, 23, 42, 245), outline=accent_col, width=2)
            if method:
                mw = f_arrow.getbbox(method + " ")[2] - f_arrow.getbbox(method + " ")[0]
                draw.text((bx1 + 14, by1 + 7), method, fill=(251, 146, 60), font=f_arrow)
                draw.text((bx1 + 14 + mw, by1 + 7), label, fill=(241, 245, 249), font=f_arrow)
            else:
                draw.text((bx1 + 14, by1 + 7), label, fill=(241, 245, 249), font=f_arrow)

    # Coordinate setup
    card_w = 980
    card_h = 920
    row1_y = 230
    row2_y = 1200
    col1_x = 80
    col2_x = 1210
    col3_x = 2340

    # -------------------------------------------------------------
    # CARD 1: EDGE MOBILE SENSOR NODE
    # -------------------------------------------------------------
    c1_items = [
        ("bullet", "Hardware Ingestion", "1080p@60fps Camera + IMU (100Hz) + GPS (10Hz)", (248, 250, 252)),
        ("bullet", "DPDP Act 2023 Blur", "In-RAM face/bystander privacy obfuscation (Zero disk raw leak)", (52, 211, 153)),
        ("bullet", "Neural Detectors", "YOLO-v11-Urban INT8 (Road Cavities, Rutting, Obstacles)", (56, 189, 248)),
        ("bullet", "Object Tracker", "ByteTrack: spatio-temporal trajectory, speed & Kalman tracking", (226, 232, 240)),
        ("bullet", "Selective ANPR", "Triggered ONLY on flagged high-hazard vehicle incursions", (251, 146, 60)),
        ("spacer", 8),
        ("code", "EVENT PACKET: ~250 B JSON Telemetry + 15 KB Blurred Evidence JPEG"),
        ("spacer", 8),
        ("bullet", "Hardware Signing", "Hardware TPM v2.0 / KeyStore HMAC-SHA256 signature", (168, 85, 247)),
        ("bullet", "Store & Forward", "SQLite queue: offline resilient store-and-forward via 5G MQTT/HTTP", (148, 163, 184)),
        ("bullet", "RAM Ring Buffer", "10-second rolling ring buffer: clip only leaves phone upon hub request", (251, 113, 133)),
        ("spacer", 8),
        ("code", "POST /v1/events/ingest | Headers: X-Device-ID, X-Signature-256, X-Key-ID"),
        ("spacer", 10),
        ("pill_row", [("PWA Edge Node", (14, 165, 233)), ("TPM v2.0 Signed", (168, 85, 247)), ("RAM Blur", (16, 185, 129))])
    ]
    draw_card(col1_x, row1_y, card_w, card_h, "1. EDGE MOBILE SENSOR NODE", "Driver Phone PWA Mount • On-Device AI • No Custom Hardware Needed", (14, 165, 233), c1_items)

    # -------------------------------------------------------------
    # CARD 2: GATEWAY & CRYPTOGRAPHIC INGESTION
    # -------------------------------------------------------------
    c2_items = [
        ("bullet", "Security Middleware", "Max body size < 1MB, IP rate limiter < 120 req/min, X-Request-ID", (248, 250, 252)),
        ("bullet", "Timestamp Freshness", "|t_now - t_event| <= 300s (Strict replay attack defense)", (245, 158, 11)),
        ("bullet", "Chennai Geofence", "12.80N - 13.35N | 79.95E - 80.40E (Greater Chennai Corporation Bounds)", (52, 211, 153)),
        ("bullet", "Device Verification", "verify_device_credentials() HMAC-SHA256 with 24h key rotation grace", (168, 85, 247)),
        ("bullet", "Kinematics Check", "Drop GPS teleportation if speed delta > 130 km/h", (251, 113, 133)),
        ("spacer", 8),
        ("code", "WORM AUDIT LEDGER: Compute Merkle Root Hash (e5a019ff88bc...)"),
        ("spacer", 8),
        ("bullet", "Observability Probes", "Prometheus Metrics (/metrics), Liveness (/healthz), Readiness (/readyz)", (56, 189, 248)),
        ("bullet", "Role-Based Auth", "JWT Bearer tokens: Admin, Incident Officer, Transport Planner, Viewer", (226, 232, 240)),
        ("bullet", "Strict Data Tiers", "Complete isolation between LIVE, DEMO, and SIMULATION records", (250, 204, 21)),
        ("spacer", 8),
        ("code", "POST /v1/auth/login | GET /v1/auth/me | GET /healthz | GET /readyz"),
        ("spacer", 10),
        ("pill_row", [("FastAPI Hub", (124, 58, 237)), ("HMAC-SHA256", (245, 158, 11)), ("JWT RBAC", (56, 189, 248))])
    ]
    draw_card(col2_x, row1_y, card_w, card_h, "2. GATEWAY & CRYPTOGRAPHIC INGESTION", "FastAPI Core Gateway • Key Rotation • Replay & Geofence Filters", (124, 58, 237), c2_items)

    # -------------------------------------------------------------
    # CARD 3: GIS SNAPPING & MULTI-BUS FUSION
    # -------------------------------------------------------------
    c3_items = [
        ("bullet", "OSM Map Snapping", "geo_snapper.py: Haversine projection to GCC arterial road network", (56, 189, 248)),
        ("bullet", "MTC Corridors", "570 (OMR), 21G (Anna Salai), 102 (ECR), 29C (Inner Radial)", (248, 250, 252)),
        ("bullet", "DBSCAN Clustering", "Eps = 35m spatial radius, temporal deduplication window = 72 hours", (52, 211, 153)),
        ("bullet", "Sighting Fusion", "Fuses thousands of bus passes into 1 single master incident ticket", (251, 146, 60)),
        ("spacer", 6),
        ("formula", "NOISY-OR CONFIDENCE: P_fused = 1 - PROD(1 - c_i) >= 0.90"),
        ("spacer", 6),
        ("formula", "PRIORITY SCORE = 100 * (0.35*S + 0.25*E + 0.20*V + 0.20*A)"),
        ("spacer", 6),
        ("bullet", "Score Factors", "S: Severity, E: Exposure (PCU), V: Vulnerability, A: Age decay", (226, 232, 240)),
        ("bullet", "State Machine", "CANDIDATE -> CONFIRMED -> TICKETED (Auto-Ticket Generation)", (236, 72, 153)),
        ("spacer", 8),
        ("code", "GET /v1/incidents | GET /v1/incidents/{id} | POST /v1/incidents/{id}/action"),
        ("spacer", 10),
        ("pill_row", [("DBSCAN Clustered", (16, 185, 129)), ("Noisy-OR Fusion", (250, 204, 21)), ("Dynamic Risk Rank", (236, 72, 153))])
    ]
    draw_card(col3_x, row1_y, card_w, card_h, "3. GIS SNAPPING & MULTI-BUS FUSION", "DBSCAN Clustering • Noisy-OR Fusion • Dynamic Risk Ranking Formula", (16, 185, 129), c3_items)

    # Connecting Arrows Row 1
    draw_arrow((col1_x + card_w, row1_y + 440), (col2_x, row1_y + 440), "events/ingest", "POST", (14, 165, 233))
    draw_arrow((col2_x + card_w, row1_y + 440), (col3_x, row1_y + 440), "Snapped Coordinates", "STREAM", (124, 58, 237))

    # -------------------------------------------------------------
    # CARD 4: CIVIC WORK ORDERS & DISPATCH KANBAN
    # -------------------------------------------------------------
    c4_items = [
        ("bullet", "Auto-Ticket Creation", "Auto-generated when Severity = P1_CRITICAL or Priority >= 75", (248, 250, 252)),
        ("bullet", "Kanban Column 1", "OPEN_UNASSIGNED: SLA countdown timer (24h / 48h / 72h)", (239, 68, 68)),
        ("bullet", "Kanban Column 2", "ASSIGNED_IN_PROGRESS: Assigned to GCC Road Squad (e.g., Team B)", (245, 158, 11)),
        ("bullet", "Kanban Column 3", "FIXED_PENDING_VERIF: Contractor finished physical repair", (56, 189, 248)),
        ("bullet", "Kanban Column 4", "VERIFIED_CLOSED: Autonomous sign-off by subsequent bus passes", (52, 211, 153)),
        ("spacer", 8),
        ("code", "PATCH /v1/work-orders/{id}/assign | Complete Repair Hook"),
        ("spacer", 8),
        ("bullet", "GCC Formal PDF", "Greater Chennai Corporation stamped work order with token", (168, 85, 247)),
        ("bullet", "Police Audit PDF", "Greater Chennai Traffic Police report with plate evidence & Merkle root", (251, 113, 133)),
        ("spacer", 8),
        ("code", "GET /v1/work-orders/{id}/pdf | GET /v1/incidents/{id}/police-report"),
        ("spacer", 10),
        ("pill_row", [("Kanban Dispatch", (245, 158, 11)), ("SLA Tracking", (239, 68, 68)), ("PDF Generation", (168, 85, 247))])
    ]
    draw_card(col1_x, row2_y, card_w, card_h, "4. CIVIC WORK ORDERS & KANBAN DISPATCH", "Greater Chennai Corporation Directorate • Autonomous SLA Tracking", (245, 158, 11), c4_items)

    # -------------------------------------------------------------
    # CARD 5: CLOSED-LOOP FLEET AUTO-VERIFICATION
    # -------------------------------------------------------------
    c5_items = [
        ("bullet", "Patrol Monitoring", "Commercial MTC buses routinely patrol geofenced repair zones", (248, 250, 252)),
        ("bullet", "Z-Axis Shock Sensor", "Evaluates vertical accelerometer spike: |imu_z| < 0.25G (Smooth surface)", (56, 189, 248)),
        ("bullet", "Clean Pass Increment", "Each smooth pass increments counter: passes_completed = passes + 1", (52, 211, 153)),
        ("spacer", 6),
        ("formula", "AUTO-VERIFICATION CRITERIA: passes_completed >= 6 Clean Bus Passes"),
        ("spacer", 6),
        ("bullet", "Zero Human Inspector", "Closed automatically without manual inspection or contractor bias", (250, 204, 21)),
        ("bullet", "Anomaly Persistence", "If shock >= 0.40G: Reverts ticket to REOPENED with contractor penalty", (239, 68, 68)),
        ("bullet", "Immutable Audit Trail", "Logs exact bus plate numbers, timestamps, and G-force readings", (168, 85, 247)),
        ("spacer", 8),
        ("code", "AuditLog: #GCC-RAMANATHAN-01 | PBFT Quorum | WORM Commit"),
        ("spacer", 10),
        ("pill_row", [("Autonomous Sign-Off", (234, 88, 12)), ("IMU Corroborated", (52, 211, 153)), ("Zero Bias", (250, 204, 21))])
    ]
    draw_card(col2_x, row2_y, card_w, card_h, "5. CLOSED-LOOP FLEET AUTO-VERIFICATION", "Autonomous Verification via Subsequent Bus Passes • Zero Bribes / No Bias", (234, 88, 12), c5_items)

    # -------------------------------------------------------------
    # CARD 6: NEXT.JS 14 BILINGUAL COMMAND CENTER
    # -------------------------------------------------------------
    c6_items = [
        ("bullet", "Bilingual Support", "Instant toggle between Tamil (தமிழ்) and English (EN)", (52, 211, 153)),
        ("bullet", "Real-Time WebSocket", "WS /v1/live: instant push for defects, passes & closures", (56, 189, 248)),
        ("bullet", "Executive Dashboard", "MapLibre GL 3D GIS Map + Corridors 570/21G/102 + Priority Defect Feed", (248, 250, 252)),
        ("bullet", "Fleet Operations", "Hourly delay curves, chokepoint markers, vehicle IRI roughness index", (245, 158, 11)),
        ("bullet", "Safety Alerts Desk", "ANPR vehicle plate candidates, confidence rankings, QRU dispatch", (239, 68, 68)),
        ("bullet", "Work Orders Board", "Kanban interactive board, clean pass progress indicators (e.g. 4/6)", (168, 85, 247)),
        ("bullet", "Edge Nodes Telemetry", "Hardware health, phone battery %, temp, TPM 2.0 status, queue depth", (251, 113, 133)),
        ("bullet", "Driver PWA Mode", "Mobile live simulator with in-memory privacy blur overlay", (250, 204, 21)),
        ("spacer", 8),
        ("code", "WS /v1/live | GET /fleet/corridors | POST /v1/assistant/chat"),
        ("spacer", 10),
        ("pill_row", [("Next.js 14 App", (236, 72, 153)), ("MapLibre GL", (56, 189, 248)), ("Tailwind CSS", (16, 185, 129))])
    ]
    draw_card(col3_x, row2_y, card_w, card_h, "6. NEXT.JS 14 BILINGUAL COMMAND CENTER", "Next.js 14 App Router • Tailwind CSS • MapLibre GL • Real-time WebSockets", (236, 72, 153), c6_items)

    # Stepped Connecting Arrow: Card 3 -> Card 4 (Ticket Creation)
    p1 = (col3_x + card_w // 2, row1_y + card_h)
    p2 = (col3_x + card_w // 2, row1_y + card_h + 35)
    p3 = (col1_x + card_w // 2, row1_y + card_h + 35)
    p4 = (col1_x + card_w // 2, row2_y)
    draw.line([p1, p2], fill=(16, 185, 129), width=4)
    draw.line([p2, p3], fill=(16, 185, 129), width=4)
    draw.line([p3, p4], fill=(16, 185, 129), width=4)
    # Arrow head on p4
    draw.polygon([(p4[0], p4[1]), (p4[0]-10, p4[1]-16), (p4[0]+10, p4[1]-16)], fill=(16, 185, 129))
    # Label badge on horizontal bar
    draw_arrow(((p2[0]+p3[0])//2 + 50, p2[1]), ((p2[0]+p3[0])//2 - 50, p2[1]), "Ticket Created (P1 / Score >= 75)", "AUTO", (16, 185, 129))

    # Connecting Arrows Row 2
    draw_arrow((col1_x + card_w, row2_y + 440), (col2_x, row2_y + 440), "complete-repair (Arm Bus)", "POST", (245, 158, 11))
    draw_arrow((col2_x + card_w, row2_y + 440), (col3_x, row2_y + 440), "WORK_ORDER_UPDATED", "WS PUSH", (234, 88, 12))

    # Bottom Footer
    draw.line([(80, 2140), (width - 80, 2140)], fill=(51, 65, 85, 255), width=2)
    draw.text((80, 2155), "NagarNetra Platform Architecture • Tested with pytest (20/20 Passing) • Greater Chennai Corporation & MTC Pilot Implementation", fill=(148, 163, 184), font=f_footer)
    draw.text((width - 650, 2155), "Cryptographic Chain: Ed25519 • HMAC-SHA256 • Merkle Root", fill=(100, 116, 139), font=f_footer)

    # Save to files
    out1 = "frontend/public/nagarnetra_architecture_flowchart.png"
    out2 = "C:/Users/itval/.gemini/antigravity/brain/f608680e-e78e-4cf5-aa9a-e7e0ddc94bdd/nagarnetra_architecture_flowchart.png"
    
    img.save(out1, "PNG", quality=95)
    img.save(out2, "PNG", quality=95)
    print(f"Flowchart successfully regenerated:\n  - {out1}\n  - {out2}")

if __name__ == "__main__":
    create_flowchart()
