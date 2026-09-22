from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


W, H = 3000, 1250
OUT = Path("nagarnetra_frontend_backend_flow.jpg")

BG = "#F7F5F0"
INK = "#152238"
MUTED = "#536273"
NAVY = "#0D243F"
TEAL = "#0E8B83"
RED = "#BE2F2F"
AMBER = "#A86C00"
BLUE = "#2C6EAF"
PURPLE = "#7756B3"
LINE = "#CFD7DD"
WHITE = "#FFFFFF"
PALE_BLUE = "#EAF3FA"
PALE_TEAL = "#E6F6F2"
PALE_AMBER = "#FFF4D8"
PALE_RED = "#FDE9E8"


def font(size, bold=False):
    file = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
    return ImageFont.truetype(file, size)


F_TITLE = font(52, True)
F_SUBTITLE = font(22)
F_GROUP = font(26, True)
F_HEADING = font(22, True)
F_BODY = font(19)
F_SMALL = font(16)
F_TINY = font(14)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def text(pos, value, fill=INK, f=F_BODY, spacing=4):
    d.multiline_text(pos, value, font=f, fill=fill, spacing=spacing)


def box(x, y, w, h, title, body, accent=BLUE, fill=WHITE, note=None):
    d.rounded_rectangle((x, y, x + w, y + h), radius=18, fill=fill, outline=LINE, width=2)
    d.rounded_rectangle((x, y, x + 10, y + h), radius=5, fill=accent)
    text((x + 24, y + 16), title, INK, F_HEADING)
    text((x + 24, y + 53), body, MUTED, F_BODY)
    if note:
        text((x + 24, y + h - 28), note, accent, F_TINY)


