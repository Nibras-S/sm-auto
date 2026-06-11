import type {
  CustomerSummaryDTO,
  InquiryDTO,
  LeadDTO,
  OrderDTO,
  Paginated,
  QuoteRequestDTO,
} from '@sm/shared';
import { api } from './api';

export interface CrmListParams {
  q?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}

// ── Orders ───────────────────────────────────────────────────────────────────
export const listOrders = (p: CrmListParams) =>
  api.get('/admin/orders', { params: p }).then((r) => r.data as Paginated<OrderDTO>);
export const getOrder = (id: string) =>
  api.get(`/admin/orders/${id}`).then((r) => r.data.order as OrderDTO);
export const setOrderStatus = (id: string, status: string, note?: string) =>
  api.patch(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data.order as OrderDTO);
export const updateOrder = (id: string, body: Record<string, unknown>) =>
  api.patch(`/admin/orders/${id}`, body).then((r) => r.data.order as OrderDTO);

// ── Inquiries ────────────────────────────────────────────────────────────────
export const listInquiries = (p: CrmListParams) =>
  api.get('/admin/inquiries', { params: p }).then((r) => r.data as Paginated<InquiryDTO>);
export const getInquiry = (id: string) =>
  api.get(`/admin/inquiries/${id}`).then((r) => r.data.inquiry as InquiryDTO);
export const setInquiryStatus = (id: string, status: string) =>
  api.patch(`/admin/inquiries/${id}/status`, { status }).then((r) => r.data.inquiry as InquiryDTO);
export const setInquiryNotes = (id: string, internalNotes: string) =>
  api.patch(`/admin/inquiries/${id}/notes`, { internalNotes }).then((r) => r.data.inquiry as InquiryDTO);
export const convertInquiry = (id: string) =>
  api.post(`/admin/inquiries/${id}/convert`).then((r) => r.data.order as OrderDTO);

// ── Leads ────────────────────────────────────────────────────────────────────
export const listLeads = (p: CrmListParams) =>
  api.get('/admin/leads', { params: p }).then((r) => r.data as Paginated<LeadDTO>);
export const getLead = (id: string) => api.get(`/admin/leads/${id}`).then((r) => r.data.lead as LeadDTO);
export const setLeadStatus = (id: string, status: string) =>
  api.patch(`/admin/leads/${id}/status`, { status }).then((r) => r.data.lead as LeadDTO);
export const setLeadNotes = (id: string, internalNotes: string) =>
  api.patch(`/admin/leads/${id}/notes`, { internalNotes }).then((r) => r.data.lead as LeadDTO);
export const convertLead = (id: string) =>
  api.post(`/admin/leads/${id}/convert`).then((r) => r.data.order as OrderDTO);

// ── Quote requests ───────────────────────────────────────────────────────────
export const listQuoteRequests = (p: CrmListParams) =>
  api.get('/admin/quote-requests', { params: p }).then((r) => r.data as Paginated<QuoteRequestDTO>);
export const getQuoteRequest = (id: string) =>
  api.get(`/admin/quote-requests/${id}`).then((r) => r.data.quoteRequest as QuoteRequestDTO);
export const setQuoteStatus = (id: string, status: string) =>
  api
    .patch(`/admin/quote-requests/${id}/status`, { status })
    .then((r) => r.data.quoteRequest as QuoteRequestDTO);
export const setQuoteNotes = (id: string, internalNotes: string) =>
  api
    .patch(`/admin/quote-requests/${id}/notes`, { internalNotes })
    .then((r) => r.data.quoteRequest as QuoteRequestDTO);
export const convertQuote = (id: string) =>
  api.post(`/admin/quote-requests/${id}/convert`).then((r) => r.data.order as OrderDTO);

// ── Customers ────────────────────────────────────────────────────────────────
export const listCustomers = (p: CrmListParams) =>
  api.get('/admin/customers', { params: p }).then((r) => r.data as Paginated<CustomerSummaryDTO>);
export interface CustomerDetail {
  customer: CustomerSummaryDTO;
  orders: OrderDTO[];
  inquiries: InquiryDTO[];
  quoteRequests: QuoteRequestDTO[];
}
export const getCustomer = (id: string) =>
  api.get(`/admin/customers/${id}`).then((r) => r.data as CustomerDetail);
