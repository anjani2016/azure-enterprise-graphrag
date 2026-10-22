import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { jvmGraphClient } from '../services/jvm-graph.client';
import { azureOpenAiService } from '../services/azure-openai.service';
import { hitlWorkflowService } from '../services/hitl-workflow.service';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

export const ragRouter = Router();

const AdjudicateClaimSchema = z.object({
  claimTitle: z.string().optional(),
  policyNumber: z.string().optional(),
  claimText: z.string().optional(),
  // Fallbacks for backwards compatibility
  tenderTitle: z.string().optional(),
  projectCode: z.string().optional(),
  tenderText: z.string().optional(),
  seedEntityIds: z.array(z.string()).optional().default(['CLM-2026-8801', 'POL-CYBER-PROP-2026-99']),
  objective: z.string().optional().default('Adjudicate claim coverage, waiting periods, and policy exclusion triggers'),
}).refine(
  data => (data.claimText && data.claimText.length >= 10) || (data.tenderText && data.tenderText.length >= 10),
  { message: 'Either claimText or tenderText must be provided with at least 10 characters' }
);

ragRouter.post(
  '/analyze',
  authenticateToken,
  requireRoles(['ClaimsAdjuster', 'Underwriter', 'ComplianceReviewer', 'Engineer', 'Admin']),
  async (req: Request, res: Response) => {
    try {
      const parsed = AdjudicateClaimSchema.parse(req.body);
      const title = parsed.claimTitle || parsed.tenderTitle || 'Commercial Claim Review';
      const referenceCode = parsed.policyNumber || parsed.projectCode || 'POL-CYBER-PROP-2026-99';
      const textToAnalyze = parsed.claimText || parsed.tenderText || '';

      // Step 1: Initialize HITL Workflow
      const workflow = hitlWorkflowService.createWorkflow(title, referenceCode);

      // Step 2: Retrieve GraphRAG Knowledge Network from JVM Microservice
      const graphEnrichment = await jvmGraphClient.enrichPromptContext(
        parsed.seedEntityIds,
        parsed.objective
      );

      // Step 3: Run AI Workflow via Azure OpenAI / GitHub Models
      const aiAnalysis = await azureOpenAiService.analyzeClaimWithGraph(
        textToAnalyze,
        graphEnrichment.formattedContext,
        parsed.objective
      );

      // Step 4: Advance HITL state machine to PENDING_HUMAN_REVIEW
      const updatedWorkflow = hitlWorkflowService.attachAnalysis(workflow.workflowId, aiAnalysis);

      res.status(200).json({
        success: true,
        workflowId: updatedWorkflow.workflowId,
        status: updatedWorkflow.status,
        graphSummary: {
          entitiesFound: graphEnrichment.totalNodes,
          edgesFound: graphEnrichment.totalEdges,
        },
        aiAnalysis,
        auditTrail: {
          submittedBy: req.user?.sub,
          timestamp: updatedWorkflow.createdAt,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

ragRouter.get('/graph-query', authenticateToken, async (req: Request, res: Response) => {
  const originId = (req.query.originId as string) || 'CLM-2026-8801';
  const depth = parseInt((req.query.maxDepth as string) || '2', 10);
  const result = await jvmGraphClient.traverse(originId, depth);
  res.status(200).json(result);
});
