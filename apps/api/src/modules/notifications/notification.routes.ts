import { Router } from 'express';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as svc from './notification.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDTO = (n: any) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message ?? undefined,
  link: n.link ?? undefined,
  read: Boolean(n.read),
  createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : undefined,
});

export const notificationRouter = Router();
notificationRouter.use(authenticate, requireAdmin);

notificationRouter.get(
  '/',
  requirePermission('notification.read'),
  asyncHandler(async (req, res) => {
    const items = await svc.listNotifications(req.query.unread === 'true');
    const unread = await svc.unreadCount();
    res.json({ notifications: items.map(toDTO), unread });
  }),
);
notificationRouter.patch(
  '/read-all',
  requirePermission('notification.read'),
  asyncHandler(async (_req, res) => {
    await svc.markAllRead();
    res.json({ ok: true });
  }),
);
notificationRouter.patch(
  '/:id/read',
  requirePermission('notification.read'),
  asyncHandler(async (req, res) => {
    await svc.markRead(req.params.id);
    res.json({ ok: true });
  }),
);
