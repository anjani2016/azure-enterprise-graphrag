import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JVM Microservice integration
  jvmGraphServiceUrl: process.env.JVM_GRAPH_SERVICE_URL || 'http://localhost:8081',

  // Azure Cloud Configurations
  azure: {
    openAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    openAiApiKey: process.env.AZURE_OPENAI_API_KEY || '',
    openAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    storageContainerRaw: process.env.AZURE_STORAGE_CONTAINER_RAW || 'raw-documents',
    storageContainerRendered: process.env.AZURE_STORAGE_CONTAINER_RENDERED || 'rendered-reports',
    keyVaultUrl: process.env.AZURE_KEYVAULT_URL || '',
    entraTenantId: process.env.AZURE_ENTRA_TENANT_ID || 'common',
    entraClientId: process.env.AZURE_ENTRA_CLIENT_ID || '',
    entraAudience: process.env.AZURE_ENTRA_AUDIENCE || 'api://azure-enterprise-graphrag',
  },

  // Enterprise Connectors
  integrations: {
    serviceNowInstance: process.env.SERVICENOW_INSTANCE || '',
    serviceNowUser: process.env.SERVICENOW_USER || '',
    serviceNowPassword: process.env.SERVICENOW_PASSWORD || '',
    jiraHost: process.env.JIRA_HOST || '',
    jiraEmail: process.env.JIRA_EMAIL || '',
    jiraApiToken: process.env.JIRA_API_TOKEN || '',
    msGraphTenantId: process.env.MS_GRAPH_TENANT_ID || '',
    msGraphClientId: process.env.MS_GRAPH_CLIENT_ID || '',
    msGraphClientSecret: process.env.MS_GRAPH_CLIENT_SECRET || '',
  }
};
