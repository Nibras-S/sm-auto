import {
  InquirySource,
  InquiryStatus,
  LeadStatus,
  ORDER_INITIAL_STATUS,
  inquiryNumber as fmtInquiry,
  leadNumber as fmtLead,
  orderNumber as fmtOrder,
  quoteRequestNumber as fmtQuote,
  type OrderStatus,
} from '@sm/shared';
import { Inquiry } from '../../models/Inquiry';
import { Lead } from '../../models/Lead';
import { QuoteRequest } from '../../models/QuoteRequest';
import { Order } from '../../models/Order';
import { Customer } from '../../models/Customer';
import { Product } from '../../models/Product';
import { AppError } from '../../utils/AppError';
import { nextSeq } from '../../utils/sequence';
import { sendMail } from '../../utils/mailer';
import type {
  ContactInquiryInput,
  LeadInput,
  OrderInput,
  QuoteRequestInput,
  WhatsappInquiryInput,
} from './crm.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const year = () => new Date().getFullYear();

async function genInquiryNumber() {
  const y = year();
  return fmtInquiry(y, await nextSeq('inquiry', y));
}
async function genLeadNumber() {
  const y = year();
  return fmtLead(y, await nextSeq('lead', y));
}
async function genQuoteNumber() {
  const y = year();
  return fmtQuote(y, await nextSeq('quoteRequest', y));
}
async function genOrderNumber() {
  const y = year();
  return fmtOrder(y, await nextSeq('order', y));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanContact(c: any) {
  return { name: c.name, phone: c.phone || undefined, email: c.email || undefined };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItems(arr: any[] = []) {
  return arr.map((i) => ({
    product: i.productId || undefined,
    slug: i.slug,
    name: i.name,
    sku: i.sku,
    partNumber: i.partNumber,
    quantity: i.quantity ?? 1,
    note: i.note,
  }));
}

interface ListQuery {
  status?: string;
  source?: string;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function paginate(Model: any, filter: any, q: ListQuery) {
  const page = Math.max(1, q.page ?? 1);
  const limit = Math.min(100, Math.max(1, q.limit ?? 20));
  const [data, total] = await Promise.all([
    Model.find(filter).sort(q.sort || '-createdAt').skip((page - 1) * limit).limit(limit),
    Model.countDocuments(filter),
  ]);
  return { data, total, page, limit };
}

// ── public create ────────────────────────────────────────────────────────────
export async function createWhatsappInquiry(input: WhatsappInquiryInput, customerId?: string) {
  return Inquiry.create({
    inquiryNumber: await genInquiryNumber(),
    source: InquirySource.WhatsApp,
    contact: cleanContact(input.contact),
    vehicle: input.vehicle ?? {},
    emirate: input.emirate,
    items: mapItems(input.items),
    message: input.message,
    linkedCustomer: customerId,
  });
}

export async function createContactInquiry(input: ContactInquiryInput, customerId?: string) {
  return Inquiry.create({
    inquiryNumber: await genInquiryNumber(),
    source: InquirySource.ContactForm,
    contact: cleanContact(input.contact),
    vehicle: input.vehicle ?? {},
    message: input.message,
    linkedCustomer: customerId,
  });
}

export async function createLead(input: LeadInput, customerId?: string) {
  return Lead.create({
    leadNumber: await genLeadNumber(),
    source: 'Chatbot',
    name: input.name,
    phone: input.phone,
    vehicleBrand: input.vehicleBrand,
    vehicleModel: input.vehicleModel,
    vehicleYear: input.vehicleYear,
    requiredPart: input.requiredPart,
    notes: input.notes,
    linkedCustomer: customerId,
  });
}

export async function createQuoteRequest(input: QuoteRequestInput, customerId?: string) {
  return QuoteRequest.create({
    requestNumber: await genQuoteNumber(),
    contact: cleanContact(input.contact),
    vehicle: input.vehicle ?? {},
    items: mapItems(input.items),
    notes: input.notes,
    linkedCustomer: customerId,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveOrderItems(inputItems: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  for (const it of inputItems) {
    if (it.productId) {
      // eslint-disable-next-line no-await-in-loop
      const p = await Product.findById(it.productId);
      if (p) {
        out.push({
          product: p._id,
          slug: p.slug,
          name: p.name,
          sku: p.sku,
          partNumber: p.partNumber,
          quantity: it.quantity ?? 1,
          unitPrice: p.price ?? null,
          note: it.note,
        });
        continue;
      }
    }
    out.push({ name: it.name ?? 'Item', quantity: it.quantity ?? 1, unitPrice: null, note: it.note });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeSubtotal(items: any[]): number | null {
  if (!items.length) return null;
  if (items.some((i) => i.unitPrice == null)) return null;
  return items.reduce((s, i) => s + i.unitPrice * (i.quantity ?? 1), 0);
}

export async function createOrder(input: OrderInput, customerId?: string) {
  const items = await resolveOrderItems(input.items);
  const order = await Order.create({
    orderNumber: await genOrderNumber(),
    status: ORDER_INITIAL_STATUS,
    contact: cleanContact(input.contact),
    shippingAddress: input.shippingAddress,
    vehicle: input.vehicle ?? {},
    items,
    subtotal: computeSubtotal(items),
    customerNotes: input.notes,
    statusHistory: [{ status: ORDER_INITIAL_STATUS, at: new Date(), note: 'Order placed' }],
    source: 'web-checkout',
    linkedCustomer: customerId,
  });
  const email = order.contact?.email;
  if (email) {
    void sendMail({
      to: email,
      subject: `Order ${order.orderNumber} received — Spare Mec`,
      text: [
        `Dear ${order.contact?.name ?? 'Customer'},`,
        '',
        `Thank you for your order. We have received it and it is now pending verification.`,
        '',
        `Order number: ${order.orderNumber}`,
        `Status: ${ORDER_INITIAL_STATUS}`,
        '',
        `Our team will review your order and contact you within 24 hours to confirm pricing and availability.`,
        '',
        `If you have any questions, please reply to this email or reach us on WhatsApp.`,
        '',
        `Thank you for choosing Spare Mec.`,
      ].join('\n'),
    });
  }
  return order;
}

export async function getOrderByNumber(num: string, verify: { phone?: string; email?: string }) {
  const d = await Order.findOne({ orderNumber: num });
  if (!d) throw AppError.notFound('Order not found');
  const okPhone = verify.phone && d.contact?.phone === verify.phone;
  const okEmail =
    verify.email && d.contact?.email?.toLowerCase() === verify.email.toLowerCase();
  if (!okPhone && !okEmail) throw AppError.forbidden('Could not verify access to this order');
  return d;
}

// ── inquiries (admin) ────────────────────────────────────────────────────────
export function listInquiries(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.status) f.status = q.status;
  if (q.source) f.source = q.source;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ inquiryNumber: rx }, { 'contact.name': rx }, { 'contact.phone': rx }];
  }
  return paginate(Inquiry, f, q);
}
export async function getInquiry(id: string) {
  const d = await Inquiry.findById(id);
  if (!d) throw AppError.notFound('Inquiry not found');
  return d;
}
export async function setInquiryStatus(id: string, status: string) {
  const d = await getInquiry(id);
  d.status = status as InquiryStatus;
  await d.save();
  return d;
}
export async function setInquiryNotes(id: string, notes: string) {
  const d = await getInquiry(id);
  d.internalNotes = notes;
  await d.save();
  return d;
}

// ── leads (admin) ────────────────────────────────────────────────────────────
export function listLeads(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.status) f.status = q.status;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ leadNumber: rx }, { name: rx }, { phone: rx }];
  }
  return paginate(Lead, f, q);
}
export async function getLead(id: string) {
  const d = await Lead.findById(id);
  if (!d) throw AppError.notFound('Lead not found');
  return d;
}
export async function setLeadStatus(id: string, status: string) {
  const d = await getLead(id);
  d.status = status as LeadStatus;
  await d.save();
  return d;
}
export async function setLeadNotes(id: string, notes: string) {
  const d = await getLead(id);
  d.internalNotes = notes;
  await d.save();
  return d;
}

