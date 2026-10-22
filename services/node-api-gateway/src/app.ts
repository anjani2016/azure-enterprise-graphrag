import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health.routes';
import { ragRouter } from './routes/rag.routes';
import { hitlRouter } from './routes/hitl.routes';
import { documentRouter } from './routes/document.routes';
import { integrationsRouter } from './routes/integrations.routes';

export function createApp(): Application {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Policy
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));

  // Global Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', limiter);

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Route Mounts
  app.use('/health', healthRouter);
  app.use('/api/rag', ragRouter);
  app.use('/api/hitl/workflows', hitlRouter);
  app.use('/api/docs', documentRouter);
  app.use('/api/integrations', integrationsRouter);

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Error]', err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    });
  });

  return app;
}
