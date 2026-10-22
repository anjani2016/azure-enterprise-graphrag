import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { jvmGraphClient } from '../services/jvm-graph.client';
import { azureOpenAiService } from '../services/azure-openai.service';
import { hitlWorkflowService } from '../services/hitl-workflow.service';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

export const ragRouter = Router();

const AnalyzeTenderSchema = z.object({
  tenderTitle: z.string().min(3),
  projectCode: z.string().min(2),
  tenderText: z.string().min(10),
  seedEntityIds: z.array(z.string()).optional().default(['EQ-C-101', 'CLS-GCC-24.1']),
  objective: z.string().optional().default('Screen tender deviations and LD risks against safety standards'),
});

ragRouter.post(
  '/analyze',
  authenticateToken,
  requireRoles(['Engineer', 'ComplianceReviewer', 'Admin']),
  async (req: Request, res: Response) => {
    try {
      const parsed = AnalyzeTenderSchema.parse(req.body);

      // Step 1: Initialize HITL Workflow
      const workflow = hitlWorkflowService.createWorkflow(parsed.tenderTitle, parsed.projectCode);

      // Step 2: Retrieve GraphRAG Knowledge Network from JVM Microservice
      const graphEnrichment = await jvmGraphClient.enrichPromptContext(
        parsed.seedEntityIds,
        parsed.objective
      );

      // Step 3: Run AI Workflow via Azure OpenAI / GitHub Models
      const aiAnalysis = await azureOpenAiService.analyzeTenderWithGraph(
        parsed.tenderText,
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
  const originId = (req.query.originId as string) || 'EQ-C-101';
  const depth = parseInt((req.query.maxDepth as string) || '2', 10);
  const result = await jvmGraphClient.traverse(originId, depth);
  res.status(200).json(result);
});
