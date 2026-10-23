#!/usr/bin/env python3
"""
Generates 6 standard public commercial insurance policy documents in PDF 1.4 format.
Legal party: Alpha Centauri Ventures Inc.
Brand: Centauri Research
"""

import os

POLICIES = [
    {
        "filename": "ISO-CP-00-10-Commercial-Property-Policy.pdf",
        "title": "ISO FORM CP 00 10 - BUILDING AND PERSONAL PROPERTY COVERAGE",
        "policy_number": "POL-2026-COMM-PROPERTY",
        "insured": "Apex Logistics & Warehousing Ltd.",
        "term": "March 1, 2026 to February 28, 2027",
        "limit": "$25,000,000 USD Aggregate Limit",
        "deductible": "$100,000 USD (2% Named Storm Deductible applies to Building Structure)",
        "waiting_period": "24 Hours Time Element Waiting Period",
        "sections": [
            ("SECTION I - COVERAGES", [
                "Coverage A - Building and Structure: $18,000,000 Limit",
                "Coverage B - Business Personal Property & Cargo: $5,000,000 Limit",
                "Coverage C - Debris Removal & Demolition: $2,000,000 Limit",
            ]),
            ("SECTION II - PERILS COVERED & EXCLUSIONS", [
                "Covered Peril: Direct physical loss caused by Windstorm, Hail, Fire, or Lightning.",
                "EXCLUSION 7.1 (Water & Surface Flooding): We will not pay for loss or damage caused directly or indirectly by surface water, waves, tidal water, overflow of any body of water, or spray.",
                "EXCLUSION 3.2 (Wear and Tear): We will not pay for loss caused by gradual deterioration, rust, corrosion, decay, or latent defect.",
            ]),
            ("SECTION III - CONDITIONS & MANDATORY WARRANTIES", [
                "Condition 4.5: Automatic sprinkler systems must be maintained in continuous service.",
                "Clause W-10: Named Storm percentage deductible applies to Category 2+ wind events.",
            ]),
        ]
    },
    {
        "filename": "NAIC-668-Cyber-Security-Ransomware-Policy.pdf",
        "title": "COMMERCIAL CYBER EXTORTION & RANSOMWARE POLICY (NAIC-668)",
        "policy_number": "POL-CYBER-PROP-2026-99",
        "insured": "GlobalTech Solutions Inc.",
        "term": "January 1, 2026 to December 31, 2026",
        "limit": "$10,000,000 USD Aggregate Limit",
        "deductible": "$50,000 USD Self-Insured Retention (SIR)",
        "waiting_period": "72 Hours Time Element Waiting Period for Business Interruption",
        "sections": [
            ("INSURING AGREEMENTS", [
                "Insuring Agreement 1.1 - Ransomware Extortion Demands: $3,000,000 Sub-Limit",
                "Insuring Agreement 1.2 - Business Interruption & Extra Expense: $5,000,000 Sub-Limit",
                "Insuring Agreement 1.3 - Digital Forensic Audit & Asset Restoration: $2,000,000 Sub-Limit",
            ]),
            ("STATUTORY EXCLUSIONS", [
                "EXCLUSION 4.2 (Known Critical Unpatched Vulnerabilities): Coverage is completely barred for ransomware intrusions originating via a known CVE vulnerability where a manufacturer security patch was publicly released more than thirty (30) days prior to the initial compromise date.",
                "EXCLUSION 5.1 (Hostile Acts & Cyber Warfare): Excludes losses arising directly or indirectly from military operations or cyber attacks attributable to sovereign nation states.",
            ]),
            ("POLICY CONDITIONS", [
                "Condition 8.1 (Waiting Period): Business Interruption loss indemnity commences only after the initial 72 hours of complete operating stoppage.",
                "Warranty 2.4 (MFA Requirement): Mandatory Multi-Factor Authentication across all administrative and VPN endpoints.",
            ]),
        ]
    },
    {
        "filename": "ISO-BM-00-20-Equipment-Breakdown-Policy.pdf",
        "title": "ISO FORM BM 00 20 - COMPREHENSIVE EQUIPMENT BREAKDOWN COVERAGE",
        "policy_number": "POL-MACH-2026-04",
        "insured": "Quantum Clean Energy GenCorp",
        "term": "May 1, 2026 to April 30, 2027",
        "limit": "$15,000,000 USD Aggregate Limit",
        "deductible": "$25,000 USD Combined Mechanical / Electrical Deductible",
        "waiting_period": "48 Hours Time Element Deductible",
        "sections": [
            ("COVERAGE BREAKDOWN", [
                "Line 1 - Turbomachinery & Compressor Mechanical Breakdown: $10,000,000 Limit",
                "Line 2 - Electrical Arcing, Stator Burnout & Short-Circuit: $3,000,000 Limit",
                "Line 3 - Spoilage & Expediting Recovery Expenses: $2,000,000 Limit",
            ]),
            ("PERIL EXCLUSIONS", [
                "EXCLUSION 2.4 (Chemical Corrosion & Cavitation): Excludes loss or repair costs caused by gradual erosion, blade pitting, cavitation, or acid gas chemical corrosion.",
                "EXCLUSION 6.2 (Operator Negligence / Uncertified Operation): Excludes breakdown occurring during operation outside manufacturer rated envelope.",
            ]),
            ("SERVICING WARRANTIES", [
                "Warranty 9.1: Compressors and high-pressure turbines must undergo certified annual OEM maintenance with verifiable logs.",
            ]),
        ]
    },
    {
        "filename": "ISO-CG-00-01-Commercial-General-Liability.pdf",
        "title": "ISO FORM CG 00 01 - COMMERCIAL GENERAL LIABILITY COVERAGE FORM",
        "policy_number": "POL-GL-2026-55",
        "insured": "Vanguard Construction & Engineering Corp.",
        "term": "July 1, 2026 to June 30, 2027",
        "limit": "$10,000,000 USD General Aggregate / $2,000,000 Each Occurrence",
        "deductible": "$25,000 USD Property Damage Liability Deductible",
        "waiting_period": "N/A (Occurrence Based Liability)",
        "sections": [
            ("SECTION I - COVERAGES", [
                "Coverage A - Bodily Injury & Property Damage Liability: $2,000,000 Occurrence Limit",
                "Coverage B - Personal & Advertising Injury Liability: $2,000,000 Any One Person/Org",
                "Coverage C - Medical Payments: $10,000 Any One Person",
            ]),
            ("SECTION II - STATUTORY EXCLUSIONS", [
                "EXCLUSION f (Total Pollution Bar): Excludes bodily injury or property damage arising out of the actual, alleged, or threatened discharge, dispersal, seepage, migration, release, or escape of pollutants at or from any premises or work site.",
                "EXCLUSION j (Damage to Your Work): Excludes property damage to that particular part of real property on which work is being performed by the insured or subcontractors.",
                "EXCLUSION g (Aircraft, Auto or Watercraft): Total bar on liabilities arising from aviation or maritime navigation.",
            ]),
            ("SECTION III - DEFENSE & SETTLEMENT CONDITIONS", [
                "Condition 2.a: Immediate written notice of any occurrence that may result in a claim within 10 business days.",
                "Condition 2.d: The insured shall not, except at their own expense, voluntarily make any payment or assume any obligation without our prior written consent.",
            ]),
        ]
    },
    {
        "filename": "SEC-DO-2026-Directors-Officers-Policy.pdf",
        "title": "DIRECTORS & OFFICERS (D&O) EXECUTIVE LIABILITY & SECURITIES FORM",
        "policy_number": "POL-DO-2026-12",
        "insured": "Horizon Autonomous Robotics Inc.",
        "term": "February 15, 2026 to February 14, 2027",
        "limit": "$20,000,000 USD Aggregate (Side A DIC $10M / Side B $5M / Side C $5M)",
        "deductible": "$250,000 USD Securities Claim Retention (Nil for Non-Indemnifiable Side A)",
        "waiting_period": "N/A (Claims-Made & Reported Basis)",
        "sections": [
            ("INSURING AGREEMENTS", [
                "Insuring Clause A (Individual Director/Officer DIC): $10,000,000 Non-Indemnifiable Loss",
                "Insuring Clause B (Corporate Indemnification Reimbursement): $5,000,000 Limit",
                "Insuring Clause C (Entity Securities Class Action Defense & Settlement): $5,000,000 Limit",
            ]),
            ("EXCLUSIONS", [
                "EXCLUSION 3.1 (Deliberate Fraud & Illegal Profit): Excludes claims brought about by fraudulent, dishonest, or criminal acts, or gaining personal profit to which the insured was not legally entitled (applies only upon final non-appealable judicial adjudication).",
                "EXCLUSION 3.2 (Prior & Pending Litigation): Excludes litigation, administrative proceedings, or SEC subpoenas pending prior to February 15, 2024.",
                "EXCLUSION 3.3 (Insured vs. Insured): Excludes claims brought by or on behalf of the company against any director, except shareholder derivative actions brought without active participation of insured.",
            ]),
            ("GENERAL CONDITIONS", [
                "Condition 5.2 (Reporting Period): Written notice of any SEC Formal Order of Investigation or Wells Notice must be provided within 30 days of receipt.",
            ]),
        ]
    },
    {
        "filename": "ISO-CM-00-20-Inland-Marine-Cargo-Policy.pdf",
        "title": "ISO FORM CM 00 20 - COMMERCIAL INLAND MARINE & TRANSIT CARGO FORM",
        "policy_number": "POL-CARGO-2026-77",
        "insured": "Pacifica Global Freight Forwarders LLC",
        "term": "April 1, 2026 to March 31, 2027",
        "limit": "$12,000,000 USD Any One Conveyance / $30,000,000 Warehouse Accumulation",
        "deductible": "$50,000 USD Per Occurrence Deductible",
        "waiting_period": "12 Hours Delay Waiting Period for Reefer Cargo Spoilage",
        "sections": [
            ("COVERAGE EXTENSIONS", [
                "Coverage 1 - Goods in Ordinary Course of Transit (Truck, Rail, Air, Feeder Vessel): $12,000,000 Limit",
                "Coverage 2 - Refrigerated Cargo Temperature Failure (Reefer Breakdown): $4,000,000 Limit",
                "Coverage 3 - General Average & Salvage Charges: Paid in Full up to Aggregate Limit",
            ]),
            ("CARGO EXCLUSIONS", [
                "EXCLUSION 4.1 (Insufficient Packing & Inadequate Stowage): Excludes loss or damage resulting from improper packing, internal shifting, or packaging incapable of withstanding normal transport shocks.",
                "EXCLUSION 4.4 (Delay & Demurrage): Excludes consequential loss of market, contract cancellation penalties, or port demurrage caused by transit delay.",
                "EXCLUSION 4.8 (Inherent Vice): Excludes natural spontaneous decay, fermentation, or evaporation of cargo.",
            ]),
            ("MANDATORY TRANSIT WARRANTIES", [
                "Warranty T-1: Reefer containers transporting pharmaceuticals or perishables must carry operational continuous digital temperature dataloggers.",
                "Warranty T-4: Real-time satellite GPS tracking mandatory on all overland freight consignments exceeding $500,000 declared value.",
            ]),
        ]
    }
]

