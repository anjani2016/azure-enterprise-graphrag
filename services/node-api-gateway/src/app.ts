import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthRouter } from './routes/health.routes';
import { ragRouter } from './routes/rag.routes';
import { hitlRouter } from './routes/hitl.routes';
import { documentRouter } from './routes/document.routes';
import { integrationsRouter } from './routes/integrations.routes';
import { mcpRouter } from './routes/mcp.routes';
import { a2aRouter } from './routes/a2a.routes';
import { chatRouter } from './routes/chat.routes';
import { renderDashboardHtml } from './services/dashboard.service';

export function createApp(): Application {
  const app = express();

  // Security Headers with CSP allowing inline dashboard scripts and styles
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    })
  );

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

  // Interactive Web UI Dashboard
  app.get('/', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderDashboardHtml());
  });

  app.get('/dashboard', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderDashboardHtml());
  });

  // Route Mounts
  app.use('/health', healthRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/rag', ragRouter);
  app.use('/api/hitl/workflows', hitlRouter);
  app.use('/api/docs', documentRouter);
  app.use('/api/integrations', integrationsRouter);
  app.use('/api/mcp', mcpRouter);
  app.use('/api/agents', a2aRouter);

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
