import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { config } from '../config/environment';

/**
 * Service managing document persistence in Azure Blob Storage.
 */
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient | null = null;
  private rawContainerClient: ContainerClient | null = null;
  private renderedContainerClient: ContainerClient | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    try {
      if (config.azure.storageConnectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(config.azure.storageConnectionString);
      } else if (process.env.AZURE_STORAGE_ACCOUNT_NAME) {
        const url = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
        this.blobServiceClient = new BlobServiceClient(url, new DefaultAzureCredential());
      }

      if (this.blobServiceClient) {
        this.rawContainerClient = this.blobServiceClient.getContainerClient(config.azure.storageContainerRaw);
        this.renderedContainerClient = this.blobServiceClient.getContainerClient(config.azure.storageContainerRendered);
      }
    } catch (err: any) {
      console.warn(`[AzureBlobService] Cloud Blob Storage not connected: ${err.message}. Using virtual storage.`);
    }
  }

  /**
   * Uploads raw incoming tender document buffer to Azure Blob Storage.
   */
  async uploadRawDocument(blobName: string, buffer: Buffer, mimeType: string): Promise<string> {
    if (this.rawContainerClient) {
      await this.rawContainerClient.createIfNotExists();
      const blockBlobClient = this.rawContainerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: mimeType },
      });
      return blockBlobClient.url;
    }
    return `https://epcragstorage.blob.core.windows.net/raw-documents/${blobName}`;
  }

  /**
   * Uploads rendered business documents (HTML / PDF) to Azure Blob Storage.
   */
  async uploadRenderedReport(blobName: string, content: string | Buffer, contentType: string): Promise<string> {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
    if (this.renderedContainerClient) {
      await this.renderedContainerClient.createIfNotExists();
      const blockBlobClient = this.renderedContainerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      return blockBlobClient.url;
    }
    return `https://epcragstorage.blob.core.windows.net/rendered-reports/${blobName}`;
  }
}

export const azureBlobService = new AzureBlobService();
