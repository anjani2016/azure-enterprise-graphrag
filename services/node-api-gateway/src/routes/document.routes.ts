import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { documentRenderingService, ReportData } from '../services/document-rendering.service';
import { azureBlobService } from '../services/azure-blob.service';
import { hitlWorkflowService } from '../services/hitl-workflow.service';
import { authenticateToken } from '../middleware/auth.middleware';

export const documentRouter = Router();

const RenderDocSchema = z.object({
  workflowId: z.string().optional(),
  tenderTitle: z.string().default('GAIL Bio-CNG Panipat Tender Package'),
  projectCode: z.string().default('CR-EPC-2026-09'),
  reviewerName: z.string().default('Anjani (Lead EPC Systems Engineer)'),
  riskScore: z.number().default(78),
  findings: z
    .array(
      z.object({
        clauseId: z.string(),
        description: z.string(),
        severity: z.string(),
        recommendation: z.string(),
      })
    )
    .default([
      {
        clauseId: 'DEV-001 / STD-OISD-179',
        description: 'Compressor discharge temperature 68C exceeds statutory limit of 65C.',
        severity: 'CRITICAL',
        recommendation: 'Mandate OEM vendor aftercooler upgrade before bid submission.',
      },
      {
        clauseId: 'CLS-GCC-24.1',
        description: 'Liquidated Damages clause uncapped for supply delays.',
        severity: 'HIGH',
        recommendation: 'Request pre-bid addendum to cap LD at 5% of scope.',
      },
    ]),
  entities: z.array(z.string()).default(['EQ-C-101', 'STD-OISD-179', 'CLS-GCC-24.1', 'VND-KIRLOSKAR']),
});

documentRouter.post('/render/html', authenticateToken, (req: Request, res: Response) => {
  try {
    const parsed = RenderDocSchema.parse(req.body);
    const data: ReportData = {
      reportId: parsed.workflowId || `REP-${Date.now()}`,
      tenderTitle: parsed.tenderTitle,
      projectCode: parsed.projectCode,
      generatedDate: new Date().toISOString().split('T')[0],
      reviewerName: parsed.reviewerName,
      status: 'APPROVED',
      riskScore: parsed.riskScore,
      entities: parsed.entities,
      findings: parsed.findings,
      graphContextSummary: 'Knowledge Graph Traversal Attributed Context Verified',
    };

    const html = documentRenderingService.renderHtmlDocument(data);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

documentRouter.post('/render/pdf', authenticateToken, async (req: Request, res: Response) => {
  try {
    const parsed = RenderDocSchema.parse(req.body);
    const reportId = parsed.workflowId || `REP-${Date.now()}`;
    const data: ReportData = {
      reportId,
      tenderTitle: parsed.tenderTitle,
      projectCode: parsed.projectCode,
      generatedDate: new Date().toISOString().split('T')[0],
      reviewerName: parsed.reviewerName,
      status: 'APPROVED',
      riskScore: parsed.riskScore,
      entities: parsed.entities,
      findings: parsed.findings,
      graphContextSummary: 'Knowledge Graph Traversal Attributed Context Verified',
    };

    const pdfBuffer = await documentRenderingService.renderPdfDocument(data);

    // Save to Azure Blob Storage
    const blobName = `${reportId}.pdf`;
    const blobUrl = await azureBlobService.uploadRenderedReport(blobName, pdfBuffer, 'application/pdf');

    if (parsed.workflowId) {
      hitlWorkflowService.markDocumentRendered(parsed.workflowId, blobUrl);
    }

    if (req.query.download === 'true') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${blobName}"`);
      return res.status(200).send(pdfBuffer);
    }

    res.status(200).json({
      success: true,
      reportId,
      blobName,
      azureBlobUrl: blobUrl,
      sizeBytes: pdfBuffer.length,
      status: 'RENDERED_AND_UPLOADED',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
