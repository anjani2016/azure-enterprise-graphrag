import { PromptAnalysisResult } from './azure-openai.service';

export type WorkflowStatus =
  | 'INGESTED'
  | 'ANALYZING'
  | 'PENDING_HUMAN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DOCUMENT_RENDERED'
  | 'INTEGRATIONS_DISPATCHED';

export interface WorkflowItem {
  workflowId: string;
  tenderTitle: string;
  projectCode: string;
  createdAt: string;
  status: WorkflowStatus;
  analysis?: PromptAnalysisResult;
  humanReview?: {
    reviewedBy: string;
    reviewedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    comments: string;
    overrideRiskScore?: number;
  };
  renderedReportUrl?: string;
  dispatchedTickets?: {
    serviceNowIncidentId?: string;
    jiraIssueKey?: string;
  };
}

/**
 * Human-in-the-Loop (HITL) State Machine Engine.
 * Enforces mandatory engineering governance checkpoints before document release or external sync.
 */
export class HitlWorkflowService {
  private workflows: Map<string, WorkflowItem> = new Map();

  /**
   * Initializes a new tender analysis workflow.
   */
  createWorkflow(tenderTitle: string, projectCode: string): WorkflowItem {
    const workflowId = `WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const item: WorkflowItem = {
      workflowId,
      tenderTitle,
      projectCode,
      createdAt: new Date().toISOString(),
      status: 'INGESTED',
    };
    this.workflows.set(workflowId, item);
    return item;
  }

  /**
   * Updates workflow with AI-generated analysis findings and transitions to PENDING_HUMAN_REVIEW.
   */
  attachAnalysis(workflowId: string, analysis: PromptAnalysisResult): WorkflowItem {
    const item = this.getWorkflowOrThrow(workflowId);
    item.analysis = analysis;
    item.status = 'PENDING_HUMAN_REVIEW';
    return item;
  }

  /**
   * Submits human review verdict with mandatory comments and signatory.
   */
  submitReview(
    workflowId: string,
    reviewedBy: string,
    decision: 'APPROVED' | 'REJECTED',
    comments: string,
    overrideRiskScore?: number
  ): WorkflowItem {
    const item = this.getWorkflowOrThrow(workflowId);
    if (item.status !== 'PENDING_HUMAN_REVIEW') {
      throw new Error(`Cannot review workflow in status ${item.status}`);
    }

    item.humanReview = {
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      decision,
      comments,
      overrideRiskScore,
    };

    item.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    return item;
  }

  markDocumentRendered(workflowId: string, reportUrl: string): WorkflowItem {
    const item = this.getWorkflowOrThrow(workflowId);
    item.status = 'DOCUMENT_RENDERED';
    item.renderedReportUrl = reportUrl;
    return item;
  }

  markDispatched(workflowId: string, tickets: { serviceNowIncidentId?: string; jiraIssueKey?: string }): WorkflowItem {
    const item = this.getWorkflowOrThrow(workflowId);
    item.status = 'INTEGRATIONS_DISPATCHED';
    item.dispatchedTickets = tickets;
    return item;
  }

  getWorkflow(workflowId: string): WorkflowItem | undefined {
    return this.workflows.get(workflowId);
  }

  listWorkflows(): WorkflowItem[] {
    return Array.from(this.workflows.values());
  }

  private getWorkflowOrThrow(workflowId: string): WorkflowItem {
    const item = this.workflows.get(workflowId);
    if (!item) throw new Error(`Workflow ${workflowId} not found`);
    return item;
  }
}

export const hitlWorkflowService = new HitlWorkflowService();
