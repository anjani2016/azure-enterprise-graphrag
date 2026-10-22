import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { hitlWorkflowService } from '../services/hitl-workflow.service';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

export const hitlRouter = Router();

const ReviewSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().min(5),
  overrideRiskScore: z.number().min(0).max(100).optional(),
});

hitlRouter.get('/', authenticateToken, (_req: Request, res: Response) => {
  res.status(200).json(hitlWorkflowService.listWorkflows());
});

hitlRouter.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const item = hitlWorkflowService.getWorkflow(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  res.status(200).json(item);
});

hitlRouter.post(
  '/:id/review',
  authenticateToken,
  requireRoles(['ComplianceReviewer', 'Admin']),
  (req: Request, res: Response) => {
    try {
      const parsed = ReviewSchema.parse(req.body);
      const reviewer = req.user?.name || req.user?.email || 'Authorized Lead Reviewer';

      const updated = hitlWorkflowService.submitReview(
        req.params.id,
        reviewer,
        parsed.decision,
        parsed.comments,
        parsed.overrideRiskScore
      );

      res.status(200).json({
        success: true,
        workflowId: updated.workflowId,
        status: updated.status,
        humanReview: updated.humanReview,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);
