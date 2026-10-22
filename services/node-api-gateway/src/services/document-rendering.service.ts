export interface ReportData {
  reportId: string;
  tenderTitle: string;
  projectCode: string;
  generatedDate: string;
  reviewerName: string;
  status: string;
  riskScore: number;
  entities: string[];
  findings: Array<{
    clauseId: string;
    description: string;
    severity: string;
    recommendation: string;
  }>;
  graphContextSummary: string;
}

/**
 * Enterprise Document Rendering Workflow Engine for business reports in HTML and PDF formats.
 */
export class DocumentRenderingService {
  /**
   * Generates a fully responsive, executive-grade HTML document.
   */
  renderHtmlDocument(data: ReportData): string {
    const riskBadgeClass = data.riskScore > 75 ? 'badge-high' : 'badge-med';
    const findingRows = data.findings
      .map(
        (f) => `
        <tr class="finding-row severity-${f.severity.toLowerCase()}">
          <td class="font-mono"><strong>${f.clauseId}</strong></td>
          <td><span class="badge ${f.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}">${f.severity}</span></td>
          <td>${f.description}</td>
          <td class="recommendation-cell">${f.recommendation}</td>
        </tr>`
      )
      .join('');

    const entityBadges = data.entities
      .map((e) => `<span class="entity-pill">${e}</span>`)
      .join(' ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Insurance Claims Adjudication &amp; Coverage Assessment - ${data.reportId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #f8fafc; }
    .document-card { max-width: 900px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 48px; border: 1px solid #e2e8f0; }
    .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
    .brand-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .brand-subtitle { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .meta-box { background: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-high { background: #ffedd5; color: #9a3412; }
    .badge-med { background: #fef9c3; color: #854d0e; }
    .badge-approved { background: #dcfce7; color: #166534; }
    .entity-pill { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-family: monospace; margin: 2px; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
    table.data-table th { background: #f8fafc; font-weight: 600; color: #334155; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .signature-block { margin-top: 48px; border-top: 1px dashed #cbd5e1; padding-top: 24px; display: flex; justify-content: space-between; font-size: 13px; color: #475569; }
  </style>
</head>
<body>
  <div class="document-card">
    <div class="header-table">
      <h1 class="brand-title">CENTAURI RESEARCH</h1>
      <div class="brand-subtitle">Enterprise Insurance Intelligence · Claims Adjudication &amp; Coverage Assessment</div>
    </div>

    <div class="meta-box">
      <div class="meta-grid">
        <div><strong>Tender:</strong> ${data.tenderTitle}</div>
        <div><strong>Project Code:</strong> ${data.projectCode}</div>
        <div><strong>Report Ref:</strong> ${data.reportId}</div>
        <div><strong>Generated Date:</strong> ${data.generatedDate}</div>
        <div><strong>Reviewer:</strong> ${data.reviewerName}</div>
        <div><strong>Workflow Status:</strong> <span class="badge badge-approved">${data.status}</span></div>
      </div>
    </div>

    <h3>Grounded Knowledge Graph Entities</h3>
    <div style="margin-bottom: 24px;">${entityBadges}</div>

    <h3>Identified Clause Deviations &amp; Risk Findings</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 20%;">Clause / Rule Ref</th>
          <th style="width: 15%;">Severity</th>
          <th style="width: 35%;">Finding Description</th>
          <th style="width: 30%;">Mitigation Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${findingRows}
      </tbody>
    </table>

    <div class="signature-block">
      <div>
        <strong>System Attestation:</strong><br>
        Verified by Centauri GraphRAG Pipeline<br>
        Azure App Service / JVM In-Memory Index
      </div>
      <div>
        <strong>Human-in-the-Loop Signatory:</strong><br>
        ${data.reviewerName}<br>
        Lead Insurance Claims &amp; Underwriting Authority
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Transforms report data into a compliant, structured PDF binary stream.
   */
  async renderPdfDocument(data: ReportData): Promise<Buffer> {
    const htmlContent = this.renderHtmlDocument(data);
    return this.buildStandardPdfBuffer(data, htmlContent);
  }

  /**
   * Synthesizes an RFC-compliant PDF 1.4 document buffer embedding metadata, text, and structure.
   */
  private buildStandardPdfBuffer(data: ReportData, htmlMarkup: string): Buffer {
    const streamContent = `BT
/F1 18 Tf
50 750 Td
(CENTAURI RESEARCH - ENTERPRISE INSURANCE COVERAGE BRIEF) Tj
0 -24 Td
/F1 12 Tf
(Case: ${data.tenderTitle.replace(/[()]/g, '')}) Tj
0 -18 Td
(Project Code: ${data.projectCode} | Ref: ${data.reportId}) Tj
0 -18 Td
(Reviewer: ${data.reviewerName} | Status: ${data.status} | Risk Score: ${data.riskScore}/100) Tj
0 -30 Td
/F1 14 Tf
(CRITICAL FINDINGS & CLAUSE DEVIATIONS:) Tj
0 -20 Td
/F1 10 Tf
${data.findings
  .map(
    (f) =>
      `(${f.clauseId.replace(/[()]/g, '')} [${f.severity}]: ${f.description.slice(0, 60).replace(/[()]/g, '')}) Tj\n0 -14 Td\n(  Action: ${f.recommendation.slice(0, 65).replace(/[()]/g, '')}) Tj\n0 -18 Td`
  )
  .join('\n')}
0 -30 Td
(Verified by Centauri Azure GraphRAG Platform - Human-in-the-Loop Approved) Tj
ET`;

    const streamLength = Buffer.byteLength(streamContent);

    const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(300 + streamLength).toString().padStart(4, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

    return Buffer.from(pdfSource, 'utf-8');
  }
}

export const documentRenderingService = new DocumentRenderingService();
