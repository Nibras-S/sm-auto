// Admin-only transport shapes (quotations, notifications, users, audit, dashboard).

import type { AdminRole, NotificationType, QuotationStatus } from './enums';
import type { PermissionKey } from './permissions';
import type { ContactInfo } from './crm';

export interface QuotationItemDTO {
  productId?: string | null;
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number; // integer fils
}

export interface QuotationDTO {
  id: string;
  quotationNumber: string;
  status: QuotationStatus;
  contact: ContactInfo;
  items: QuotationItemDTO[];
  subtotal: number; // integer fils
  currency: string;
  validUntil?: string;
  notes?: string;
  linkedQuoteRequestId?: string | null;
  linkedCustomerId?: string | null;
  convertedOrderId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationDTO {
  id: string;
  type: NotificationType | string;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt?: string;
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissionOverrides: string[];
  permissions: PermissionKey[];
  isActive: boolean;
  phone?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuditLogDTO {
  id: string;
  actorId?: string;
  actorName?: string;
  action: string;
  method: string;
  path: string;
  status?: number;
  meta?: unknown;
  createdAt?: string;
}

export interface DashboardStats {
  totals: {
    products: number;
    categories: number;
    brands: number;
    customers: number;
    orders: number;
    inquiries: number;
    leads: number;
    quoteRequests: number;
    quotations: number;
  };
  orderStatus: Record<string, number>;
  revenue: number; // integer fils
  pendingOrders: number;
  recentOrders: {
    orderNumber: string;
    status: string;
    subtotal: number | null;
    contactName: string;
    createdAt?: string;
  }[];
  ordersByDay: { date: string; count: number }[];
  topProducts: { name: string; count: number }[];
}
