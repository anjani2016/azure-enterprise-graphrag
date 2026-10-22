import { config } from '../config/environment';

export interface GraphDocumentMeta {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  contentSnippet: string;
}

export interface TeamsNotificationPayload {
  teamId: string;
  channelId: string;
  title: string;
  summary: string;
  deviationCount: number;
  reportUrl: string;
}

/**
 * Enterprise connector for Microsoft Graph API.
 * Ingests documents from SharePoint/OneDrive and broadcasts compliance alerts to Microsoft Teams.
 */
export class MicrosoftGraphService {
  private accessToken: string | null = null;

  /**
   * Acquires an OAuth 2.0 Client Credentials token from Microsoft Entra ID for Graph.
   */
  async acquireToken(): Promise<string | null> {
    const { msGraphTenantId, msGraphClientId, msGraphClientSecret } = config.integrations;
    if (!msGraphTenantId || !msGraphClientId || !msGraphClientSecret) {
      return null;
    }

    try {
      const tokenUrl = `https://login.microsoftonline.com/${msGraphTenantId}/oauth2/v2.0/token`;
      const params = new URLSearchParams({
        client_id: msGraphClientId,
        client_secret: msGraphClientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!res.ok) throw new Error(`Token request failed with status ${res.status}`);
      const data: any = await res.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (err: any) {
      console.warn(`[MicrosoftGraphService] Token acquisition failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Ingests a document from SharePoint / OneDrive via Microsoft Graph.
   */
  async fetchDocument(driveId: string, itemId: string): Promise<GraphDocumentMeta> {
    const token = await this.acquireToken();
    if (token) {
      try {
        const res = await fetch(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const item: any = await res.json();
          return {
            id: item.id,
            name: item.name,
            size: item.size,
            webUrl: item.webUrl,
            contentSnippet: `Retrieved live SharePoint document: ${item.name}`,
          };
        }
      } catch (err: any) {
        console.warn(`[MicrosoftGraphService] Live fetch failed: ${err.message}. Using simulated doc.`);
      }
    }

    return {
      id: itemId || 'sp-item-4091',
      name: 'IOCL_Panipat_Biogas_Tender_Technical_Spec.pdf',
      size: 4829100,
      webUrl: 'https://centauriresearch.sharepoint.com/sites/epc/tenders/2026/IOCL_Panipat.pdf',
      contentSnippet: 'Simulated SharePoint Document Ingestion: Clause GCC 24.1 LD and OISD-179 compressor limits.',
    };
  }

  /**
   * Posts an audit and compliance notification card to a Microsoft Teams channel.
   */
  async sendTeamsNotification(payload: TeamsNotificationPayload): Promise<{ status: string; messageId: string }> {
    const token = await this.acquireToken();
    if (token) {
      try {
        const url = `https://graph.microsoft.com/v1.0/teams/${payload.teamId}/channels/${payload.channelId}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: {
              contentType: 'html',
              content: `<h3>🚨 Centauri GraphRAG Alert: ${payload.title}</h3>
              <p>${payload.summary}</p>
              <p><strong>Deviations Flagged:</strong> ${payload.deviationCount}</p>
              <p><a href="${payload.reportUrl}">View Compliance Matrix PDF</a></p>`,
            },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          return { status: 'POSTED_TEAMS', messageId: data.id };
        }
      } catch (err: any) {
        console.warn(`[MicrosoftGraphService] Teams post failed: ${err.message}`);
      }
    }

    return {
      status: 'SIMULATED_TEAMS_NOTIFICATION',
      messageId: `msg-${Date.now()}`,
    };
  }
}

export const microsoftGraphService = new MicrosoftGraphService();
