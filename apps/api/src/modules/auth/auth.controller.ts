import type { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { env, isProd } from '../../config/env';
import { verifyRefreshToken } from '../../utils/jwt';
import { forgotSchema, googleSchema, loginSchema, registerSchema, resetSchema } from './auth.validation';
import * as authService from './auth.service';

type Kind = 'admin' | 'customer';

const REFRESH_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function cookieName(kind: Kind): string {
  return kind === 'admin' ? env.ADMIN_REFRESH_COOKIE : env.CUSTOMER_REFRESH_COOKIE;
}

function setRefreshCookie(res: Response, kind: Kind, token: string): void {
  res.cookie(cookieName(kind), token, {
    httpOnly: true,
    secure: isProd,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response, kind: Kind): void {
  res.clearCookie(cookieName(kind), { path: '/api/auth', domain: env.COOKIE_DOMAIN });
}

// ── customer ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerCustomer(input);
  setRefreshCookie(res, 'customer', refreshToken);
  res.status(201).json({ accessToken, user });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginCustomer(input);
  setRefreshCookie(res, 'customer', refreshToken);
  res.json({ accessToken, user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[cookieName('customer')] as string | undefined;
  if (!token) throw AppError.unauthorized('No active session');
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Session expired');
  }
  if (decoded.kind !== 'customer') throw AppError.unauthorized();
  const { user, accessToken, refreshToken } = await authService.refreshCustomer(decoded);
  setRefreshCookie(res, 'customer', refreshToken);
  res.json({ accessToken, user });
});

export const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res, 'customer');
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await authService.getCustomer(req.auth!.sub) });
});

// ── admin ────────────────────────────────────────────────────────────────────
export const adminLogin = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginAdmin(input);
  setRefreshCookie(res, 'admin', refreshToken);
  res.json({ accessToken, user });
});

export const adminRefresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[cookieName('admin')] as string | undefined;
  if (!token) throw AppError.unauthorized('No active session');
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Session expired');
  }
  if (decoded.kind !== 'admin') throw AppError.unauthorized();
  const { user, accessToken, refreshToken } = await authService.refreshAdmin(decoded);
  setRefreshCookie(res, 'admin', refreshToken);
  res.json({ accessToken, user });
});

export const adminLogout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res, 'admin');
  res.status(204).send();
});

export const adminMe = asyncHandler(async (req, res) => {
  res.json({ user: await authService.getAdmin(req.auth!.sub) });
});

// ── customer: google + password reset ────────────────────────────────────────
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = googleSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginWithGoogle(idToken);
  setRefreshCookie(res, 'customer', refreshToken);
  res.json({ accessToken, user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotSchema.parse(req.body);
  await authService.requestPasswordReset(email);
  res.json({ ok: true });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  await authService.resetPassword(token, password);
  res.json({ ok: true });
});