// ── quote requests (admin) ───────────────────────────────────────────────────
export function listQuoteRequests(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.status) f.status = q.status;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ requestNumber: rx }, { 'contact.name': rx }, { 'contact.phone': rx }];
  }
  return paginate(QuoteRequest, f, q);
}
export async function getQuoteRequest(id: string) {
  const d = await QuoteRequest.findById(id);
  if (!d) throw AppError.notFound('Quote request not found');
  return d;
}
export async function setQuoteStatus(id: string, status: string) {
  const d = await getQuoteRequest(id);
  d.status = status as InquiryStatus;
  await d.save();
  return d;
}
export async function setQuoteNotes(id: string, notes: string) {
  const d = await getQuoteRequest(id);
  d.internalNotes = notes;
  await d.save();
  return d;
}

// ── orders (admin) ───────────────────────────────────────────────────────────
export function listOrders(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.status) f.status = q.status;
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ orderNumber: rx }, { 'contact.name': rx }, { 'contact.phone': rx }];
  }
  return paginate(Order, f, q);
}
export async function getOrder(id: string) {
  const d = await Order.findById(id);
  if (!d) throw AppError.notFound('Order not found');
  return d;
}
export async function setOrderStatus(id: string, status: string, note?: string) {
  const d = await getOrder(id);
  d.status = status as OrderStatus;
  d.statusHistory.push({ status: status as OrderStatus, at: new Date(), note });
  await d.save();
  return d;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOrder(id: string, patch: any) {
  const d = await getOrder(id);
  if (patch.internalNotes !== undefined) d.internalNotes = patch.internalNotes;
  if (patch.customerNotes !== undefined) d.customerNotes = patch.customerNotes;
  if (patch.items) {
    d.set('items', patch.items);
    d.subtotal = computeSubtotal(patch.items);
  }
  await d.save();
  return d;
}

// ── convert to order ─────────────────────────────────────────────────────────
async function makeOrderFrom(opts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contact: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vehicle?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  note: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkedCustomer?: any;
  source: string;
}) {
  const items = opts.items.length ? opts.items : [{ name: 'Item', quantity: 1, unitPrice: null }];
  return Order.create({
    orderNumber: await genOrderNumber(),
    status: ORDER_INITIAL_STATUS,
    contact: opts.contact,
    vehicle: opts.vehicle ?? {},
    items,
    subtotal: computeSubtotal(items),
    statusHistory: [{ status: ORDER_INITIAL_STATUS, at: new Date(), note: opts.note }],
    source: opts.source,
    linkedCustomer: opts.linkedCustomer,
  });
}

