import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { config } from '../config/environment';

/**
 * Service managing enterprise secrets from Azure Key Vault.
 */
export class AzureKeyVaultService {
  private client: SecretClient | null = null;
  private localSecretsCache: Map<string, string> = new Map();

  constructor() {
    this.initClient();
  }

  private initClient() {
    if (config.azure.keyVaultUrl) {
      try {
        this.client = new SecretClient(config.azure.keyVaultUrl, new DefaultAzureCredential());
      } catch (err: any) {
        console.warn(`[AzureKeyVaultService] Failed to initialize Key Vault client: ${err.message}`);
      }
    }
  }

  /**
   * Retrieves a secret by name from Azure Key Vault with fallback to process.env.
   */
  async getSecret(secretName: string): Promise<string | undefined> {
    if (this.localSecretsCache.has(secretName)) {
      return this.localSecretsCache.get(secretName);
    }

    if (this.client) {
      try {
        const secret = await this.client.getSecret(secretName);
        if (secret.value) {
          this.localSecretsCache.set(secretName, secret.value);
          return secret.value;
        }
      } catch (err: any) {
        console.warn(`[AzureKeyVaultService] Secret ${secretName} lookup failed: ${err.message}. Checking env.`);
      }
    }

    // Fallback to environment variable format
    const envKey = secretName.toUpperCase().replace(/-/g, '_');
    return process.env[envKey];
  }
}

export const azureKeyVaultService = new AzureKeyVaultService();
