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

export const OrderStatus = {
  New: 'New',
  PendingVerification: 'Pending Verification',
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  ReadyForDispatch: 'Ready For Dispatch',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export const ORDER_STATUSES = Object.values(OrderStatus) as OrderStatus[];

/** Order statuses a customer is allowed to self-cancel (Appendix A, fix #5). */
export const CUSTOMER_CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.New,
  OrderStatus.PendingVerification,
];

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

export const StockStatus = {
  InStock: 'In Stock',
  LowStock: 'Low Stock',
  OutOfStock: 'Out Of Stock',
} as const;
export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];
export const STOCK_STATUSES = Object.values(StockStatus) as StockStatus[];

export const ProductAvailability = {
  InStock: 'In Stock',
  LowStock: 'Low Stock',
  OutOfStock: 'Out of Stock',
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
  LowStock: 'low_stock',
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
