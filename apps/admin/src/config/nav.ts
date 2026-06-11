import type { PermissionKey } from '@sm/shared';

export interface NavItem {
  label: string;
  to: string;
  /** Permission required to see this item; undefined = always visible when authed. */
  permission?: PermissionKey;
}

// Order = sidebar order. Each item is gated by the canonical permission map so a
// role only ever sees the modules it can access.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', permission: 'dashboard.read' },
  { label: 'Products', to: '/products', permission: 'product.read' },
  { label: 'Categories', to: '/categories', permission: 'category.read' },
  { label: 'Subcategories', to: '/subcategories', permission: 'subcategory.read' },
  { label: 'Brands', to: '/brands', permission: 'brand.read' },
  { label: 'Bulk Import', to: '/import', permission: 'product.write' },
  { label: 'Orders', to: '/orders', permission: 'order.read' },
  { label: 'Customers', to: '/customers', permission: 'customer.read' },
  { label: 'Inquiries', to: '/inquiries', permission: 'inquiry.read' },
  { label: 'Leads', to: '/leads', permission: 'lead.read' },
  { label: 'Quote Requests', to: '/quote-requests', permission: 'quote.read' },
  { label: 'Quotations', to: '/quotations', permission: 'quotation.read' },
  { label: 'Banners', to: '/banners', permission: 'banner.read' },
  { label: 'Content', to: '/content', permission: 'content.read' },
  { label: 'FAQ', to: '/faq', permission: 'faq.read' },
  { label: 'Reports', to: '/reports', permission: 'report.read' },
  { label: 'Users & Roles', to: '/users', permission: 'user.manage' },
  { label: 'Audit Logs', to: '/audit', permission: 'user.manage' },
  { label: 'Settings', to: '/settings', permission: 'settings.read' },
];
