// CRM / sales-pipeline transport shapes shared by the API and admin app.

import type { InquirySource, InquiryStatus, LeadStatus, OrderStatus } from './enums';

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
}

export interface VehicleInfo {
  brand?: string;
  model?: string;
  generation?: string;
  year?: number;
  engineType?: string;
  vin?: string;
}

export interface AddressInfo {
  line1?: string;
  line2?: string;
  area?: string;
  city?: string;
  emirate?: string;
  country?: string;
}

export interface LineItem {
  productId?: string | null;
  slug?: string;
  name: string;
  sku?: string;
  partNumber?: string;
  quantity: number;
  unitPrice?: number | null; // integer fils; null => price on enquiry
  note?: string;
}

export interface InquiryDTO {
  id: string;
  inquiryNumber: string;
  source: InquirySource;
  status: InquiryStatus;
  contact: ContactInfo;
  vehicle: VehicleInfo;
  emirate?: string;
  items: LineItem[];
  message?: string;
  internalNotes?: string;
  linkedCustomerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadDTO {
  id: string;
  leadNumber: string;
  status: LeadStatus;
  source: string;
  name: string;
  phone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  requiredPart?: string;
  notes?: string;
  internalNotes?: string;
  linkedCustomerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteRequestDTO {
  id: string;
  requestNumber: string;
  status: InquiryStatus;
  contact: ContactInfo;
  vehicle: VehicleInfo;
  items: LineItem[];
  notes?: string;
  internalNotes?: string;
  convertedOrderId?: string | null;
  linkedCustomerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  contact: ContactInfo;
  shippingAddress?: AddressInfo;
  vehicle?: VehicleInfo;
  items: LineItem[];
  subtotal?: number | null; // integer fils; null when any item is On Request
  currency: string;
  customerNotes?: string;
  internalNotes?: string;
  statusHistory: OrderStatusEvent[];
  source: string;
  linkedCustomerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** A registered customer with aggregated CRM history counts. */
export interface CustomerSummaryDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  createdAt?: string;
  counts?: { orders: number; inquiries: number; quoteRequests: number };
}
