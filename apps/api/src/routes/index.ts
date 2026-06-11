import { Router } from 'express';
import mongoose from 'mongoose';
import { authRouter } from '../modules/auth/auth.routes';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

router.use('/auth', authRouter);
