import type { Request, RequestHandler } from 'express';
import { hasPermission, type AdminRole, type PermissionKey } from '@sm/shared';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/** Requires a valid access token; attaches `req.auth`. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(AppError.unauthorized());
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};

/** Attaches `req.auth` if a valid token is present, but allows guests through. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.auth = verifyAccessToken(token);
    } catch {
      /* ignore — treat as guest */
    }
  }
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.auth) return next(AppError.unauthorized());
  if (req.auth.kind !== 'admin') return next(AppError.forbidden('Admin access required'));
  next();
};

export const requireCustomer: RequestHandler = (req, _res, next) => {
  if (!req.auth) return next(AppError.unauthorized());
  if (req.auth.kind !== 'customer') return next(AppError.forbidden('Customer access required'));
  next();
};

export const requireRole =
  (...roles: AdminRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || req.auth.kind !== 'admin' || !req.auth.role) {
      return next(AppError.forbidden('Admin access required'));
    }
    if (!roles.includes(req.auth.role)) return next(AppError.forbidden());
    next();
  };

export const requirePermission =
  (permission: PermissionKey): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || req.auth.kind !== 'admin' || !req.auth.role) {
      return next(AppError.forbidden('Admin access required'));
    }
    if (!hasPermission(req.auth.role, permission, req.auth.ovr ?? [])) {
      return next(AppError.forbidden());
    }
    next();
  };
