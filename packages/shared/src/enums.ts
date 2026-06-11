// ─────────────────────────────────────────────────────────────────────────────
// Canonical enums — the single source of truth shared by the API, the admin app,
// and (via compiled JS) the storefront. String values MUST match the spec exactly
// (they are persisted in MongoDB and shown in the UI).
//
// NOTE the deliberate casing difference between stock status ("Out Of Stock") and
// product availability ("Out of Stock") — both exist in the data model and are kept
// distinct on purpose. See docs/ARCHITECTURE.md Appendix A.
// ─────────────────────────────────────────────────────────────────────────────

export const AdminRole = {
  SuperAdmin: 'Super Admin',
  SalesTeam: 'Sales Team',
  InventoryManager: 'Inventory Manager',
  MarketingManager: 'Marketing Manager',
  Viewer: 'Viewer',
} as const;
export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];
export const ADMIN_ROLES = Object.values(AdminRole) as AdminRole[];

export const AuthProvider = {
  Local: 'local',
  Google: 'google',
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

// Simplified order lifecycle (client's actual workflow). Orders START at
// "Pending Verification" — sales verify price/availability/delivery manually.
export const OrderStatus = {
  PendingVerification: 'Pending Verification',
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  OnHold: 'On Hold',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export const ORDER_STATUSES = Object.values(OrderStatus) as OrderStatus[];

/** Orders are created in this status (sales verify manually). */
export const ORDER_INITIAL_STATUS: OrderStatus = OrderStatus.PendingVerification;

/** Order statuses a customer is allowed to self-cancel. */
export const CUSTOMER_CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [OrderStatus.PendingVerification];

export const LeadStatus = {
  New: 'New',
  Contacted: 'Contacted',
  Converted: 'Converted',
  Closed: 'Closed',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export const LEAD_STATUSES = Object.values(LeadStatus) as LeadStatus[];

export const InquiryStatus = {
  New: 'New',
  Contacted: 'Contacted',
  Quoted: 'Quoted',
  Converted: 'Converted',
  Closed: 'Closed',
} as const;
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];
export const INQUIRY_STATUSES = Object.values(InquiryStatus) as InquiryStatus[];

export const InquirySource = {
  WhatsApp: 'WhatsApp Inquiry',
  Chatbot: 'Chatbot',
  ContactForm: 'Contact Form',
  QuoteRequest: 'Quote Request',
} as const;
export type InquirySource = (typeof InquirySource)[keyof typeof InquirySource];
export const INQUIRY_SOURCES = Object.values(InquirySource) as InquirySource[];

/** Customer-submitted quote requests follow the same pipeline as inquiries. */
export type QuoteRequestStatus = InquiryStatus;
export const QUOTE_REQUEST_STATUSES = INQUIRY_STATUSES;

export const QuotationStatus = {
  Draft: 'Draft',
  Sent: 'Sent',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Expired: 'Expired',
} as const;
export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus];
export const QUOTATION_STATUSES = Object.values(QuotationStatus) as QuotationStatus[];

// Admin-controlled product lifecycle / visibility. SpareMec does NOT track stock
// (the client uses an external accounting system) — availability is manual.
export const ProductStatus = {
  Active: 'Active', // visible on the storefront
  Hidden: 'Hidden', // saved but not shown to customers
  Draft: 'Draft', // work-in-progress, never shown
  Archived: 'Archived', // retired, not shown
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
export const PRODUCT_STATUSES = Object.values(ProductStatus) as ProductStatus[];

/** Storefront-visible products (Active = shown to customers). */
export const STOREFRONT_VISIBLE_STATUSES: ProductStatus[] = [ProductStatus.Active];

// Customer-facing availability. "Available" = priced, can be added to cart /
// checked out. "On Request" = price on enquiry (inquiry/quote only).
export const ProductAvailability = {
  Available: 'Available',
  OnRequest: 'On Request',
} as const;
export type ProductAvailability = (typeof ProductAvailability)[keyof typeof ProductAvailability];
export const PRODUCT_AVAILABILITIES = Object.values(ProductAvailability) as ProductAvailability[];

export const ProductCondition = {
  BrandNew: 'Brand New',
  Used: 'Used',
  Refurbished: 'Refurbished',
  OemSurplus: 'OEM Surplus',
} as const;
export type ProductCondition = (typeof ProductCondition)[keyof typeof ProductCondition];
export const PRODUCT_CONDITIONS = Object.values(ProductCondition) as ProductCondition[];

export const NotificationType = {
  NewOrder: 'new_order',
  NewInquiry: 'new_inquiry',
  NewQuoteRequest: 'new_quote_request',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const BannerPlacement = {
  HomeHero: 'home-hero',
  HomePromo: 'home-promo',
  CategoryTop: 'category-top',
} as const;
export type BannerPlacement = (typeof BannerPlacement)[keyof typeof BannerPlacement];

export const ContentPageSlug = {
  About: 'about',
  Contact: 'contact',
  Terms: 'terms',
  Privacy: 'privacy',
  Returns: 'returns',
} as const;
export type ContentPageSlug = (typeof ContentPageSlug)[keyof typeof ContentPageSlug];
