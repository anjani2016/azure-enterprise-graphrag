import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { serviceNowService } from '../services/servicenow.service';
import { jiraService } from '../services/jira.service';
import { microsoftGraphService } from '../services/microsoft-graph.service';
import { hitlWorkflowService } from '../services/hitl-workflow.service';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

export const integrationsRouter = Router();

const SNowSchema = z.object({
  workflowId: z.string().optional(),
  shortDescription: z.string().min(5),
  description: z.string().min(10),
  urgency: z.enum(['1', '2', '3']).default('1'),
  impact: z.enum(['1', '2', '3']).default('1'),
});

const JiraSchema = z.object({
  workflowId: z.string().optional(),
  projectKey: z.string().default('EPC'),
  summary: z.string().min(5),
  description: z.string().min(10),
  priority: z.enum(['High', 'Medium', 'Low']).default('High'),
});

const TeamsSchema = z.object({
  teamId: z.string().default('team-epc-risk'),
  channelId: z.string().default('channel-tenders'),
  title: z.string().min(3),
  summary: z.string().min(5),
  deviationCount: z.number().default(2),
  reportUrl: z.string().url().or(z.string().min(5)),
});

integrationsRouter.post(
  '/servicenow/incident',
  authenticateToken,
  requireRoles(['Engineer', 'ComplianceReviewer', 'Admin']),
  async (req: Request, res: Response) => {
    try {
      const parsed = SNowSchema.parse(req.body);
      const ticket = await serviceNowService.createIncident({
        shortDescription: parsed.shortDescription,
        description: parsed.description,
        urgency: parsed.urgency,
        impact: parsed.impact,
      });

      if (parsed.workflowId) {
        hitlWorkflowService.markDispatched(parsed.workflowId, { serviceNowIncidentId: ticket.number });
      }

      res.status(201).json({ success: true, ticket });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

integrationsRouter.post(
  '/jira/issue',
  authenticateToken,
  requireRoles(['Engineer', 'ComplianceReviewer', 'Admin']),
  async (req: Request, res: Response) => {
    try {
      const parsed = JiraSchema.parse(req.body);
      const issue = await jiraService.createIssue({
        projectKey: parsed.projectKey,
        summary: parsed.summary,
        description: parsed.description,
        priority: parsed.priority,
      });

      if (parsed.workflowId) {
        hitlWorkflowService.markDispatched(parsed.workflowId, { jiraIssueKey: issue.key });
      }

      res.status(201).json({ success: true, issue });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

integrationsRouter.post(
  '/msgraph/notify',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const parsed = TeamsSchema.parse(req.body);
      const notification = await microsoftGraphService.sendTeamsNotification({
        teamId: parsed.teamId,
        channelId: parsed.channelId,
        title: parsed.title,
        summary: parsed.summary,
        deviationCount: parsed.deviationCount,
        reportUrl: parsed.reportUrl,
      });

      res.status(200).json({ success: true, notification });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);
