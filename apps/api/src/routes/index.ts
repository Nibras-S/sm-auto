import { Router } from 'express';
import mongoose from 'mongoose';
import { authRouter } from '../modules/auth/auth.routes';
import { catalogAdminRouter, catalogPublicRouter } from '../modules/catalog/catalog.routes';
import { crmAdminRouter, crmPublicRouter } from '../modules/crm/crm.routes';
import { uploadsRouter } from '../modules/uploads/uploads.routes';
import { accountRouter } from '../modules/account/account.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { quotationRouter } from '../modules/quotations/quotation.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';
import { cmsAdminRouter, cmsPublicRouter } from '../modules/cms/cms.routes';
import { usersRouter } from '../modules/users/users.routes';
import { auditLog } from '../middleware/audit';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

router.use('/auth', authRouter);

// Public storefront catalog + CMS
router.use('/catalog', catalogPublicRouter);
router.use('/', cmsPublicRouter);

// Public sales pipeline (inquiries, leads, quote requests, orders) + customer account
router.use('/', crmPublicRouter);
router.use('/me', accountRouter);

// Admin / CRM (audit middleware first so it logs every admin write)
router.use('/admin', auditLog);
router.use('/admin/uploads', uploadsRouter);
router.use('/admin/dashboard', dashboardRouter);
router.use('/admin/quotations', quotationRouter);
router.use('/admin/notifications', notificationRouter);
router.use('/admin', catalogAdminRouter);
router.use('/admin', crmAdminRouter);
router.use('/admin', cmsAdminRouter);
router.use('/admin', usersRouter);
