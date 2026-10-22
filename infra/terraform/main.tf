data "azurerm_client_config" "current" {}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  tenant_id = var.entra_tenant_id != "" ? var.entra_tenant_id : data.azurerm_client_config.current.tenant_id
  suffix    = random_string.suffix.result
}

# 1. Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Application = "Azure-Enterprise-GraphRAG"
  }
}

# 2. Observability: Log Analytics & Application Insights
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-epcrag-${var.environment}-${local.suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "main" {
  name                = "appi-epcrag-${var.environment}-${local.suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
}

# 3. Azure Storage Account & Containers
resource "azurerm_storage_account" "main" {
  name                            = "epcrag${local.suffix}"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
}

resource "azurerm_storage_container" "raw" {
  name                  = "raw-documents"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "rendered" {
  name                  = "rendered-reports"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# 4. Azure Key Vault
resource "azurerm_key_vault" "main" {
  name                       = "kv-epcrag-${local.suffix}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = local.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  enable_rbac_authorization  = true
}

# 5. Linux App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "asp-epcrag-${var.environment}-${local.suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "P1v3"
}

# 6. JVM Knowledge Graph Microservice (Java 21 / Spring Boot 3)
resource "azurerm_linux_web_app" "jvm_graph" {
  name                = "app-jvm-graph-${var.environment}-${local.suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      java_server         = "JAVA"
      java_server_version = "21"
      java_version        = "21"
    }
  }

  app_settings = {
    PORT                                  = "8081"
    SPRING_PROFILES_ACTIVE                = var.environment
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
}

# 7. Node.js API Gateway & Orchestrator (Node 20/22 LTS)
resource "azurerm_linux_web_app" "node_gateway" {
  name                = "app-node-gateway-${var.environment}-${local.suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    PORT                                  = "3000"
    NODE_ENV                              = var.environment
    JVM_GRAPH_SERVICE_URL                 = "https://${azurerm_linux_web_app.jvm_graph.default_hostname}"
    AZURE_STORAGE_ACCOUNT_NAME            = azurerm_storage_account.main.name
    AZURE_STORAGE_CONTAINER_RAW           = azurerm_storage_container.raw.name
    AZURE_STORAGE_CONTAINER_RENDERED      = azurerm_storage_container.rendered.name
    AZURE_KEYVAULT_URL                    = azurerm_key_vault.main.vault_uri
    AZURE_ENTRA_TENANT_ID                 = local.tenant_id
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
}

# Staging Slot for Zero-Downtime Deployments
resource "azurerm_linux_web_app_slot" "node_staging" {
  name           = "staging"
  app_service_id = azurerm_linux_web_app.node_gateway.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }
}

# 8. Azure API Management (APIM)
resource "azurerm_api_management" "main" {
  count               = var.enable_apim ? 1 : 0
  name                = "apim-epcrag-${var.environment}-${local.suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  publisher_name      = "Centauri Research"
  publisher_email     = "tech@centauri-research.com"
  sku_name            = "Developer_1"
}
