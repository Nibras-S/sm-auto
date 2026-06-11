import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { isProd } from '../config/env';

export const notFound: RequestHandler = (_req, _res, next) => {
  next(AppError.notFound('Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten() },
    });
  }

  // Mongo duplicate-key error
  if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_KEY',
        message: 'A resource with these details already exists',
        details: (err as { keyValue?: unknown }).keyValue,
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'Something went wrong' : ((err as Error)?.message ?? 'Unknown error'),
    },
  });
};
