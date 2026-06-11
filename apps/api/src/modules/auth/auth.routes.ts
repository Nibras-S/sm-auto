import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, requireAdmin, requireCustomer } from '../../middleware/auth';
import * as c from './auth.controller';

// Stricter limit on credential endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRouter = Router();

// Customer
authRouter.post('/register', authLimiter, c.register);
authRouter.post('/login', authLimiter, c.login);
authRouter.post('/refresh', c.refresh);
authRouter.post('/logout', c.logout);
authRouter.get('/me', authenticate, requireCustomer, c.me);
authRouter.post('/google', authLimiter, c.googleLogin);
authRouter.post('/forgot-password', authLimiter, c.forgotPassword);
authRouter.post('/reset-password', authLimiter, c.resetPassword);

// Admin / staff
authRouter.post('/admin/login', authLimiter, c.adminLogin);
authRouter.post('/admin/refresh', c.adminRefresh);
authRouter.post('/admin/logout', c.adminLogout);
authRouter.get('/admin/me', authenticate, requireAdmin, c.adminMe);
