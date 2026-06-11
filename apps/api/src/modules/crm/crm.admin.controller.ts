import type { Request } from 'express';
import type { CustomerSummaryDTO } from '@sm/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { numParam, pageMeta } from '../../utils/pagination';
import * as svc from './crm.service';
import { toInquiryDTO, toLeadDTO, toOrderDTO, toQuoteRequestDTO } from './crm.serializers';
import {
  inquiryStatusSchema,
  leadStatusSchema,
  notesSchema,
  orderStatusSchema,
  orderUpdateSchema,
} from './crm.validation';

const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);
const listQuery = (req: Request) => ({
  status: str(req.query.status),
  source: str(req.query.source),
  q: str(req.query.q),
  page: numParam(req.query.page),
  limit: numParam(req.query.limit),
  sort: str(req.query.sort),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customerSummary(c: any): CustomerSummaryDTO {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    emailVerified: Boolean(c.emailVerified),
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
  };
}

// ── inquiries ────────────────────────────────────────────────────────────────
export const listInquiries = asyncHandler(async (req, res) => {
  const r = await svc.listInquiries(listQuery(req));
  res.json({ data: r.data.map(toInquiryDTO), meta: pageMeta(r.total, r.page, r.limit) });
});
export const getInquiry = asyncHandler(async (req, res) => {
  res.json({ inquiry: toInquiryDTO(await svc.getInquiry(req.params.id)) });
});
export const setInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = inquiryStatusSchema.parse(req.body);
  res.json({ inquiry: toInquiryDTO(await svc.setInquiryStatus(req.params.id, status)) });
});
export const setInquiryNotes = asyncHandler(async (req, res) => {
  const { internalNotes } = notesSchema.parse(req.body);
  res.json({ inquiry: toInquiryDTO(await svc.setInquiryNotes(req.params.id, internalNotes)) });
});
export const convertInquiry = asyncHandler(async (req, res) => {
  res.status(201).json({ order: toOrderDTO(await svc.convertInquiryToOrder(req.params.id)) });
});

// ── leads ────────────────────────────────────────────────────────────────────
export const listLeads = asyncHandler(async (req, res) => {
  const r = await svc.listLeads(listQuery(req));
  res.json({ data: r.data.map(toLeadDTO), meta: pageMeta(r.total, r.page, r.limit) });
});
export const getLead = asyncHandler(async (req, res) => {
  res.json({ lead: toLeadDTO(await svc.getLead(req.params.id)) });
});
export const setLeadStatus = asyncHandler(async (req, res) => {
  const { status } = leadStatusSchema.parse(req.body);
  res.json({ lead: toLeadDTO(await svc.setLeadStatus(req.params.id, status)) });
});
export const setLeadNotes = asyncHandler(async (req, res) => {
  const { internalNotes } = notesSchema.parse(req.body);
  res.json({ lead: toLeadDTO(await svc.setLeadNotes(req.params.id, internalNotes)) });
});
export const convertLead = asyncHandler(async (req, res) => {
  res.status(201).json({ order: toOrderDTO(await svc.convertLeadToOrder(req.params.id)) });
});

// ── quote requests ───────────────────────────────────────────────────────────
export const listQuoteRequests = asyncHandler(async (req, res) => {
  const r = await svc.listQuoteRequests(listQuery(req));
  res.json({ data: r.data.map(toQuoteRequestDTO), meta: pageMeta(r.total, r.page, r.limit) });
});
export const getQuoteRequest = asyncHandler(async (req, res) => {
  res.json({ quoteRequest: toQuoteRequestDTO(await svc.getQuoteRequest(req.params.id)) });
});
export const setQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = inquiryStatusSchema.parse(req.body);
  res.json({ quoteRequest: toQuoteRequestDTO(await svc.setQuoteStatus(req.params.id, status)) });
});
export const setQuoteNotes = asyncHandler(async (req, res) => {
  const { internalNotes } = notesSchema.parse(req.body);
  res.json({ quoteRequest: toQuoteRequestDTO(await svc.setQuoteNotes(req.params.id, internalNotes)) });
});
export const convertQuote = asyncHandler(async (req, res) => {
  res.status(201).json({ order: toOrderDTO(await svc.convertQuoteToOrder(req.params.id)) });
});

// ── orders ───────────────────────────────────────────────────────────────────
export const listOrders = asyncHandler(async (req, res) => {
  const r = await svc.listOrders(listQuery(req));
  res.json({ data: r.data.map(toOrderDTO), meta: pageMeta(r.total, r.page, r.limit) });
});
export const getOrder = asyncHandler(async (req, res) => {
  res.json({ order: toOrderDTO(await svc.getOrder(req.params.id)) });
});
export const setOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = orderStatusSchema.parse(req.body);
  res.json({ order: toOrderDTO(await svc.setOrderStatus(req.params.id, status, note)) });
});
export const updateOrder = asyncHandler(async (req, res) => {
  const patch = orderUpdateSchema.parse(req.body);
  res.json({ order: toOrderDTO(await svc.updateOrder(req.params.id, patch)) });
});

// ── customers ────────────────────────────────────────────────────────────────
export const listCustomers = asyncHandler(async (req, res) => {
  const r = await svc.listCustomers(listQuery(req));
  res.json({ data: r.data.map(customerSummary), meta: pageMeta(r.total, r.page, r.limit) });
});
export const getCustomer = asyncHandler(async (req, res) => {
  const { customer, orders, inquiries, quoteRequests } = await svc.getCustomerDetail(req.params.id);
  res.json({
    customer: customerSummary(customer),
    orders: orders.map(toOrderDTO),
    inquiries: inquiries.map(toInquiryDTO),
    quoteRequests: quoteRequests.map(toQuoteRequestDTO),
  });
});
