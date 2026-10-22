#!/usr/bin/env python3
"""
Generates 3 standard public commercial insurance policy documents in PDF 1.4 format.
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

    for sec_title, items in policy["sections"]:
        lines.append("/F1 12 Tf")
        lines.append(f"({escape_pdf(sec_title)}) Tj")
        lines.append("0 -16 Td")
        lines.append("/F1 9 Tf")
        for item in items:
            lines.append(f"(  * {escape_pdf(item)}) Tj")
            lines.append("0 -13 Td")
        lines.append("0 -8 Td")

    lines.append("0 -12 Td")
    lines.append("/F1 8 Tf")
    lines.append("(Official Regulatory Filing - Centauri Research / Alpha Centauri Ventures Inc. Knowledge Graph Archive) Tj")
    lines.append("ET")

    stream_content = "\n".join(lines).encode("latin1")
    stream_len = len(stream_content)

    body = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length " + str(stream_len).encode("ascii") + b" >>\nstream\n"
        + stream_content + b"\nendstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    )

    xref_pos = len(body)
    xref = (
        b"xref\n"
        b"0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000228 00000 n \n"
        b"0000000000 00000 n \n"
    )
    trailer = (
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"
        + str(xref_pos).encode("ascii") + b"\n%%EOF\n"
    )

    return body + xref + trailer

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "..", "services", "node-api-gateway", "data", "policies")
    os.makedirs(target_dir, exist_ok=True)

    for p in POLICIES:
        out_path = os.path.join(target_dir, p["filename"])
        content = generate_pdf_buffer(p)
        with open(out_path, "wb") as f:
            f.write(content)
        print(f"[OK] Generated {p['filename']} ({len(content)} bytes) at {out_path}")

if __name__ == "__main__":
    main()
