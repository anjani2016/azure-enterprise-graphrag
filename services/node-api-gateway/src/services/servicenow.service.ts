import { config } from '../config/environment';

export interface ServiceNowIncidentPayload {
  shortDescription: string;
  description: string;
  urgency: '1' | '2' | '3'; // 1=High, 2=Medium, 3=Low
  impact: '1' | '2' | '3';
  assignmentGroup?: string;
}

export interface ServiceNowResponse {
  sys_id: string;
  number: string;
  status: string;
}

/**
 * Enterprise connector for ServiceNow REST Table API.
 * Synchronizes high-risk EPC compliance deviations and safety violations.
 */
export class ServiceNowService {
  private instanceUrl: string;
  private authHeader?: string;

  constructor() {
    this.instanceUrl = config.integrations.serviceNowInstance.replace(/\/$/, '');
    if (config.integrations.serviceNowUser && config.integrations.serviceNowPassword) {
      const token = Buffer.from(
        `${config.integrations.serviceNowUser}:${config.integrations.serviceNowPassword}`
      ).toString('base64');
      this.authHeader = `Basic ${token}`;
    }
  }

  /**
   * Creates an incident ticket in ServiceNow for critical compliance failures.
   */
  async createIncident(payload: ServiceNowIncidentPayload): Promise<ServiceNowResponse> {
    if (this.instanceUrl && this.authHeader) {
      try {
        const res = await fetch(`${this.instanceUrl}/api/now/table/incident`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.authHeader,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            short_description: payload.shortDescription,
            description: payload.description,
            urgency: payload.urgency,
            impact: payload.impact,
            assignment_group: payload.assignmentGroup || 'EPC Engineering Risk',
          }),
        });

        if (!res.ok) throw new Error(`ServiceNow responded with status ${res.status}`);
        const data: any = await res.json();
        return {
          sys_id: data.result.sys_id,
          number: data.result.number,
          status: 'CREATED_REMOTE',
        };
      } catch (err: any) {
        console.warn(`[ServiceNowService] Remote call failed: ${err.message}. Using simulated ticket.`);
      }
    }

    return {
      sys_id: `sys-${Math.random().toString(36).substring(2, 10)}`,
      number: `INC${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SIMULATED_LOCAL',
    };
  }
}

export const serviceNowService = new ServiceNowService();
