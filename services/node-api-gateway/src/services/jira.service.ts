import { config } from '../config/environment';

export interface JiraIssuePayload {
  projectKey: string;
  summary: string;
  description: string;
  issueType?: string;
  priority?: 'High' | 'Medium' | 'Low';
  labels?: string[];
}

export interface JiraResponse {
  id: string;
  key: string;
  self: string;
  status: string;
}

/**
 * Enterprise connector for Atlassian Jira REST API v3.
 * Automatically logs tender requirement tasks and mitigation work items.
 */
export class JiraService {
  private jiraHost: string;
  private authHeader?: string;

  constructor() {
    this.jiraHost = config.integrations.jiraHost.replace(/\/$/, '');
    if (config.integrations.jiraEmail && config.integrations.jiraApiToken) {
      const token = Buffer.from(
        `${config.integrations.jiraEmail}:${config.integrations.jiraApiToken}`
      ).toString('base64');
      this.authHeader = `Basic ${token}`;
    }
  }

  /**
   * Creates a tracking task or bug in Jira.
   */
  async createIssue(payload: JiraIssuePayload): Promise<JiraResponse> {
    if (this.jiraHost && this.authHeader) {
      try {
        const body = {
          fields: {
            project: { key: payload.projectKey },
            summary: payload.summary,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: payload.description }],
                },
              ],
            },
            issuetype: { name: payload.issueType || 'Task' },
            labels: payload.labels || ['epc-rag', 'tender-deviation'],
          },
        };

        const res = await fetch(`${this.jiraHost}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.authHeader,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`Jira responded with status ${res.status}`);
        const data: any = await res.json();
        return {
          id: data.id,
          key: data.key,
          self: data.self,
          status: 'CREATED_REMOTE',
        };
      } catch (err: any) {
        console.warn(`[JiraService] Jira remote call failed: ${err.message}. Using simulated issue.`);
      }
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    return {
      id: `jira-id-${randomNum}`,
      key: `${payload.projectKey || 'EPC'}-${randomNum}`,
      self: `https://jira.centauri-research.internal/browse/${payload.projectKey || 'EPC'}-${randomNum}`,
      status: 'SIMULATED_LOCAL',
    };
  }
}

export const jiraService = new JiraService();
