import type {
  ContactInfo,
  InquiryDTO,
  InquiryStatus,
  InquirySource,
  LeadDTO,
  LeadStatus,
  LineItem,
  OrderDTO,
  OrderStatus,
  QuoteRequestDTO,
  VehicleInfo,
} from '@sm/shared';
import type { InquiryDoc } from '../../models/Inquiry';
import type { LeadDoc } from '../../models/Lead';
import type { QuoteRequestDoc } from '../../models/QuoteRequest';
import type { OrderDoc } from '../../models/Order';

type Ts = { createdAt?: Date; updatedAt?: Date };
const iso = (d?: Date) => (d ? d.toISOString() : undefined);
const id = (v: unknown) => (v ? String(v) : null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function contact(c: any): ContactInfo {
  return { name: c?.name ?? '', phone: c?.phone ?? undefined, email: c?.email ?? undefined };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function vehicle(v: any): VehicleInfo {
  if (!v) return {};
  return {
    brand: v.brand ?? undefined,
    model: v.model ?? undefined,
    generation: v.generation ?? undefined,
    year: v.year ?? undefined,
    engineType: v.engineType ?? undefined,
    vin: v.vin ?? undefined,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function items(arr: any[] = []): LineItem[] {
  return arr.map((i) => ({
    productId: i.product ? String(i.product) : null,
    slug: i.slug ?? undefined,
    name: i.name,
    sku: i.sku ?? undefined,
    partNumber: i.partNumber ?? undefined,
    quantity: i.quantity ?? 1,
    unitPrice: i.unitPrice ?? null,
    note: i.note ?? undefined,
  }));
}

export function toInquiryDTO(d: InquiryDoc): InquiryDTO {
  const ts = d as unknown as Ts;
  return {
    id: d.id,
    inquiryNumber: d.inquiryNumber,
    source: d.source as InquirySource,
    status: d.status as InquiryStatus,
    contact: contact(d.contact),
    vehicle: vehicle(d.vehicle),
    emirate: d.emirate ?? undefined,
    items: items(d.items),
    message: d.message ?? undefined,
    internalNotes: d.internalNotes ?? undefined,
    linkedCustomerId: id(d.linkedCustomer),
    createdAt: iso(ts.createdAt),
    updatedAt: iso(ts.updatedAt),
  };
}

export function toLeadDTO(d: LeadDoc): LeadDTO {
  const ts = d as unknown as Ts;
  return {
    id: d.id,
    leadNumber: d.leadNumber,
    status: d.status as LeadStatus,
    source: d.source ?? 'Chatbot',
    name: d.name,
    phone: d.phone ?? undefined,
    vehicleBrand: d.vehicleBrand ?? undefined,
    vehicleModel: d.vehicleModel ?? undefined,
    vehicleYear: d.vehicleYear ?? undefined,
    requiredPart: d.requiredPart ?? undefined,
    notes: d.notes ?? undefined,
    internalNotes: d.internalNotes ?? undefined,
    linkedCustomerId: id(d.linkedCustomer),
    createdAt: iso(ts.createdAt),
    updatedAt: iso(ts.updatedAt),
  };
}

export function toQuoteRequestDTO(d: QuoteRequestDoc): QuoteRequestDTO {
  const ts = d as unknown as Ts;
  return {
    id: d.id,
    requestNumber: d.requestNumber,
    status: d.status as InquiryStatus,
    contact: contact(d.contact),
    vehicle: vehicle(d.vehicle),
    items: items(d.items),
    notes: d.notes ?? undefined,
    internalNotes: d.internalNotes ?? undefined,
    convertedOrderId: id(d.convertedOrder),
    linkedCustomerId: id(d.linkedCustomer),
    createdAt: iso(ts.createdAt),
    updatedAt: iso(ts.updatedAt),
  };
}

export function toOrderDTO(d: OrderDoc): OrderDTO {
  const ts = d as unknown as Ts;
  return {
    id: d.id,
    orderNumber: d.orderNumber,
    status: d.status as OrderStatus,
    contact: contact(d.contact),
    shippingAddress: d.shippingAddress
      ? {
          line1: d.shippingAddress.line1 ?? undefined,
          line2: d.shippingAddress.line2 ?? undefined,
          area: d.shippingAddress.area ?? undefined,
          city: d.shippingAddress.city ?? undefined,
          emirate: d.shippingAddress.emirate ?? undefined,
          country: d.shippingAddress.country ?? undefined,
        }
      : undefined,
    vehicle: vehicle(d.vehicle),
    items: items(d.items),
    subtotal: d.subtotal ?? null,
    currency: d.currency ?? 'AED',
    customerNotes: d.customerNotes ?? undefined,
    internalNotes: d.internalNotes ?? undefined,
    statusHistory: (d.statusHistory ?? []).map((e) => ({
      status: e.status as OrderStatus,
      at: iso(e.at) ?? '',
      note: e.note ?? undefined,
    })),
    source: d.source ?? 'web-checkout',
    linkedCustomerId: id(d.linkedCustomer),
    createdAt: iso(ts.createdAt),
    updatedAt: iso(ts.updatedAt),
  };
}
