import os
from PIL import Image, ImageDraw, ImageFont

img_dir = "frontend/public/images"
os.makedirs(img_dir, exist_ok=True)

def create_pothole_rebar():
    img = Image.new('RGB', (800, 480), color='#374151')
    draw = ImageDraw.Draw(img)
    # Asphalt gradient
    for y in range(480):
        color = (45 + y // 15, 52 + y // 16, 62 + y // 14)
        draw.line([(0, y), (800, y)], fill=color)

    # Road crater ellipse
    draw.ellipse([260, 180, 540, 380], fill='#1F2937', outline='#111827', width=6)
    draw.ellipse([290, 220, 510, 350], fill='#0B0F17')

    # Exposed rebar steel rods
    rebar_color = '#9CA3AF'
    draw.line([(320, 310), (480, 240)], fill=rebar_color, width=4)
    draw.line([(340, 330), (500, 260)], fill=rebar_color, width=4)
    draw.line([(360, 230), (450, 340)], fill=rebar_color, width=4)
    draw.line([(310, 260), (430, 350)], fill=rebar_color, width=4)

    # Bounding box
    draw.rectangle([240, 170, 560, 390], outline='#06B6D4', width=3)
    draw.rectangle([240, 150, 420, 170], fill='#06B6D4')
    draw.text((245, 153), "REBAR_DEFECT CONF 0.96", fill='#000000')

    img.save(os.path.join(img_dir, "pothole_rebar.jpg"), quality=90)

def create_truck_incursion():
    img = Image.new('RGB', (800, 480), color='#64748B')
    draw = ImageDraw.Draw(img)
    # Sky and road
    for y in range(240):
        draw.line([(0, y), (800, y)], fill=(148 + y//3, 163 + y//3, 184 + y//3))
    for y in range(240, 480):
        draw.line([(0, y), (800, y)], fill=(51 + (y-240)//8, 65 + (y-240)//8, 85 + (y-240)//8))

    # Bus lane red demarcation
    draw.polygon([(200, 480), (320, 240), (480, 240), (600, 480)], fill='#475569')

    # White commercial pickup / Tata Ace
    draw.rectangle([240, 200, 480, 380], fill='#E2E8F0', outline='#0F172A', width=3)
    draw.rectangle([270, 220, 450, 280], fill='#1E293B') # Windshield
    draw.rectangle([250, 320, 470, 370], fill='#F8FAFC') # Cargo bed

    # Red target vehicle bounding box
    draw.rectangle([220, 190, 500, 390], outline='#EF4444', width=3)
    draw.rectangle([220, 170, 460, 190], fill='#EF4444')
    draw.text((225, 173), "TARGET_VEHICLE: 98.4% conf 64 km/h", fill='#FFFFFF')

    # PII blur box
    draw.rectangle([540, 240, 640, 340], fill='#64748B', outline='#94A3B8', width=2)
    draw.text((560, 285), "PII MASKED", fill='#FFFFFF')

    img.save(os.path.join(img_dir, "truck_incursion.jpg"), quality=90)

def create_plate_crop():
    # Yellow Indian number plate
    img = Image.new('RGB', (400, 160), color='#FBBF24')
    draw = ImageDraw.Draw(img)
    draw.rectangle([5, 5, 395, 155], outline='#1F2937', width=4)
    # Blue IND badge
    draw.rectangle([10, 10, 45, 150], fill='#1D4ED8')
    draw.text((15, 70), "IND", fill='#FFFFFF')
    # Text
    draw.text((70, 50), "KA  03  MG  8842", fill='#111827')
    img.save(os.path.join(img_dir, "plate_crop.jpg"), quality=90)

def create_simple_defect(name, title, color):
    img = Image.new('RGB', (800, 480), color='#334155')
    draw = ImageDraw.Draw(img)
    draw.rectangle([200, 150, 600, 350], fill=color, outline='#000000', width=3)
    draw.text((220, 170), title, fill='#FFFFFF')
    img.save(os.path.join(img_dir, f"{name}.jpg"), quality=90)

create_pothole_rebar()
create_truck_incursion()
create_plate_crop()
create_simple_defect("sunken_grate", "SUNKEN STORM DRAIN GRATE", "#1E293B")
create_simple_defect("crash_barrier", "DAMAGED CRASH BARRIER", "#475569")
create_simple_defect("paving_repair", "CONTRACTOR REPAIR IN PROGRESS", "#0F766E")
create_simple_defect("paving_repaired", "REPAIRED 3H AGO", "#047857")
create_simple_defect("smooth_road", "AUTO-VERIFIED SMOOTH SURFACE (<0.12G)", "#10B981")
create_simple_defect("trench", "UTILITY CUT (BWSSB)", "#854D0E")
create_simple_defect("median_studs", "MISSING REFLECTIVE STUDS", "#64748B")
create_simple_defect("wrong_way", "WRONG-WAY COMMERCIAL TEMPO", "#B91C1C")
create_simple_defect("storm_drain_cavity", "DEEP CAVITY NEAR DRAIN", "#374151")
create_simple_defect("manhole_repair", "SEWAGE CHAMBER LEVEL-CORRECTED", "#0369A1")
create_simple_defect("manhole_done", "DUCTILE IRON MANHOLE INSTALLED", "#059669")
print("All demo assets successfully generated!")
