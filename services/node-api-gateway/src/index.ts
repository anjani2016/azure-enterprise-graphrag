import { createApp } from './app';
import { config } from './config/environment';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[Azure Enterprise GraphRAG Gateway] Listening on port ${config.port}`);
  console.log(`[Config] JVM Graph Service target: ${config.jvmGraphServiceUrl}`);
  console.log(`[Config] Entra ID Tenant: ${config.azure.entraTenantId}`);
  console.log(`[Config] Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('[Azure Enterprise GraphRAG Gateway] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('[Azure Enterprise GraphRAG Gateway] HTTP server closed');
  });
});
