import express from 'express';
import chatRoutes from './routes/chatRoutes';
import { QuotaResetScheduler } from '../infrastructure/scheduler/QuotaResetScheduler';

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', chatRoutes);

  // Start quota reset scheduler
  QuotaResetScheduler.start();

  return app;
}

