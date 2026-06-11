import type { Request } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as svc from './crm.service';
import { toInquiryDTO, toLeadDTO, toOrderDTO, toQuoteRequestDTO } from './crm.serializers';
import { notify } from '../notifications/notification.service';
import {
  contactInquirySchema,
  leadSchema,
  orderSchema,
  quoteRequestSchema,
  whatsappInquirySchema,
} from './crm.validation';

const str = (v: unknown) => (typeof v === 'string' && v.length ? v : undefined);
const customerId = (req: Request) => (req.auth?.kind === 'customer' ? req.auth.sub : undefined);

export const createWhatsappInquiry = asyncHandler(async (req, res) => {
  const input = whatsappInquirySchema.parse(req.body);
  const d = await svc.createWhatsappInquiry(input, customerId(req));
  void notify('new_inquiry', `New WhatsApp inquiry ${d.inquiryNumber}`, d.contact?.name, '/inquiries');
  res.status(201).json({ inquiry: toInquiryDTO(d) });
});

export const createContactInquiry = asyncHandler(async (req, res) => {
  const input = contactInquirySchema.parse(req.body);
  const d = await svc.createContactInquiry(input, customerId(req));
  void notify('new_inquiry', `New contact inquiry ${d.inquiryNumber}`, d.contact?.name, '/inquiries');
  res.status(201).json({ inquiry: toInquiryDTO(d) });
});

export const createLead = asyncHandler(async (req, res) => {
  const input = leadSchema.parse(req.body);
  const d = await svc.createLead(input, customerId(req));
  void notify('new_lead', `New chatbot lead ${d.leadNumber}`, d.name, '/leads');
  res.status(201).json({ lead: toLeadDTO(d) });
});

export const createQuoteRequest = asyncHandler(async (req, res) => {
  const input = quoteRequestSchema.parse(req.body);
  const d = await svc.createQuoteRequest(input, customerId(req));
  void notify('new_quote_request', `New quote request ${d.requestNumber}`, d.contact?.name, '/quote-requests');
  res.status(201).json({ quoteRequest: toQuoteRequestDTO(d) });
});

export const createOrder = asyncHandler(async (req, res) => {
  const input = orderSchema.parse(req.body);
  const d = await svc.createOrder(input, customerId(req));
  void notify('new_order', `New order ${d.orderNumber}`, d.contact?.name, '/orders');
  res.status(201).json({ order: toOrderDTO(d) });
});

export const lookupOrder = asyncHandler(async (req, res) => {
  const d = await svc.getOrderByNumber(req.params.number, {
    phone: str(req.query.phone),
    email: str(req.query.email),
  });
  res.json({ order: toOrderDTO(d) });
});

export const myOrders = asyncHandler(async (req, res) => {
  const list = await svc.listMyOrders(req.auth!.sub);
  res.json({ orders: list.map(toOrderDTO) });
});
export const myInquiries = asyncHandler(async (req, res) => {
  const list = await svc.listMyInquiries(req.auth!.sub);
  res.json({ inquiries: list.map(toInquiryDTO) });
});
export const myQuoteRequests = asyncHandler(async (req, res) => {
  const list = await svc.listMyQuoteRequests(req.auth!.sub);
  res.json({ quoteRequests: list.map(toQuoteRequestDTO) });
});
