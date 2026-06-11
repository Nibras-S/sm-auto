import type {
  AdminUserDTO,
  AuditLogDTO,
  BannerDTO,
  ContentPageDTO,
  DashboardStats,
  FaqDTO,
  NotificationDTO,
  OrderDTO,
  Paginated,
  QuotationDTO,
} from '@sm/shared';
import { api } from './api';

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/admin/dashboard').then((r) => r.data as DashboardStats);

// ── Notifications ────────────────────────────────────────────────────────────
export const listNotifications = () =>
  api.get('/admin/notifications').then((r) => r.data as { notifications: NotificationDTO[]; unread: number });
export const markNotifRead = (id: string) => api.patch(`/admin/notifications/${id}/read`);
export const markAllNotifRead = () => api.patch('/admin/notifications/read-all');

// ── Quotations ───────────────────────────────────────────────────────────────
export const listQuotations = (p: Record<string, unknown>) =>
  api.get('/admin/quotations', { params: p }).then((r) => r.data as Paginated<QuotationDTO>);
export const getQuotation = (id: string) =>
  api.get(`/admin/quotations/${id}`).then((r) => r.data.quotation as QuotationDTO);
export const createQuotation = (b: Record<string, unknown>) =>
  api.post('/admin/quotations', b).then((r) => r.data.quotation as QuotationDTO);
export const createQuotationFromQuote = (quoteRequestId: string) =>
  api.post('/admin/quotations/from-quote-request', { quoteRequestId }).then((r) => r.data.quotation as QuotationDTO);
export const updateQuotation = (id: string, b: Record<string, unknown>) =>
  api.patch(`/admin/quotations/${id}`, b).then((r) => r.data.quotation as QuotationDTO);
export const setQuotationStatus = (id: string, status: string) =>
  api.patch(`/admin/quotations/${id}/status`, { status }).then((r) => r.data.quotation as QuotationDTO);
export const convertQuotation = (id: string) =>
  api.post(`/admin/quotations/${id}/convert`).then((r) => r.data.order as OrderDTO);
export async function openQuotationPdf(id: string) {
  const res = await api.get(`/admin/quotations/${id}/pdf`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  window.open(url, '_blank');
}

// ── Banners ──────────────────────────────────────────────────────────────────
export const listBanners = () => api.get('/admin/banners').then((r) => r.data.banners as BannerDTO[]);
export const createBanner = (b: Record<string, unknown>) =>
  api.post('/admin/banners', b).then((r) => r.data.banner as BannerDTO);
export const updateBanner = (id: string, b: Record<string, unknown>) =>
  api.patch(`/admin/banners/${id}`, b).then((r) => r.data.banner as BannerDTO);
export const deleteBanner = (id: string) => api.delete(`/admin/banners/${id}`);

// ── FAQs ─────────────────────────────────────────────────────────────────────
export const listFaqs = () => api.get('/admin/faqs').then((r) => r.data.faqs as FaqDTO[]);
export const createFaq = (f: Record<string, unknown>) =>
  api.post('/admin/faqs', f).then((r) => r.data.faq as FaqDTO);
export const updateFaq = (id: string, f: Record<string, unknown>) =>
  api.patch(`/admin/faqs/${id}`, f).then((r) => r.data.faq as FaqDTO);
export const deleteFaq = (id: string) => api.delete(`/admin/faqs/${id}`);

// ── Content pages ────────────────────────────────────────────────────────────
export const listContent = () => api.get('/admin/content').then((r) => r.data.pages as ContentPageDTO[]);
export const getContent = (slug: string) =>
  api.get(`/admin/content/${slug}`).then((r) => r.data.page as ContentPageDTO);
export const saveContent = (slug: string, b: { title: string; body: string }) =>
  api.put(`/admin/content/${slug}`, b).then((r) => r.data.page as ContentPageDTO);

// ── Users / RBAC ─────────────────────────────────────────────────────────────
export const listUsers = () => api.get('/admin/users').then((r) => r.data.users as AdminUserDTO[]);
export const createUser = (b: Record<string, unknown>) =>
  api.post('/admin/users', b).then((r) => r.data.user as AdminUserDTO);
export const updateUser = (id: string, b: Record<string, unknown>) =>
  api.patch(`/admin/users/${id}`, b).then((r) => r.data.user as AdminUserDTO);
export const deleteUser = (id: string) => api.delete(`/admin/users/${id}`);
export const getPermissionsMeta = () =>
  api.get('/admin/permissions').then(
    (r) => r.data as { permissions: string[]; roles: string[]; rolePermissions: Record<string, string[]> },
  );
export const listAuditLogs = () => api.get('/admin/audit-logs').then((r) => r.data.logs as AuditLogDTO[]);

// ── Bulk import ──────────────────────────────────────────────────────────────
export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  results: { row: number; status: string; sku?: string; message?: string }[];
}
export const importProducts = (rows: Record<string, unknown>[]) =>
  api.post('/admin/products/import', { rows }).then((r) => r.data as ImportResult);