def arrow(x1, y1, x2, y2, color=BLUE, label=None, dashed=False):
    if dashed:
        total = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
        if total:
            ux, uy = (x2 - x1) / total, (y2 - y1) / total
            for offset in range(0, int(total), 20):
                end = min(offset + 10, total)
                d.line((x1 + ux * offset, y1 + uy * offset, x1 + ux * end, y1 + uy * end), fill=color, width=4)
    else:
        d.line((x1, y1, x2, y2), fill=color, width=5)
    size = 13
    if abs(x2 - x1) >= abs(y2 - y1):
        pts = [(x2, y2), (x2 - size, y2 - size // 2), (x2 - size, y2 + size // 2)] if x2 > x1 else [(x2, y2), (x2 + size, y2 - size // 2), (x2 + size, y2 + size // 2)]
    else:
        pts = [(x2, y2), (x2 - size // 2, y2 - size), (x2 + size // 2, y2 - size)] if y2 > y1 else [(x2, y2), (x2 - size // 2, y2 + size), (x2 + size // 2, y2 + size)]
    d.polygon(pts, fill=color)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        bbox = d.textbbox((0, 0), label, font=F_TINY)
        tw = bbox[2] - bbox[0]
        d.rounded_rectangle((mx - tw / 2 - 7, my - 13, mx + tw / 2 + 7, my + 10), radius=7, fill=BG)
        d.text((mx - tw / 2, my - 11), label, font=F_TINY, fill=color)


# Header
d.rectangle((0, 0, W, 126), fill=NAVY)
text((60, 27), "NagarNetra — Current Frontend ↔ Backend Flow", WHITE, F_TITLE)
text((62, 86), "Architecture map of implemented routes, service calls, data processing and known integration boundaries", "#D7E5EF", F_SUBTITLE)

# Column headers
columns = [(55, 155, 600, "1  FRONTEND / EDGE CLIENTS", BLUE), (705, 155, 560, "2  FASTAPI API LAYER", TEAL), (1320, 155, 880, "3  DOMAIN SERVICES", AMBER), (2260, 155, 680, "4  STORAGE & EXTERNALS", PURPLE)]
for x, y, w, label, color in columns:
    d.rounded_rectangle((x, y, x + w, y + 48), radius=14, fill=color)
    text((x + 18, y + 11), label, WHITE, F_GROUP)

# Frontend column
box(55, 225, 285, 175, "Command Center  /", "GET /v1/incidents\nGET /v1/fleet/status\n5-second polling\nPOST /v1/simulate/scenario", BLUE, PALE_BLUE)
box(370, 225, 285, 175, "Safety & Evidence", "GET /v1/incidents/{id}\nPOST /v1/incidents/{id}/action\nGET /police-report", BLUE, PALE_BLUE)
box(55, 425, 285, 175, "Work Orders", "GET /v1/work-orders\nPATCH /v1/work-orders/{id}\nGET /work-orders/{id}/pdf", BLUE, PALE_BLUE)
box(370, 425, 285, 175, "Fleet / Analytics", "GET /fleet/status, /corridors\nGET /corridor/{route}/telemetry\nGET /segments/congestion, /traffic/od-flows", BLUE, PALE_BLUE)
box(55, 625, 285, 175, "Assistant", "POST /v1/assistant/chat\nGET /v1/assistant/tools\nStructured result + evidence links", BLUE, PALE_BLUE)
box(370, 625, 285, 175, "PWA & Edge Helpers", "Camera blur worker (RAM)\nIndexedDB store-and-forward\nPOST /v1/events (signed event)", BLUE, PALE_BLUE)
box(55, 845, 600, 125, "frontend/src/lib/api.ts", "Browser fetch client: builds API URL, sends JSON, parses REST responses. Current UI uses polling; WebSocket is not consumed by the pages.", BLUE, WHITE)

# API layer
box(705, 225, 560, 145, "FastAPI application", "CORS middleware • startup creates tables and seeds demo data\nGET / = basic status response", TEAL, PALE_TEAL)
box(705, 395, 270, 285, "Command / Query Routers", "incidents\nwork_orders\nfleet\ntraffic\nassistant\nsimulate", TEAL, WHITE)
box(995, 395, 270, 285, "Event / Live Routers", "POST /v1/events\nHMAC verified ingestion\nWS /v1/live\nJSON ping/pong handshake", TEAL, WHITE)
box(705, 705, 560, 125, "API contracts", "Pydantic request/response schemas\nSQLAlchemy dependency injection\nNo authentication or role checks today", RED, PALE_RED)
box(705, 855, 560, 115, "HTTP + WebSocket boundary", "REST JSON enters individual routers.\nWebSocket is intended for updates, but its\nconnection registries are currently separate.", PURPLE, WHITE)

# Services
box(1320, 225, 405, 150, "Ingestion validation", "IngestEvent schema → HMAC verify\nReplay check by event ULID\nGPS accuracy threshold\nSimulation source may bypass signature", AMBER, PALE_AMBER)
box(1795, 225, 405, 150, "Spatial & fusion", "RoadNetworkSnapper (embedded BBMP roads)\nHaversine proximity match\nDBSCAN helpers • Noisy-OR confidence", AMBER, PALE_AMBER)
box(1320, 410, 405, 150, "Incident lifecycle", "Create / merge incident\nCandidate → Confirmed → Ticketed\nDetection-to-incident association\nAudit log creation", AMBER, WHITE)
box(1795, 410, 405, 150, "Risk & verification", "Priority: S × E × V × A\nClean-pass corroboration\nReopen / auto-verify work order\nCurrent factors include placeholders", AMBER, WHITE)
box(1320, 595, 405, 150, "Query & analytics services", "Fleet status and corridors\nTraffic congestion + O-D helpers\nWhitelisted assistant query dispatcher\nMostly seeded / rule-based outputs", AMBER, WHITE)
box(1795, 595, 405, 150, "Reports & evidence", "PDF work-order generator\nPolice-report generator\nSHA-256 / Merkle-root helpers\nLocal evidence directory", AMBER, WHITE)
box(1320, 780, 880, 190, "Realtime design", "Expected: event ingestion → broadcast updated incident → browser map refresh.\nCurrent: events.py and websocket.py keep separate connection lists; ingestion calls send_json without awaiting it.\nProduction needs one async connection manager or message broker.", RED, PALE_RED)

# Data / external
box(2260, 225, 330, 180, "Database", "SQLAlchemy models\nDefault: SQLite nagarnetra.db\nCompose: PostgreSQL container\nTables: buses, routes, detections,\nincidents, work orders, audit logs", PURPLE, "#F2ECFB")
box(2610, 225, 330, 180, "Seed data", "startup → seed_database()\nBengaluru / BBMP / BMTC\nincidents, routes, work orders\nIllustrative records only", RED, PALE_RED)
box(2260, 440, 330, 165, "Road / reference data", "backend/app/data/bbmp_roads.py\nEmbedded line strings\nUsed by snapper\nNot PostGIS or official Chennai data", PURPLE, "#F2ECFB")
box(2610, 440, 330, 165, "Evidence files", "EVIDENCE_DIR on local disk\nImage URLs in frontend/public/images\nNo object storage, retention or\naccess-control pipeline", PURPLE, "#F2ECFB")
box(2260, 640, 680, 145, "Docker Compose services", "db: PostGIS image • mqtt: Mosquitto\napi: FastAPI • web: Next.js\nMQTT exists, but is not wired into ingestion.", PURPLE, "#F2ECFB")
box(2260, 815, 680, 155, "Target production replacement", "PostgreSQL + PostGIS • approved Tamil Nadu data\nObject storage • broker • per-device keys\nAudit logging • observability • source provenance", TEAL, PALE_TEAL)

# Main arrows: client to API
for y in (312, 512, 712, 907):
    arrow(655, y, 705, y, BLUE, "HTTPS / JSON")
arrow(655, 690, 995, 690, BLUE, "signed event")
arrow(655, 875, 705, 875, PURPLE, "intended WS")

# API internal calls
arrow(985, 370, 985, 395, TEAL)
arrow(1125, 370, 1125, 395, TEAL)
arrow(1265, 300, 1320, 300, AMBER, "route call")
arrow(1265, 535, 1320, 485, AMBER, "service call")
arrow(1265, 535, 1795, 485, AMBER, "dedup / priority")
arrow(1265, 610, 1320, 670, AMBER, "query")
arrow(1265, 610, 1795, 670, AMBER, "PDF")

# service chaining
arrow(1725, 300, 1795, 300, AMBER, "snap + cluster")
arrow(1522, 375, 1522, 410, AMBER, "persist")
arrow(1997, 375, 1997, 410, AMBER, "score")
arrow(1725, 485, 1795, 485, AMBER, "work order")

# database arrows
for origin_y, label in [(335, "read / write"), (495, "read / write"), (675, "queries"), (870, "writes")]:
    arrow(2200, origin_y, 2260, origin_y, TEAL, label)
arrow(2590, 315, 2610, 315, RED, "startup")
arrow(2590, 520, 2610, 520, PURPLE, "metadata")

# Footer / legend
d.rectangle((0, 1050, W, H), fill="#E8ECEE")
text((60, 1082), "Legend", INK, F_HEADING)
for x, color, label, dashed in [(220, BLUE, "Browser HTTP / JSON", False), (620, AMBER, "Internal service flow", False), (1050, TEAL, "Database read/write", False), (1450, PURPLE, "WebSocket / planned channel", True), (2030, RED, "Current limitation / production gap", False)]:
    arrow(x, 1112, x + 52, 1112, color, dashed=dashed)
    text((x + 68, 1099), label, MUTED, F_SMALL)
text((60, 1134), "Scope: diagram reflects the current repository implementation as inspected on 21 Sep 2026. It is a technical map, not a claim that external integrations are live.", MUTED, F_SMALL)

img.save(OUT, quality=94, subsampling=0)
print(OUT.resolve())
