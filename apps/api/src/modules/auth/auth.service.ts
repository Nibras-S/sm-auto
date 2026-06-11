import bcrypt from 'bcryptjs';
import {
  AdminRole,
  AuthProvider,
  resolvePermissions,
  type AuthAdminUser,
  type AuthCustomer,
  type JwtPayload,
  type PermissionKey,
} from '@sm/shared';
import { AdminUser, type AdminUserDoc } from '../../models/AdminUser';
import { Customer, type CustomerDoc } from '../../models/Customer';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import type { LoginInput, RegisterInput } from './auth.validation';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ── mappers ──────────────────────────────────────────────────────────────────
function adminToAuthUser(u: AdminUserDoc): AuthAdminUser {
  const role = u.role as AdminRole;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    permissions: [...resolvePermissions(role, u.permissionOverrides ?? [])] as PermissionKey[],
  };
}

function customerToAuthUser(c: CustomerDoc): AuthCustomer {
  return { id: c.id, name: c.name, email: c.email, emailVerified: c.emailVerified };
}

function issueTokens(payload: JwtPayload) {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: payload.sub, kind: payload.kind, ver: payload.ver }),
  };
}

function finalizeAdmin(admin: AdminUserDoc) {
  const payload: JwtPayload = {
    sub: admin.id,
    kind: 'admin',
    role: admin.role as AdminRole,
    ver: admin.tokenVersion ?? 0,
    ovr: admin.permissionOverrides ?? [],
  };
  return { user: adminToAuthUser(admin), ...issueTokens(payload) };
}

function finalizeCustomer(customer: CustomerDoc) {
  const payload: JwtPayload = { sub: customer.id, kind: 'customer', ver: customer.tokenVersion ?? 0 };
  return { user: customerToAuthUser(customer), ...issueTokens(payload) };
}

// ── customer ─────────────────────────────────────────────────────────────────
export async function registerCustomer(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const existing = await Customer.findOne({ email }).lean();
  if (existing) throw AppError.conflict('An account with this email already exists');
  const passwordHash = await hashPassword(input.password);
  const customer = await Customer.create({
    name: input.name,
    email,
    passwordHash,
    authProvider: AuthProvider.Local,
  });
  return finalizeCustomer(customer);
}

export async function loginCustomer(input: LoginInput) {
  const customer = await Customer.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!customer || !customer.passwordHash) throw AppError.unauthorized('Invalid email or password');
  const ok = await bcrypt.compare(input.password, customer.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid email or password');
  if (!customer.isActive) throw AppError.forbidden('Account is disabled');
  customer.lastLoginAt = new Date();
  await customer.save();
  return finalizeCustomer(customer);
}

export async function refreshCustomer(decoded: JwtPayload) {
  const customer = await Customer.findById(decoded.sub);
  if (!customer || !customer.isActive || customer.tokenVersion !== decoded.ver) {
    throw AppError.unauthorized('Session expired');
  }
  return finalizeCustomer(customer);
}

export async function getCustomer(id: string): Promise<AuthCustomer> {
  const customer = await Customer.findById(id);
  if (!customer) throw AppError.unauthorized();
  return customerToAuthUser(customer);
}

// ── admin ────────────────────────────────────────────────────────────────────
export async function loginAdmin(input: LoginInput) {
  const admin = await AdminUser.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!admin || !admin.passwordHash) throw AppError.unauthorized('Invalid email or password');
  const ok = await bcrypt.compare(input.password, admin.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid email or password');
  if (!admin.isActive) throw AppError.forbidden('Account is disabled');
  admin.lastLoginAt = new Date();
  await admin.save();
  return finalizeAdmin(admin);
}

export async function refreshAdmin(decoded: JwtPayload) {
  const admin = await AdminUser.findById(decoded.sub);
  if (!admin || !admin.isActive || admin.tokenVersion !== decoded.ver) {
    throw AppError.unauthorized('Session expired');
  }
  return finalizeAdmin(admin);
}

export async function getAdmin(id: string): Promise<AuthAdminUser> {
  const admin = await AdminUser.findById(id);
  if (!admin) throw AppError.unauthorized();
  return adminToAuthUser(admin);
}
