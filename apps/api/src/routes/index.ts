import { Router } from 'express';
import mongoose from 'mongoose';
import { authRouter } from '../modules/auth/auth.routes';
import { catalogAdminRouter, catalogPublicRouter } from '../modules/catalog/catalog.routes';
import { crmAdminRouter, crmPublicRouter } from '../modules/crm/crm.routes';
import { uploadsRouter } from '../modules/uploads/uploads.routes';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

router.use('/auth', authRouter);

// Public storefront catalog
router.use('/catalog', catalogPublicRouter);

// Public sales pipeline (inquiries, leads, quote requests, orders, /me)
router.use('/', crmPublicRouter);

// Admin / CRM
router.use('/admin/uploads', uploadsRouter);
router.use('/admin', catalogAdminRouter);
router.use('/admin', crmAdminRouter);
