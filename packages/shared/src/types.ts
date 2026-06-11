// Shared transport types used by both the API and the admin app.

import type { AdminRole } from './enums';
import type { PermissionKey } from './permissions';

export type AuthKind = 'admin' | 'customer';

/** Decoded JWT payload (both access and refresh tokens). */
export interface JwtPayload {
  sub: string; // user id
  kind: AuthKind;
  role?: AdminRole; // admin tokens only
  ver: number; // tokenVersion — bumped to invalidate all tokens (Appendix A, fix #2)
  ovr?: string[]; // admin permissionOverrides snapshot (+perm / -perm)
}

/** The authenticated admin user returned to the admin SPA after login/refresh. */
export interface AuthAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: PermissionKey[];
}

/** The authenticated customer returned to the storefront. */
export interface AuthCustomer {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthResponse<TUser> {
  accessToken: string;
  user: TUser;
}

/** Uniform error body returned by the API (Appendix A — one error contract). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}
