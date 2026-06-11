import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { corsOrigins, isProd } from './config/env';
import { router } from './routes';
import { errorHandler, notFound } from './middleware/error';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (!isProd) app.use(morgan('dev'));

  // Baseline limiter across the whole API surface.
  app.use(
    '/api',
    rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }),
    router,
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
