import { z } from 'zod';
import { ADMIN_ROLES } from '@sm/shared';

const role = z.enum(ADMIN_ROLES as [string, ...string[]]);

export const userCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  role,
  permissionOverrides: z.array(z.string()).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: role.optional(),
  permissionOverrides: z.array(z.string()).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(200).optional(),
});
