import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { policyCatalogService } from '../services/policy-catalog.service';
import { documentRenderingService } from '../services/document-rendering.service';

export const chatRouter = Router();

const POLICY_PDF_MAP: Record<string, string> = {
  'POL-CYBER-PROP-2026-99': 'NAIC-668-Cyber-Security-Ransomware-Policy.pdf',
  'POL-2026-COMM-PROPERTY': 'ISO-CP-00-10-Commercial-Property-Policy.pdf',
  'POL-MACH-2026-04': 'ISO-BM-00-20-Equipment-Breakdown-Policy.pdf',
  'POL-CGL-2026-08': 'ISO-CG-00-01-Commercial-General-Liability.pdf',
  'POL-DO-2026-12': 'SEC-DO-2026-Directors-Officers-Policy.pdf',
  'POL-CARGO-2026-15': 'ISO-CM-00-20-Inland-Marine-Cargo-Policy.pdf',
};

const QuerySchema = z.object({
  policyId: z.string().default('POL-CYBER-PROP-2026-99'),
  question: z.string().min(3, 'Question must be at least 3 characters long'),
});

const UploadPolicySchema = z.object({
  policyNumber: z.string(),
  policyholder: z.string(),
  effectiveDate: z.string().default('2026-01-01 to 2026-12-31'),
  aggregateLimitUsd: z.number().default(5000000),
  deductibleUsd: z.number().default(50000),
  waitingPeriodHours: z.number().default(48),
  coverages: z.array(z.object({ name: z.string(), limitUsd: z.number(), category: z.string() })).default([
    { name: 'Custom Commercial Line', limitUsd: 5000000, category: 'GENERAL' },
  ]),
  exclusions: z.array(z.object({ code: z.string(), title: z.string(), description: z.string(), severity: z.string() })).default([
    { code: 'EXCL-GENERAL-WAR', title: 'War Exclusion', description: 'War risks are excluded', severity: 'TOTAL_BAR' },
  ]),
  clauses: z.array(z.object({ clauseId: z.string(), title: z.string(), requirement: z.string() })).default([
    { clauseId: 'CLS-01', title: 'Notice Clause', requirement: 'Notice within 30 days' },
  ]),
  sampleQuestions: z.array(z.string()).default(['What is the aggregate limit for this policy?']),
});

/**
 * Returns all active mock insurance policies.
 */
chatRouter.get('/policies', (_req: Request, res: Response) => {
  res.json({ success: true, policies: policyCatalogService.getPolicies() });
});

/**
 * Downloads the official PDF policy document for a given policy ID.
 */
chatRouter.get('/policies/:policyId/pdf', async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    const policy = policyCatalogService.getPolicyById(policyId);
    const pdfFilename = POLICY_PDF_MAP[policyId];

    if (pdfFilename) {
      const candidatePaths = [
        path.resolve(__dirname, '../../data/policies', pdfFilename),
        path.resolve(process.cwd(), 'data/policies', pdfFilename),
        path.resolve(process.cwd(), 'services/node-api-gateway/data/policies', pdfFilename),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}"`);
          return res.sendFile(p);
        }
      }
    }

    if (policy) {
      const pdfBuffer = await documentRenderingService.renderPdfDocument({
        reportId: policy.policyNumber,
        tenderTitle: `${policy.policyNumber} - ${policy.policyholder}`,
        projectCode: policy.policyNumber,
        generatedDate: new Date().toISOString().split('T')[0],
        reviewerName: 'Centauri Research Underwriting Engine',
        status: 'ACTIVE_POLICY',
        riskScore: 15,
        entities: [policy.policyNumber, policy.policyholder, ...policy.coverages.map((c) => c.name)],
        findings: policy.exclusions.map((e) => ({
          clauseId: e.code,
          description: e.description,
          severity: e.severity,
          recommendation: 'Strict enforcement of policy terms.',
        })),
        graphContextSummary: `Knowledge Graph Traversal Attributed Context for ${policy.policyNumber}`,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${policy.policyNumber}.pdf"`);
      return res.status(200).send(pdfBuffer);
    }

    res.status(404).json({ success: false, error: `Policy ${policyId} not found` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Processes an interactive natural-language question against a selected insurance policy.
 */
chatRouter.post('/query', (req: Request, res: Response) => {
  try {
    const { policyId, question } = QuerySchema.parse(req.body);
    const answer = policyCatalogService.answerQuestion(policyId, question);
    res.json({ success: true, ...answer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Uploads a custom mock insurance policy.
 */
chatRouter.post('/upload', (req: Request, res: Response) => {
  try {
    const parsed = UploadPolicySchema.parse(req.body);
    const newPolicy = policyCatalogService.addPolicy({
      id: parsed.policyNumber,
      ...parsed,
    });
    res.json({ success: true, policy: newPolicy });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
