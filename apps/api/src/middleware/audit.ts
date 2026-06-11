import type { RequestHandler } from 'express';
import { AuditLog } from '../models/AuditLog';

/**
 * Records admin write actions (non-GET) after a successful response. Registered
 * early; reads req.auth in the finish handler (set by the route's authenticate).
 */
export const auditLog: RequestHandler = (req, res, next) => {
  if (req.method === 'GET') return next();
  res.on('finish', () => {
    if (req.auth?.kind === 'admin' && res.statusCode < 400) {
      void AuditLog.create({
        actor: req.auth.sub,
        action: `${req.method} ${req.originalUrl}`,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
      }).catch(() => undefined);
    }
  });
  next();
};
