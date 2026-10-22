output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "node_gateway_url" {
  value = "https://${azurerm_linux_web_app.node_gateway.default_hostname}"
}

output "jvm_graph_url" {
  value = "https://${azurerm_linux_web_app.jvm_graph.default_hostname}"
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "apim_gateway_url" {
  value = var.enable_apim ? azurerm_api_management.main[0].gateway_url : null
}
