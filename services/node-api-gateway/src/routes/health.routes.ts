import { Router, Request, Response } from 'express';
import { jvmGraphClient } from '../services/jvm-graph.client';

export const healthRouter = Router();

healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'node-api-gateway',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

healthRouter.get('/ready', async (_req: Request, res: Response) => {
  const jvmStats = await jvmGraphClient.getStats();
  const isJvmHealthy = jvmStats.totalNodes !== undefined;

  res.status(isJvmHealthy ? 200 : 503).json({
    status: isJvmHealthy ? 'READY' : 'DEGRADED',
    dependencies: {
      jvmGraphService: isJvmHealthy ? 'UP' : 'DOWN',
      jvmStats,
    },
    systemMemory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
});