def escape_pdf(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

def generate_pdf_buffer(policy: dict) -> bytes:
    lines = []
    lines.append("BT")
    lines.append("/F1 15 Tf")
    lines.append("50 750 Td")
    lines.append(f"({escape_pdf(policy['title'])}) Tj")
    lines.append("0 -24 Td")
    lines.append("/F1 11 Tf")
    lines.append(f"(Policy Number: {escape_pdf(policy['policy_number'])} | Term: {escape_pdf(policy['term'])}) Tj")
    lines.append("0 -16 Td")
    lines.append(f"(Named Insured: {escape_pdf(policy['insured'])}) Tj")
    lines.append("0 -16 Td")
    lines.append(f"(Aggregate Limit: {escape_pdf(policy['limit'])} | Deductible: {escape_pdf(policy['deductible'])}) Tj")
    lines.append("0 -16 Td")
    lines.append(f"(Waiting Period: {escape_pdf(policy['waiting_period'])}) Tj")
    lines.append("0 -24 Td")

    for section_title, items in policy["sections"]:
        lines.append("/F1 12 Tf")
        lines.append(f"({escape_pdf(section_title)}) Tj")
        lines.append("0 -16 Td")
        lines.append("/F1 10 Tf")
        for item in items:
            lines.append(f"(  * {escape_pdf(item)}) Tj")
            lines.append("0 -14 Td")
        lines.append("0 -10 Td")

    lines.append("0 -20 Td")
    lines.append("/F1 9 Tf")
    lines.append("(Centauri Research GraphRAG Insurance Repository - Legal Entity: Alpha Centauri Ventures Inc.) Tj")
    lines.append("ET")

    content_stream = "\n".join(lines).encode("latin-1")
    stream_len = len(content_stream)

    pdf = bytearray()
    pdf.extend(b"%PDF-1.4\n")
    offsets = []

    def add_obj(data: bytes):
        offsets.append(len(pdf))
        pdf.extend(data)

    add_obj(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    add_obj(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    add_obj(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")
    add_obj(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1") + content_stream + b"\nendstream\nendobj\n")
    add_obj(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for off in offsets:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1"))
    return bytes(pdf)

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "..", "services", "node-api-gateway", "data", "policies")
    os.makedirs(target_dir, exist_ok=True)

    print(f"Generating {len(POLICIES)} sample commercial insurance policies in {target_dir}...")
    for p in POLICIES:
        pdf_bytes = generate_pdf_buffer(p)
        filepath = os.path.join(target_dir, p["filename"])
        with open(filepath, "wb") as f:
            f.write(pdf_bytes)
        print(f"  [OK] Generated {p['filename']} ({len(pdf_bytes)} bytes)")

if __name__ == "__main__":
    main()
