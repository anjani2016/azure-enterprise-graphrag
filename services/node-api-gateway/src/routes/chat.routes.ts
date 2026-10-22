import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { policyCatalogService } from '../services/policy-catalog.service';

export const chatRouter = Router();

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
