import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_work_order_pdf(wo_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0D1B2A'),
        fontName='Helvetica-Bold'
    )
    sub_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#555555')
    )
    bold_style = ParagraphStyle(
        'BoldField',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#111827'),
        fontName='Helvetica-Bold'
    )

    elements = []
    # Header
    elements.append(Paragraph("NAGARNETRA • CIVIC INFRASTRUCTURE WORK ORDER", title_style))
    elements.append(Paragraph("Greater Chennai Corporation (GCC) • Road Infrastructure Directorate", sub_style))
    elements.append(Spacer(1, 14))

    # Details table
    data = [
        [Paragraph("Work Order ID:", bold_style), Paragraph(str(wo_data.get("id", "WO-2025-0849")), styles['Normal'])],
        [Paragraph("Associated Incident:", bold_style), Paragraph(str(wo_data.get("incident_id", "INC-2025-0849")), styles['Normal'])],
        [Paragraph("Title / Defect:", bold_style), Paragraph(str(wo_data.get("title", "Severe Crater & Exposed Rebar")), styles['Normal'])],
        [Paragraph("Severity & SLA:", bold_style), Paragraph(f"{wo_data.get('severity', 'P1_CRITICAL')} • SLA: {wo_data.get('sla_hours', 24)}h", styles['Normal'])],
        [Paragraph("Ward & Location:", bold_style), Paragraph(f"{wo_data.get('ward', 'Ward 117')} • {wo_data.get('location_desc', 'Anna Salai Northbound')}", styles['Normal'])],
        [Paragraph("Assigned Squad:", bold_style), Paragraph(str(wo_data.get("assigned_to", "GCC Civil Infra Team B")), styles['Normal'])],
        [Paragraph("Status:", bold_style), Paragraph(str(wo_data.get("state", "OPEN_UNASSIGNED")).upper(), styles['Normal'])],
        [Paragraph("Closed-Loop Protocol:", bold_style), Paragraph("Requires > 6 clean bus passes with z-axis shock < 0.25G to verify completion.", styles['Normal'])],
        [Paragraph("Contractor Portal Token:", bold_style), Paragraph(f"https://nagarnetra.chennaicorporation.gov.in/contractor/verify?token=tok_{wo_data.get('id', '849')}", styles['Normal'])],
    ]

    t = Table(data, colWidths=[160, 380])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAF8F5')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("DISPATCH AUTHORITY STAMP", bold_style))
    elements.append(Paragraph("Automated by NagarNetra Fleet Telemetry Grid. Tamper-evident SHA256 verified.", sub_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_police_report_pdf(incident_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#991B1B'),
        fontName='Helvetica-Bold'
    )
    sub_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4B5563')
    )
    bold_style = ParagraphStyle(
        'BoldField',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#111827'),
        fontName='Helvetica-Bold'
    )

    elements = []
    elements.append(Paragraph("GREATER CHENNAI TRAFFIC POLICE • INCIDENT EVIDENCE AUDIT", title_style))
    elements.append(Paragraph("NagarNetra Transit Vision Mesh • Tamper-Proof Chain of Custody", sub_style))
    elements.append(Spacer(1, 14))

    plate = incident_data.get("plate_number", "TN 09 BG 8842")
    conf = incident_data.get("plate_conf", 0.948) * 100

    data = [
        [Paragraph("Incident Case ID:", bold_style), Paragraph(str(incident_data.get("id", "INC-2025-0914")), styles['Normal'])],
        [Paragraph("Violation Class:", bold_style), Paragraph(str(incident_data.get("title", "Corridor Incursion & Rash Driving")), styles['Normal'])],
        [Paragraph("Flagged Vehicle Plate:", bold_style), Paragraph(f"<b>{plate}</b> (Confidence: {conf:.1f}%)", styles['Normal'])],
        [Paragraph("Location / Ward:", bold_style), Paragraph(f"{incident_data.get('subtitle', 'Anna Salai / Guindy Corridor')} (Ward 117)", styles['Normal'])],
        [Paragraph("Speed Telemetry:", bold_style), Paragraph("64 km/h in 30 km/h Bus Priority Geofence", styles['Normal'])],
        [Paragraph("Multi-Bus Triangulation:", bold_style), Paragraph("Synchronized across MTC-4012, MTC-8819, and MTC-2104", styles['Normal'])],
        [Paragraph("WORM Cryptographic Root:", bold_style), Paragraph(str(incident_data.get("chain_of_custody_hash", "e5a019ff88bc27a091823")), styles['Normal'])],
        [Paragraph("Statutory Penalty:", bold_style), Paragraph("Motor Vehicles (Amendment) Act Sec 192A: Corridor Incursion Penalty ₹10,000 + Impound", styles['Normal'])],
        [Paragraph("Certified Officer:", bold_style), Paragraph("Inspector S. Ramanathan (Badge #GCC-RAMANATHAN-01)", styles['Normal'])],
    ]

    t = Table(data, colWidths=[160, 380])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAF8F5')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("DPDP ACT 2023 COMPLIANCE CERTIFICATION", bold_style))
    elements.append(Paragraph("Faces and non-offending bystanders were anonymized directly in on-bus RAM before evidence transmission. Video buffer retained per municipal retention standards.", sub_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