export async function convertInquiryToOrder(id: string) {
  const inq = await getInquiry(id);
  const order = await makeOrderFrom({
    contact: inq.contact,
    vehicle: inq.vehicle,
    items: (inq.items ?? []).map((i) => ({
      product: i.product,
      slug: i.slug,
      name: i.name,
      sku: i.sku,
      partNumber: i.partNumber,
      quantity: i.quantity,
      unitPrice: null,
      note: i.note,
    })),
    note: `Converted from inquiry ${inq.inquiryNumber}`,
    linkedCustomer: inq.linkedCustomer,
    source: 'inquiry',
  });
  inq.status = InquiryStatus.Converted;
  await inq.save();
  return order;
}

export async function convertQuoteToOrder(id: string) {
  const qr = await getQuoteRequest(id);
  const order = await makeOrderFrom({
    contact: qr.contact,
    vehicle: qr.vehicle,
    items: (qr.items ?? []).map((i) => ({
      product: i.product,
      slug: i.slug,
      name: i.name,
      sku: i.sku,
      partNumber: i.partNumber,
      quantity: i.quantity,
      unitPrice: null,
      note: i.note,
    })),
    note: `Converted from quote request ${qr.requestNumber}`,
    linkedCustomer: qr.linkedCustomer,
    source: 'quote-request',
  });
  qr.status = InquiryStatus.Converted;
  qr.convertedOrder = order._id;
  await qr.save();
  return order;
}

export async function convertLeadToOrder(id: string) {
  const lead = await getLead(id);
  const order = await makeOrderFrom({
    contact: { name: lead.name, phone: lead.phone },
    vehicle: { brand: lead.vehicleBrand, model: lead.vehicleModel, year: lead.vehicleYear },
    items: lead.requiredPart ? [{ name: lead.requiredPart, quantity: 1, unitPrice: null }] : [],
    note: `Converted from lead ${lead.leadNumber}`,
    linkedCustomer: lead.linkedCustomer,
    source: 'lead',
  });
  lead.status = LeadStatus.Converted;
  await lead.save();
  return order;
}

// ── customers (admin) ────────────────────────────────────────────────────────
export function listCustomers(q: ListQuery) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f: any = {};
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    f.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  return paginate(Customer, f, q);
}

export async function getCustomerDetail(id: string) {
  const customer = await Customer.findById(id);
  if (!customer) throw AppError.notFound('Customer not found');
  const [orders, inquiries, quoteRequests] = await Promise.all([
    Order.find({ linkedCustomer: id }).sort('-createdAt'),
    Inquiry.find({ linkedCustomer: id }).sort('-createdAt'),
    QuoteRequest.find({ linkedCustomer: id }).sort('-createdAt'),
  ]);
  return { customer, orders, inquiries, quoteRequests };
}

// ── customer self-service (/me) ──────────────────────────────────────────────
export function listMyOrders(customerId: string) {
  return Order.find({ linkedCustomer: customerId }).sort('-createdAt');
}
export function listMyInquiries(customerId: string) {
  return Inquiry.find({ linkedCustomer: customerId }).sort('-createdAt');
}
export function listMyQuoteRequests(customerId: string) {
  return QuoteRequest.find({ linkedCustomer: customerId }).sort('-createdAt');
}
