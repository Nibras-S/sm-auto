// ─────────────────────────────────────────────────────────────────────────────
// Canonical RBAC permission model (Appendix A, fix #1 — resolves the three
// conflicting permission maps that the parallel design pass produced).
//
// This is the ONE source of truth. The API enforces it (requirePermission) and the
// admin app reads it (role-gated nav + route guards). Do not redefine elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

import { AdminRole } from './enums';

export const PERMISSIONS = [
  'dashboard.read',
  'product.read',
  'product.write',
  'product.delete',
  'category.read',
  'category.write',
  'subcategory.read',
  'subcategory.write',
  'brand.read',
  'brand.write',
  'inventory.read',
  'inventory.write',
  'order.read',
  'order.write',
  'customer.read',
  'customer.write',
  'inquiry.read',
  'inquiry.write',
  'lead.read',
  'lead.write',
  'quote.read', // customer-submitted quote requests
  'quote.write',
  'quotation.read', // sales-issued quotations
  'quotation.write',
  'banner.read',
  'banner.write',
  'content.read',
  'content.write',
  'faq.read',
  'faq.write',
  'report.read',
  'notification.read',
  'user.manage',
  'settings.read',
  'settings.write',
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

const ALL_PERMISSIONS = [...PERMISSIONS] as PermissionKey[];
const READ_PERMISSIONS = PERMISSIONS.filter((p) => p.endsWith('.read')) as PermissionKey[];

/**
 * Base permissions per role. Super Admin always resolves to everything (handled in
 * `hasPermission`). Every staff role gets `dashboard.read` + `notification.read` so
 * the CRM shell + dashboard are reachable (Appendix A: dashboard is gated on
 * `dashboard.read`, NOT `report.read`).
 */
export const ROLE_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  [AdminRole.SuperAdmin]: ALL_PERMISSIONS,

  [AdminRole.SalesTeam]: [
    'dashboard.read',
    'notification.read',
    'order.read',
    'order.write',
    'customer.read',
    'customer.write',
    'inquiry.read',
    'inquiry.write',
    'lead.read',
    'lead.write',
    'quote.read',
    'quote.write',
    'quotation.read',
    'quotation.write',
    'product.read',
    'category.read',
    'brand.read',
    'report.read',
  ],

  [AdminRole.InventoryManager]: [
    'dashboard.read',
    'notification.read',
    'product.read',
    'product.write',
    'product.delete',
    'category.read',
    'category.write',
    'subcategory.read',
    'subcategory.write',
    'brand.read',
    'brand.write',
    'inventory.read',
    'inventory.write',
    'report.read',
  ],

  [AdminRole.MarketingManager]: [
    'dashboard.read',
    'notification.read',
    'banner.read',
    'banner.write',
    'content.read',
    'content.write',
    'faq.read',
    'faq.write',
    // read access so the banner/content editors can reference real products & categories
    'product.read',
    'category.read',
    'brand.read',
  ],

  [AdminRole.Viewer]: [...new Set<PermissionKey>(['dashboard.read', 'notification.read', ...READ_PERMISSIONS])],
};

/** Override entries look like `+settings.write` (grant) or `-product.delete` (revoke). */
export type PermissionOverride = `+${PermissionKey}` | `-${PermissionKey}`;

export function resolvePermissions(
  role: AdminRole,
  overrides: string[] = [],
): Set<PermissionKey> {
  if (role === AdminRole.SuperAdmin) return new Set(ALL_PERMISSIONS);
  const set = new Set<PermissionKey>(ROLE_PERMISSIONS[role] ?? []);
  for (const ov of overrides) {
    const key = ov.slice(1) as PermissionKey;
    if (ov.startsWith('+')) set.add(key);
    else if (ov.startsWith('-')) set.delete(key);
  }
  return set;
}

export function hasPermission(
  role: AdminRole,
  permission: PermissionKey,
  overrides: string[] = [],
): boolean {
  if (role === AdminRole.SuperAdmin) return true;
  return resolvePermissions(role, overrides).has(permission);
}

export function hasAnyPermission(
  role: AdminRole,
  permissions: PermissionKey[],
  overrides: string[] = [],
): boolean {
  if (role === AdminRole.SuperAdmin) return true;
  const set = resolvePermissions(role, overrides);
  return permissions.some((p) => set.has(p));
}
