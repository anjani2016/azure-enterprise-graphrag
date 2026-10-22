@description('Deployment environment name (e.g., dev, staging, prod)')
param environmentName string = 'prod'

@description('Primary Azure region for all resources')
param location string = resourceGroup().location

@description('Azure Entra ID Tenant ID for OAuth 2.0 / OIDC verification')
param entraTenantId string = tenant().tenantId

@description('Unique suffix for globally unique resource names')
param uniqueSuffix string = substring(uniqueString(resourceGroup().id), 0, 6)

var appServicePlanName = 'asp-epc-rag-${environmentName}'
var nodeGatewayAppName = 'app-node-gateway-${environmentName}-${uniqueSuffix}'
var jvmGraphAppName = 'app-jvm-graph-${environmentName}-${uniqueSuffix}'
var storageAccountName = 'epcrag${uniqueSuffix}'
var keyVaultName = 'kv-epcrag-${uniqueSuffix}'
var apimName = 'apim-epcrag-${environmentName}-${uniqueSuffix}'
var appInsightsName = 'appi-epcrag-${environmentName}'
var logAnalyticsName = 'log-epcrag-${environmentName}'

// 1. Log Analytics Workspace & Application Insights
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

// 3. Azure Key Vault
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

// 4. Linux App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'P1v3'
    tier: 'PremiumV3'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// 5. JVM Knowledge Graph Microservice (Java 21 / Spring Boot)
resource jvmGraphApp 'Microsoft.Web/sites@2023-12-01' = {
  name: jvmGraphAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'JAVA|21-java21'
      appSettings: [
        { name: 'PORT', value: '8081' }
        { name: 'SPRING_PROFILES_ACTIVE', value: environmentName }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
      ]
    }
  }
}

// 6. Node.js Gateway & Orchestrator Microservice (Node 22 LTS)
resource nodeGatewayApp 'Microsoft.Web/sites@2023-12-01' = {
  name: nodeGatewayAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'PORT', value: '3000' }
        { name: 'NODE_ENV', value: environmentName }
        { name: 'JVM_GRAPH_SERVICE_URL', value: 'https://${jvmGraphApp.properties.defaultHostName}' }
        { name: 'AZURE_STORAGE_ACCOUNT_NAME', value: storageAccount.name }
        { name: 'AZURE_STORAGE_CONTAINER_RAW', value: 'raw-documents' }
        { name: 'AZURE_STORAGE_CONTAINER_RENDERED', value: 'rendered-reports' }
        { name: 'AZURE_KEYVAULT_URL', value: keyVault.properties.vaultUri }
        { name: 'AZURE_ENTRA_TENANT_ID', value: entraTenantId }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
      ]
    }
  }
}

// Deployment Slots for Zero-Downtime Releases
resource nodeGatewayStagingSlot 'Microsoft.Web/sites/slots@2023-12-01' = {
  parent: nodeGatewayApp
  name: 'staging'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
  }
}

// 7. Azure API Management (APIM)
resource apiManagement 'Microsoft.ApiManagement/service@2023-05-01-preview' = {
  name: apimName
  location: location
  sku: {
    name: 'Developer'
    capacity: 1
  }
  properties: {
    publisherEmail: 'tech@centauri-research.com'
    publisherName: 'Centauri Research'
  }
}

output nodeGatewayUrl string = 'https://${nodeGatewayApp.properties.defaultHostName}'
output jvmGraphUrl string = 'https://${jvmGraphApp.properties.defaultHostName}'
output keyVaultUri string = keyVault.properties.vaultUri
output storageAccountName string = storageAccount.name
