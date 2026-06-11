import { Router } from 'express';
import {
  ADMIN_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  resolvePermissions,
  type AdminRole,
} from '@sm/shared';
import { authenticate, requireAdmin, requirePermission } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuditLog } from '../../models/AuditLog';
import * as svc from './users.service';
import { userCreateSchema, userUpdateSchema } from './users.validation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toUserDTO = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  permissionOverrides: u.permissionOverrides ?? [],
  permissions: [...resolvePermissions(u.role as AdminRole, u.permissionOverrides ?? [])],
  isActive: u.isActive,
  phone: u.phone ?? undefined,
  lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : undefined,
  createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
});

export const usersRouter = Router();
usersRouter.use(authenticate, requireAdmin);

usersRouter.get(
  '/permissions',
  requirePermission('user.manage'),
  asyncHandler(async (_req, res) => {
    res.json({ permissions: PERMISSIONS, roles: ADMIN_ROLES, rolePermissions: ROLE_PERMISSIONS });
  }),
);

usersRouter.get(
  '/audit-logs',
  requirePermission('user.manage'),
  asyncHandler(async (_req, res) => {
    const logs = await AuditLog.find().sort('-createdAt').limit(100).populate('actor', 'name email');
    res.json({
      logs: logs.map((l) => ({
        id: l.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actorName: (l.actor as any)?.name ?? '—',
        action: l.action,
        method: l.method,
        path: l.path,
        status: l.status,
        createdAt: (l as unknown as { createdAt?: Date }).createdAt?.toISOString(),
      })),
    });
  }),
);

usersRouter.get(
  '/users',
  requirePermission('user.manage'),
  asyncHandler(async (_req, res) => {
    res.json({ users: (await svc.listUsers()).map(toUserDTO) });
  }),
);
usersRouter.post(
  '/users',
  requirePermission('user.manage'),
  asyncHandler(async (req, res) => {
    const input = userCreateSchema.parse(req.body);
    res.status(201).json({ user: toUserDTO(await svc.createUser(input)) });
  }),
);
usersRouter.get(
  '/users/:id',
  requirePermission('user.manage'),
  asyncHandler(async (req, res) => {
    res.json({ user: toUserDTO(await svc.getUser(req.params.id)) });
  }),
);
usersRouter.patch(
  '/users/:id',
  requirePermission('user.manage'),
  asyncHandler(async (req, res) => {
    const input = userUpdateSchema.parse(req.body);
    res.json({ user: toUserDTO(await svc.updateUser(req.params.id, input)) });
  }),
);
usersRouter.delete(
  '/users/:id',
  requirePermission('user.manage'),
  asyncHandler(async (req, res) => {
    await svc.deleteUser(req.params.id, req.auth!.sub);
    res.status(204).send();
  }),
);
