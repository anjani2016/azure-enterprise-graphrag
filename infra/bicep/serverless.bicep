@description('Deployment environment name (e.g., dev, staging, prod)')
param environmentName string = 'dev'

@description('Primary Azure region for all resources')
param location string = resourceGroup().location

@description('Azure Entra ID Tenant ID for OAuth 2.0 / OIDC verification')
param entraTenantId string = tenant().tenantId

@description('Unique suffix for globally unique resource names')
param uniqueSuffix string = substring(uniqueString(resourceGroup().id), 0, 6)

@description('Container image for JVM Graph Microservice (default: quickstart starter image until built)')
param jvmImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

@description('Container image for Node.js Gateway Microservice (default: quickstart starter image until built)')
param nodeImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

var containerAppEnvName = 'cae-epcrag-${environmentName}-${uniqueSuffix}'
var nodeGatewayAppName = 'app-node-gateway-${environmentName}-${uniqueSuffix}'
var jvmGraphAppName = 'app-jvm-graph-${environmentName}-${uniqueSuffix}'
var storageAccountName = 'epcrag${uniqueSuffix}'
var keyVaultName = 'kv-epcrag-${uniqueSuffix}'
var appInsightsName = 'appi-epcrag-${environmentName}'
var logAnalyticsName = 'log-epcrag-${environmentName}'

// 1. Log Analytics Workspace & Application Insights (Telemetry)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// 2. Azure Storage Account (Raw tenders & Rendered PDF/HTML)
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource rawDocsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'raw-documents'
  properties: {
    publicAccess: 'None'
  }
}

resource renderedReportsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'rendered-reports'
  properties: {
    publicAccess: 'None'
  }
}

// 3. Azure Key Vault (RBAC enabled, Standard tier)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: entraTenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

// 4. Serverless Azure Container Apps Managed Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// 5. Internal Serverless JVM Graph Microservice (Scale to 0 when idle)
resource jvmGraphApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: jvmGraphAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 8081
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'jvm-graph-service'
          image: jvmImage
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
          env: [
            { name: 'PORT', value: '8081' }
            { name: 'SPRING_PROFILES_ACTIVE', value: environmentName }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '20'
              }
            }
          }
        ]
      }
    }
  }
}

// 6. External Serverless Node.js API Gateway (Scale to 0 when idle, built-in HTTPS ingress)
resource nodeGatewayApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: nodeGatewayAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'node-api-gateway'
          image: nodeImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'PORT', value: '3000' }
            { name: 'NODE_ENV', value: environmentName }
            { name: 'JVM_GRAPH_SERVICE_URL', value: 'http://${jvmGraphAppName}' }
            { name: 'AZURE_STORAGE_ACCOUNT_NAME', value: storageAccount.name }
            { name: 'AZURE_STORAGE_CONTAINER_RAW', value: 'raw-documents' }
            { name: 'AZURE_STORAGE_CONTAINER_RENDERED', value: 'rendered-reports' }
            { name: 'AZURE_KEYVAULT_URL', value: keyVault.properties.vaultUri }
            { name: 'AZURE_ENTRA_TENANT_ID', value: entraTenantId }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '30'
              }
            }
          }
        ]
      }
    }
  }
}

// 7. Role Assignments: Grant Gateway Managed Identity access to Storage & Key Vault
// Storage Blob Data Contributor Role ID: ba92f5b4-2d11-453d-a403-e96b0029c9fe
resource storageBlobDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, nodeGatewayApp.id, 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
    principalId: nodeGatewayApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Key Vault Secrets User Role ID: 4633458b-17de-408a-b874-0445c86b69e6
resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, nodeGatewayApp.id, '4633458b-17de-408a-b874-0445c86b69e6')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: nodeGatewayApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output nodeGatewayUrl string = 'https://${nodeGatewayApp.properties.configuration.ingress.fqdn}'
output jvmGraphInternalUrl string = 'http://${jvmGraphAppName}'
output keyVaultUri string = keyVault.properties.vaultUri
output storageAccountName string = storageAccount.name
output containerAppEnvName string = containerAppEnv.name
