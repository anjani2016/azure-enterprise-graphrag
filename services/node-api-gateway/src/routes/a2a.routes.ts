import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { a2aOrchestratorService } from '../services/a2a-orchestrator.service';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

export const a2aRouter = Router();

const A2ARequestSchema = z.object({
  claimText: z.string().min(10),
  policyNumber: z.string().optional(),
});

a2aRouter.post(
  '/collaborate',
  authenticateToken,
  requireRoles(['ClaimsAdjuster', 'Underwriter', 'ComplianceReviewer', 'Admin']),
  async (req: Request, res: Response) => {
    try {
      const parsed = A2ARequestSchema.parse(req.body);
      const result = await a2aOrchestratorService.runMultiAgentAdjudication(parsed.claimText, parsed.policyNumber);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
);
