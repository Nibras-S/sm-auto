import { AdminRole } from '@sm/shared';
import { AdminUser } from '../../models/AdminUser';
import { AppError } from '../../utils/AppError';
import { hashPassword } from '../auth/auth.service';
import { z } from 'zod';
import { userCreateSchema, userUpdateSchema } from './users.validation';

type CreateInput = z.infer<typeof userCreateSchema>;
type UpdateInput = z.infer<typeof userUpdateSchema>;

export function listUsers() {
  return AdminUser.find().sort('name');
}

export async function getUser(id: string) {
  const u = await AdminUser.findById(id);
  if (!u) throw AppError.notFound('User not found');
  return u;
}

export async function createUser(input: CreateInput) {
  const email = input.email.toLowerCase();
  if (await AdminUser.findOne({ email })) throw AppError.conflict('A user with this email already exists');
  const passwordHash = await hashPassword(input.password);
  return AdminUser.create({
    name: input.name,
    email,
    passwordHash,
    role: input.role,
    permissionOverrides: input.permissionOverrides ?? [],
    phone: input.phone,
    isActive: input.isActive ?? true,
  });
}

export async function updateUser(id: string, input: UpdateInput) {
  const u = await getUser(id);
  if (input.name !== undefined) u.name = input.name;
  if (input.role !== undefined) u.role = input.role as AdminRole;
  if (input.permissionOverrides !== undefined) u.set('permissionOverrides', input.permissionOverrides);
  if (input.phone !== undefined) u.phone = input.phone;
  if (input.isActive !== undefined) {
    if (u.role === AdminRole.SuperAdmin && !input.isActive) {
      throw AppError.badRequest('A Super Admin cannot be deactivated');
    }
    u.isActive = input.isActive;
  }
  if (input.password) {
    u.passwordHash = await hashPassword(input.password);
    u.tokenVersion = (u.tokenVersion ?? 0) + 1;
  }
  await u.save();
  return u;
}

export async function deleteUser(id: string, actorId: string) {
  const u = await getUser(id);
  if (u.role === AdminRole.SuperAdmin) throw AppError.badRequest('A Super Admin cannot be deleted');
  if (String(u._id) === actorId) throw AppError.badRequest('You cannot delete your own account');
  await u.deleteOne();
}
