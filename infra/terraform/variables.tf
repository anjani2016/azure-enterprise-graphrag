variable "environment" {
  type        = string
  description = "Target deployment environment (e.g. dev, staging, prod)"
  default     = "prod"
}

variable "location" {
  type        = string
  description = "Azure region for all resources"
  default     = "canadacentral"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
  default     = "rg-epc-graphrag-prod"
}

variable "entra_tenant_id" {
  type        = string
  description = "Microsoft Entra ID Tenant ID for OAuth 2.0 / OIDC authentication"
  default     = ""
}

variable "enable_apim" {
  type        = bool
  description = "Whether to provision Azure API Management (Developer SKU)"
  default     = true
}
