import {
  ORDER_INITIAL_STATUS,
  QuotationStatus,
  orderNumber as fmtOrder,
  quotationNumber as fmtQuotation,
} from '@sm/shared';
import { Quotation, type QuotationDoc } from '../../models/Quotation';
import { QuoteRequest } from '../../models/QuoteRequest';
import { Order } from '../../models/Order';
import { AppError } from '../../utils/AppError';
import { nextSeq } from '../../utils/sequence';
import type { QuotationCreateInput, QuotationUpdateInput } from './quotation.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const year = () => new Date().getFullYear();

async function genNumber() {
  const y = year();
  return fmtQuotation(y, await nextSeq('quotation', y));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItems(items: any[] = []) {
  return items.map((i) => ({
    product: i.productId || i.product || undefined,
    name: i.name,
    partNumber: i.partNumber,
    quantity: i.quantity ?? 1,
    unitPrice: i.unitPrice ?? 0,
  }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function subtotal(items: any[]) {
  return items.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0);
}

interface ListQuery {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}
export async function listQuotations(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.status) f.status = q.status;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ quotationNumber: rx }, { 'contact.name': rx }];
  }
  const page = Math.max(1, q.page ?? 1);
  const limit = Math.min(100, Math.max(1, q.limit ?? 20));
  const [data, total] = await Promise.all([
    Quotation.find(f).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Quotation.countDocuments(f),
  ]);
  return { data, total, page, limit };
}

export async function getQuotation(id: string): Promise<QuotationDoc> {
  const doc = await Quotation.findById(id);
  if (!doc) throw AppError.notFound('Quotation not found');
  return doc;
}

export async function createQuotation(input: QuotationCreateInput) {
  const items = mapItems(input.items);
  return Quotation.create({
    quotationNumber: await genNumber(),
    contact: { name: input.contact.name, phone: input.contact.phone || undefined, email: input.contact.email || undefined },
    items,
    subtotal: subtotal(items),
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    notes: input.notes,
    status: QuotationStatus.Draft,
  });
}

export async function createFromQuoteRequest(quoteRequestId: string) {
  const qr = await QuoteRequest.findById(quoteRequestId);
  if (!qr) throw AppError.notFound('Quote request not found');
  const items = (qr.items ?? []).map((i) => ({
    product: i.product,
    name: i.name,
    partNumber: i.partNumber,
    quantity: i.quantity,
    unitPrice: 0,
  }));
  return Quotation.create({
    quotationNumber: await genNumber(),
    contact: qr.contact,
    items,
    subtotal: 0,
    status: QuotationStatus.Draft,
    linkedQuoteRequest: qr._id,
    linkedCustomer: qr.linkedCustomer,
  });
}

export async function updateQuotation(id: string, input: QuotationUpdateInput) {
  const doc = await getQuotation(id);
  if (input.contact) doc.set('contact', input.contact);
  if (input.items) {
    const items = mapItems(input.items);
    doc.set('items', items);
    doc.subtotal = subtotal(items);
  }
  if (input.notes !== undefined) doc.notes = input.notes;
  if (input.validUntil !== undefined) {
    doc.validUntil = input.validUntil ? new Date(input.validUntil) : undefined;
  }
  await doc.save();
  return doc;
}

export async function setStatus(id: string, status: string) {
  const doc = await getQuotation(id);
  doc.status = status as QuotationStatus;
  await doc.save();
  return doc;
}

export async function convertToOrder(id: string) {
  const q = await getQuotation(id);
  const items = (q.items ?? []).map((i) => ({
    product: i.product,
    name: i.name,
    partNumber: i.partNumber,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
  const y = year();
  const order = await Order.create({
    orderNumber: fmtOrder(y, await nextSeq('order', y)),
    status: ORDER_INITIAL_STATUS,
    contact: q.contact,
    items,
    subtotal: subtotal(items),
    statusHistory: [
      { status: ORDER_INITIAL_STATUS, at: new Date(), note: `Converted from quotation ${q.quotationNumber}` },
    ],
    source: 'quotation',
    linkedCustomer: q.linkedCustomer,
  });
  q.status = QuotationStatus.Approved;
  q.convertedOrder = order._id;
  await q.save();
  return order;
}
