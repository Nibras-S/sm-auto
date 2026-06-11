# Spare Mec — System Architecture

> **Project:** Automotive Spare Parts E-Commerce + CRM/Admin (UAE/GCC).
> **Stack:** MongoDB + Mongoose · Node.js + Express + TypeScript · Cloudinary · existing React (CRA) storefront · new React + Vite + TypeScript admin · JWT + Google OAuth.
> **Status:** Design baseline produced by a multi-agent design pass. Treat as the working blueprint; the audit in Appendix A lists known gaps to resolve during M0.

This document is the authoritative architecture reference. The phased build plan lives in [ROADMAP.md](ROADMAP.md).

## Contents

- [1. Data Model (MongoDB / Mongoose)](#1-data-model-mongodb-mongoose)
- [2. REST API Design (Express + TypeScript)](#2-rest-api-design-express-typescript)
- [3. RBAC & Authentication](#3-rbac-authentication)
- [4. Admin / CRM App (React + Vite + TS)](#4-admin-crm-app-react-vite-ts)
- [5. Storefront Integration Plan](#5-storefront-integration-plan)
- [6. Infrastructure, Scale & Security](#6-infrastructure-scale-security)
- [7. Monorepo Structure & Tooling](#7-monorepo-structure-tooling)
- [Appendix A — Completeness & Consistency Audit](#appendix-a-completeness-consistency-audit)



---

## 1. Data Model (MongoDB / Mongoose)

### Conventions

- All collections use Mongoose timestamps (`createdAt`, `updatedAt`) unless noted. These are omitted from field tables.
- `ObjectId → X` means a ref to collection `X`. Soft-deletable collections carry `isDeleted: Boolean (default false)` + `deletedAt: Date?`.
- Money is stored in **fils (integer minor units, AED ×100)** to avoid float errors. `currency` defaults to `"AED"`. All money fields are nullable where pricing is optional.
- "req" = required, "opt" = optional. Defaults shown only when non-trivial.

### Identity Model: AdminUser vs Customer — Recommendation

**Split into two collections, not a discriminator.** Staff and customers diverge sharply: staff need `role`/permissions/RBAC and are seeded by Super Admin; customers self-register, have addresses, vehicles, wishlist, carts, order history, and Google OAuth. Their query patterns, auth flows, and admin surfaces share almost nothing. A discriminator would force null-heavy documents and leak staff-only indexes into the hot customer collection (50k+ products implies a large customer base). Keep them separate; share a thin `AuthIdentity` pattern only via common fields (email, passwordHash, googleId), duplicated intentionally.

**Role/Permission — Recommendation: hardcoded role enum + derived permission map in code, with an optional `permissionOverrides` array on AdminUser.** The 5 roles are fixed by spec (Super Admin, Sales Team, Inventory Manager, Marketing Manager, Viewer). A full dynamic Role/Permission collection is over-engineering for a fixed set. Store `role` as an enum on AdminUser; resolve the permission set from a static `ROLE_PERMISSIONS` map at request time. Provide a `permissionOverrides: [String]` escape hatch for per-user grants/revocations without a schema migration. (A `Role` collection spec is included below as optional, should they later want UI-editable roles.)

---

### AdminUser

Staff/CRM users.

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| name | String | req | — | trimmed |
| email | String | req | — | unique, lowercase, indexed |
| passwordHash | String | req | — | bcrypt/argon2; `select:false` |
| role | String | req | `"Viewer"` | `[Super Admin, Sales Team, Inventory Manager, Marketing Manager, Viewer]` |
| permissionOverrides | [String] | opt | `[]` | extra/removed perms; prefixed `+perm`/`-perm` |
| phone | String | opt | — | |
| avatar | { publicId, url } | opt | — | Cloudinary |
| isActive | Boolean | req | `true` | deactivate instead of delete |
| lastLoginAt | Date | opt | — | |
| refreshTokenHash | String | opt | — | `select:false`; for refresh-token rotation/revoke |
| createdBy | ObjectId → AdminUser | opt | — | who provisioned this account |

Notes: Indexes `{ email: 1 }` unique, `{ role: 1, isActive: 1 }`. Never store plaintext. Super Admin cannot be deleted, only deactivated (enforce in service layer).

### Role (OPTIONAL — only if UI-editable roles are later required)

| Field | Type | R/O | Notes |
|---|---|---|---|
| key | String | req | unique, e.g. `sales_team` |
| name | String | req | display |
| permissions | [String] | req | permission keys |
| isSystem | Boolean | req | system roles cannot be deleted |

Permission keys (enum/constant in code regardless): `product.read/write/delete`, `inventory.read/write`, `order.read/write`, `customer.read/write`, `lead.read/write`, `quotation.read/write`, `banner.write`, `content.write`, `faq.write`, `report.read`, `user.manage`, `settings.write`. Static map:
- Super Admin → all
- Sales Team → order.*, customer.read, lead.*, quotation.*, report.read
- Inventory Manager → product.*, inventory.*, report.read
- Marketing Manager → banner.write, content.write, faq.write
- Viewer → all `.read`

### Customer

Storefront account holder. Guest checkout creates **no** Customer doc (data lives on the Order/Inquiry directly).

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| name | String | req | — | |
| email | String | req | — | unique (sparse if phone-only later), lowercase, indexed |
| passwordHash | String | opt | — | `select:false`; null for Google-only accounts |
| googleId | String | opt | — | unique sparse; Google OAuth sub |
| authProvider | String | req | `"local"` | `[local, google]` |
| phone | String | opt | — | indexed (search/CRM) |
| emailVerified | Boolean | req | `false` | |
| defaultAddress | ObjectId → Address | opt | — | |
| vehicles | [VehicleInfo subdoc] | opt | `[]` | see below — "Vehicle Information" account section |
| marketingOptIn | Boolean | req | `false` | |
| isActive | Boolean | req | `true` | |
| lastLoginAt | Date | opt | — | |
| refreshTokenHash | String | opt | — | `select:false` |

**VehicleInfo subdoc** (embedded in Customer.vehicles): `{ label?, brand (String), model?, generation?, year?, engineType?, vin?, makeRef?: ObjectId→VehicleMake, modelRef?: ObjectId→VehicleModel }`. Embedded because vehicles are owned by and only queried via the customer.

Notes: Indexes `{ email: 1 }` unique, `{ googleId: 1 }` unique sparse, `{ phone: 1 }`. Addresses, Wishlist, Cart, Orders, Inquiries are **separate** collections referencing `customer`.

### Address

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| customer | ObjectId → Customer | req | — | indexed |
| label | String | opt | — | "Home", "Office" |
| contactName | String | req | — | |
| phone | String | req | — | |
| line1 | String | req | — | |
| line2 | String | opt | — | |
| area | String | opt | — | district/community |
| city | String | req | — | |
| emirate | String | opt | — | UAE emirate; free-text for GCC |
| country | String | req | `"United Arab Emirates"` | GCC expansion |
| isDefault | Boolean | req | `false` | |

Notes: Index `{ customer: 1 }`. Order stores a **snapshot** of the address (see Order), not just a ref, so historical orders stay accurate if the address is later edited/deleted.

---

### Brand (Vehicle Make / Manufacturer brand)

Spec mixes "brand" (Mercedes-Benz, BMW…) for both the part's manufacturer brand and the vehicle make. In this catalogue they coincide (genuine parts). Model **VehicleMake** as the canonical vehicle manufacturer and a separate **Brand** as the *part* brand; allow a part's `brand` to point at either. To keep it simple and match existing data, unify them: one **Brand** collection serves as both part brand and vehicle make, with a `kind` flag.

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| name | String | req | — | unique, e.g. "Mercedes-Benz" |
| slug | String | req | — | unique, e.g. "mercedes-benz" |
| kind | [String] | req | `["vehicle"]` | items in `[vehicle, part]` |
| logo | { publicId, url } | opt | — | Cloudinary |
| country | String | opt | — | |
| displayOrder | Number | req | `0` | |
| isActive | Boolean | req | `true` | |

Notes: Indexes `{ slug: 1 }` unique, `{ name: 1 }`. `VehicleMake` below is an **alias view** of this collection (`kind` includes `vehicle`); implemented as the same `Brand` model to avoid duplication. References elsewhere named `VehicleMake` point to `Brand._id`.

### Category

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| name | String | req | — | "Engine" |
| slug | String | req | — | unique, indexed; "engine" |
| icon | { publicId, url } | opt | — | Cloudinary (replaces static png imports) |
| tagline | String | opt | — | |
| description | String | opt | — | |
| displayOrder | Number | req | `0` | homepage ordering |
| isActive | Boolean | req | `true` | |
| productCount | Number | req | `0` | denormalized, recomputed on product writes |

Notes: Index `{ slug: 1 }` unique, `{ displayOrder: 1 }`.

### Subcategory

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| name | String | req | — | "Oil Filter" |
| slug | String | req | — | unique per category |
| category | ObjectId → Category | req | — | indexed |
| description | String | opt | — | |
| displayOrder | Number | req | `0` | |
| isActive | Boolean | req | `true` | |

Notes: Compound unique index `{ category: 1, slug: 1 }`. Separate collection (not embedded) because bulk import and product forms reference subcategories independently and they need their own slugs/listing pages.

---

### VehicleMake / VehicleModel / VehicleGeneration

Normalized vehicle taxonomy powering structured fitment and "search by Vehicle Brand/Model". `VehicleMake` = `Brand` (kind includes `vehicle`), reused. Models and generations are their own collections.

#### VehicleModel

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| make | ObjectId → Brand | req | — | indexed; the vehicle make |
| name | String | req | — | "3 Series", "Cayenne" |
| slug | String | req | — | unique per make |
| displayOrder | Number | req | `0` | |
| isActive | Boolean | req | `true` | |

Compound unique `{ make: 1, slug: 1 }`. Index `{ make: 1, name: 1 }`.

#### VehicleGeneration

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| model | ObjectId → VehicleModel | req | — | indexed |
| make | ObjectId → Brand | req | — | denormalized for direct filtering |
| code | String | req | — | chassis code, "E90", "W213", "996" |
| name | String | opt | — | "F30 (2012–2019)" |
| yearStart | Number | opt | — | e.g. 2012 |
| yearEnd | Number | opt | — | null = still produced |
| engineTypes | [String] | opt | `[]` | optional curated list, e.g. ["N20","B48"] |

Compound unique `{ model: 1, code: 1 }`. Index `{ make: 1, model: 1 }`.

### Fitment

Queryable join linking a Product to vehicle applicability. **Separate collection** (not just embedded) so fitment is independently indexable/searchable at scale and a single fitment row can be reused/validated. Also keep a **denormalized embedded copy** on Product for fast product-page rendering (see Product.fitment). The collection is the source of truth for "which products fit BMW E90".

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| product | ObjectId → Product | req | — | indexed |
| make | ObjectId → Brand | opt | — | indexed |
| makeName | String | opt | — | denormalized for display/search |
| model | ObjectId → VehicleModel | opt | — | indexed |
| modelName | String | opt | — | denormalized |
| generation | ObjectId → VehicleGeneration | opt | — | indexed |
| generationCode | String | opt | — | "E90" |
| engineType | String | opt | — | "N20 2.0T" |
| yearStart | Number | opt | — | |
| yearEnd | Number | opt | — | |
| position | String | opt | — | "Left/Right", "Front" |
| note | String | opt | — | free-text, e.g. "Exact fitment confirmed by VIN" |
| isVerified | Boolean | req | `false` | confirmed vs illustrative |

Notes: Compound indexes below in Search Strategy. Use `make/model/generation` refs for exact filters and the `*Name`/`generationCode` strings for fuzzy search ("BMW E90 Control Arm").

---

### Product

Core catalogue document. Pricing is **optional** → drives availability "On Request".

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| name | String | req | — | indexed (text) |
| slug | String | req | — | unique, indexed |
| partNumber | String | opt | — | indexed; e.g. "A4602407018" |
| oemNumber | String | opt | — | indexed |
| sku | String | opt | — | unique sparse, indexed |
| altPartNumbers | [String] | opt | `[]` | cross-reference numbers, indexed |
| brand | ObjectId → Brand | opt | — | part brand; indexed |
| brandName | String | opt | — | denormalized |
| category | ObjectId → Category | req | — | indexed |
| categoryName | String | opt | — | denormalized |
| subcategory | ObjectId → Subcategory | opt | — | indexed |
| productType | String | opt | — | "OEM / Genuine", "OEM-Quality Aftermarket" |
| productFamily | String | opt | — | grouping label |
| type | String | opt | — | legacy `type` field from existing data |
| condition | String | req | `"Brand New"` | `[Brand New, Used, Refurbished, OEM Surplus]` |
| price | Number (fils) | **opt/nullable** | `null` | null ⇒ "On Request" |
| costPrice | Number (fils) | **opt/nullable** | `null` | `select:false`; staff-only |
| compareAtPrice | Number (fils) | opt | — | strikethrough |
| currency | String | req | `"AED"` | |
| taxRate | Number | opt | `5` | VAT % (UAE 5%) |
| stockQuantity | Number | req | `0` | denormalized default-warehouse qty (authoritative source = Inventory) |
| lowStockThreshold | Number | req | `5` | drives Low Stock + alerts |
| availability | String | req | computed | `[In Stock, Low Stock, Out of Stock, On Request]` — see note |
| stockStatus | String | req | computed | `[In Stock, Low Stock, Out Of Stock]` (inventory-only enum) |
| warranty | String | opt | — | "6-month replacement warranty" |
| shortDescription | String | opt | — | |
| description | String | opt | — | long, supports `\n\n` |
| highlights | [String] | opt | `[]` | key features bullets |
| specs | [{ label, value }] | opt | `[]` | free-form spec rows |
| material | String | opt | — | |
| weight | { value, unit } | opt | — | unit default "kg" |
| dimensions | { length, width, height, unit } | opt | — | unit default "cm" |
| countryOfOrigin | String | opt | — | |
| fitment | [Fitment subdoc] | opt | `[]` | denormalized embedded copy (make/model/gen/engine/years/note) for product page |
| images | [ProductImage subdoc] | opt | `[]` | embedded, sortable (see ProductImage) |
| primaryImage | { publicId, url } | opt | — | denormalized first/sorted image for lists |
| featured | Boolean | req | `false` | indexed |
| trending | Boolean | req | `false` | indexed |
| frequentlyBoughtWith | [ObjectId → Product] | opt | `[]` | curated "Frequently Bought Together" |
| relatedProducts | [ObjectId → Product] | opt | `[]` | optional manual overrides |
| tags | [String] | opt | `[]` | text-indexed |
| status | String | req | `"active"` | `[active, hidden, draft, archived]` — "hide/activate/delete" |
| isActive | Boolean | req | `true` | derived convenience flag |
| externalId | String | opt | — | "Product ID" from bulk Excel; unique sparse — upsert key |
| viewCount | Number | req | `0` | popularity |
| salesCount | Number | req | `0` | "Top Selling" |
| ratingAvg | Number | opt | — | future reviews |

**availability computation rule:** if `price == null` → `On Request`. Else if `stockQuantity <= 0` → `Out of Stock`; else if `stockQuantity <= lowStockThreshold` → `Low Stock`; else `In Stock`. Recompute on every stock/price write (pre-save hook + on StockMovement). `stockStatus` mirrors the In/Low/Out portion only.

Notes: Existing string availabilities ("Limited Stock", "Made to Order") map to the enum at migration ("Limited Stock"→"Low Stock", "Made to Order"→"On Request"). `costPrice`/`compareAtPrice`/`taxRate` always `select:false` or gated by RBAC on the API.

### ProductImage (embedded subdoc on Product.images)

**Recommendation: embed**, not a separate collection. Images are always loaded with the product, are few (<20), and need order maintained relative to the parent. A separate collection adds a join for zero benefit.

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| publicId | String | req | — | Cloudinary `public_id` (for replace/delete) |
| url | String | req | — | secure_url |
| alt | String | opt | — | |
| sortOrder | Number | req | `0` | sortable in admin |
| width | Number | opt | — | |
| height | Number | opt | — | |
| isPrimary | Boolean | req | `false` | mirrors `primaryImage` |

---

### Warehouse

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| name | String | req | — | "Dubai Main" |
| code | String | req | — | unique, "DXB-01" |
| isDefault | Boolean | req | `false` | exactly one default (enforce in service) |
| address | { line1, city, emirate, country } | opt | — | |
| isActive | Boolean | req | `true` | |

Notes: Seed one default warehouse now; multi-warehouse-ready for future. Index `{ code: 1 }` unique.

### Inventory (StockLevel — per product per warehouse)

Authoritative stock. `Product.stockQuantity` is a denormalized roll-up of the default warehouse for fast reads.

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| product | ObjectId → Product | req | — | indexed |
| warehouse | ObjectId → Warehouse | req | — | indexed |
| quantity | Number | req | `0` | on-hand |
| reserved | Number | req | `0` | held by pending/confirmed orders |
| available | Number | req | computed | `quantity - reserved` (virtual or maintained) |
| lowStockThreshold | Number | opt | — | per-warehouse override of product threshold |
| binLocation | String | opt | — | aisle/shelf |
| lastCountedAt | Date | opt | — | cycle-count audit |

Notes: Compound **unique** `{ product: 1, warehouse: 1 }`. Index `{ warehouse: 1, available: 1 }` for low-stock reports. On every change, write a StockMovement and recompute `Product.stockQuantity`/availability.

### StockMovement (audit of every stock change)

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| product | ObjectId → Product | req | — | indexed |
| warehouse | ObjectId → Warehouse | req | — | indexed |
| type | String | req | — | `[purchase, sale, adjustment, return, transfer_in, transfer_out, reservation, release, correction, bulk_import]` |
| quantityChange | Number | req | — | signed (+/-) |
| quantityBefore | Number | req | — | |
| quantityAfter | Number | req | — | |
| reason | String | opt | — | free text |
| referenceType | String | opt | — | `[Order, Quotation, Manual, Import]` |
| referenceId | ObjectId | opt | — | polymorphic ref (e.g. the Order) |
| performedBy | ObjectId → AdminUser | opt | — | null for system |

Notes: Append-only (no updates/deletes). Index `{ product: 1, createdAt: -1 }`, `{ warehouse: 1, createdAt: -1 }`.

---

### Cart

Server-side cart for logged-in customers; guests keep client-side localStorage carts (existing InquiryContext pattern) merged on login. Only price-bearing products are checkout-eligible; "On Request" items can sit in cart but route to inquiry.

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| customer | ObjectId → Customer | opt | — | unique sparse; null for anonymous server carts keyed by token |
| sessionToken | String | opt | — | for guest server carts (optional); unique sparse |
| items | [CartItem subdoc] | req | `[]` | embedded |
| currency | String | req | `"AED"` | |
| updatedAt | Date | auto | — | TTL candidate for abandoned guest carts |

**CartItem subdoc:** `{ product: ObjectId→Product (req), slug, name (snapshot), partNumber, brandName, primaryImage, unitPrice: Number(fils, nullable), qty: Number (req, min 1, default 1), isOnRequest: Boolean }`. Snapshots keep the cart stable if product changes; `unitPrice` re-validated at checkout.

Notes: Index `{ customer: 1 }` unique sparse. Optional TTL index on `updatedAt` for guest carts (e.g. 30 days).

### Order

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| orderNumber | String | req | — | unique, human-friendly via Counter, e.g. "SM-O-2026-00042" |
| customer | ObjectId → Customer | opt | — | null for guest checkout; indexed |
| isGuest | Boolean | req | `false` | |
| customerName | String | req | — | min-required field (guest allowed) |
| customerPhone | String | opt | — | indexed for CRM lookup |
| customerEmail | String | opt | — | |
| items | [OrderItem subdoc] | req | — | embedded snapshot |
| shippingAddress | Address snapshot subdoc | opt | — | embedded copy, not ref |
| vehicle | VehicleInfo subdoc | opt | — | optional vehicle context |
| subtotal | Number (fils) | req | — | |
| taxTotal | Number (fils) | req | `0` | |
| shippingTotal | Number (fils) | req | `0` | |
| discountTotal | Number (fils) | req | `0` | |
| grandTotal | Number (fils) | req | — | |
| currency | String | req | `"AED"` | |
| status | String | req | `"New"` | `[New, Pending Verification, Confirmed, Processing, Ready For Dispatch, Shipped, Delivered, Cancelled]` |
| paymentStatus | String | req | `"Unpaid"` | `[Unpaid, Pending, Paid, Refunded, Failed]` — payment not mandatory initially |
| paymentMethod | String | opt | — | `[None, Cash on Delivery, Bank Transfer, Card, WhatsApp]` |
| fulfillmentWarehouse | ObjectId → Warehouse | opt | — | |
| source | String | req | `"Website"` | `[Website, WhatsApp, Phone, CRM]` |
| notes | [OrderNote subdoc] | opt | `[]` | `{ text, by: ObjectId→AdminUser, at: Date }` |
| statusHistory | [{ status, by, at, note }] | opt | `[]` | audit trail |
| placedBy | ObjectId → AdminUser | opt | — | if created in CRM |
| confirmedAt / shippedAt / deliveredAt / cancelledAt | Date | opt | — | milestone timestamps |
| cancellationReason | String | opt | — | |

**OrderItem subdoc:** `{ product: ObjectId→Product, slug, name, partNumber, oemNumber, sku, brandName, primaryImage, unitPrice: Number(fils), qty (req), lineTotal: Number(fils), taxRate, isOnRequest: Boolean }`. Full snapshot — orders must be immutable to later product edits.

Notes: New direct-checkout orders enter `Pending Verification` (per spec) after creation in `New`. Indexes `{ orderNumber: 1 }` unique, `{ customer: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`, `{ customerPhone: 1 }`, `{ createdAt: -1 }` (dashboard/reports).

---

### Wishlist (server-side, for logged-in users)

**Recommendation: one Wishlist doc per customer with an embedded items array** (a customer has one wishlist; small array; always loaded together). Guests use the existing client-side WishlistContext, merged on login.

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| customer | ObjectId → Customer | req | — | unique |
| items | [{ product: ObjectId→Product, slug, addedAt: Date }] | req | `[]` | snapshot slug for resilience |

Notes: Index `{ customer: 1 }` unique. `{ "items.product": 1 }` multikey for "who wishlisted X" analytics.

### Inquiry

Unified store for every inquiry across sources (WhatsApp, Chatbot, Contact Form, Quote Request). Captures all WhatsApp/chatbot fields + structured vehicle subdoc.

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| inquiryNumber | String | req | — | unique via Counter, "SM-INQ-2026-000123" |
| source | String | req | — | `[WhatsApp Inquiry, Chatbot, Contact Form, Quote Request]` |
| status | String | req | `"New"` | `[New, Contacted, Quoted, Converted, Closed]` |
| customerName | String | req | — | only strictly required field |
| phone | String | opt | — | indexed |
| email | String | opt | — | |
| vehicle | VehicleInfo subdoc | opt | — | `{ brand, model, year, generation, engineType, vin }` structured |
| partNumber | String | opt | — | requested part no |
| partRequired | String | opt | — | free-text part description (chatbot "Part Required") |
| quantity | Number | opt | — | |
| notes | String | opt | — | |
| items | [InquiryItem subdoc] | opt | `[]` | for cart-style multi-part inquiries |
| whatsappMessage | String | opt | — | the generated WA message body (CRM copy per spec) |
| whatsappLink | String | opt | — | wa.me link generated |
| customer | ObjectId → Customer | opt | — | linked if logged in; indexed |
| assignedTo | ObjectId → AdminUser | opt | — | sales owner; indexed |
| convertedOrder | ObjectId → Order | opt | — | if converted |
| convertedQuotation | ObjectId → Quotation | opt | — | |
| contactedAt / quotedAt / convertedAt / closedAt | Date | opt | — | funnel timestamps |
| pageUrl / referrer | String | opt | — | analytics context |

**InquiryItem subdoc:** `{ product?: ObjectId→Product, slug?, name, partNumber?, brand?, qty (default 1) }` — mirrors the storefront InquiryContext item shape.

Notes: This is the canonical "every inquiry stored" table. Indexes `{ status: 1, createdAt: -1 }`, `{ source: 1 }`, `{ phone: 1 }`, `{ assignedTo: 1, status: 1 }`, `{ customer: 1 }`, `{ createdAt: -1 }`.

### Lead

CRM lead, primarily generated by the chatbot ("create CRM Lead"). Distinct from Inquiry: a Lead is a sales-pipeline contact that may aggregate multiple inquiries. **Recommendation: keep separate but lightweight**, linked to Inquiry. (If they prefer one funnel, Lead can be folded into Inquiry — but spec lists Leads and Inquiries as separate dashboard counts, so keep separate.)

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| name | String | req | — | |
| phone | String | opt | — | indexed |
| email | String | opt | — | |
| vehicle | VehicleInfo subdoc | opt | — | brand/model/year |
| partRequired | String | opt | — | |
| notes | String | opt | — | |
| source | String | req | `"Chatbot"` | `[Chatbot, WhatsApp Inquiry, Contact Form, Quote Request, Manual]` |
| status | String | req | `"New"` | `[New, Contacted, Quoted, Converted, Closed]` (aligned with Inquiry) |
| sourceInquiry | ObjectId → Inquiry | opt | — | originating inquiry |
| assignedTo | ObjectId → AdminUser | opt | — | indexed |
| customer | ObjectId → Customer | opt | — | linked if known |
| slaDueAt | Date | opt | — | "contact within 1 hour" SLA tracking |

Notes: Indexes `{ status: 1, createdAt: -1 }`, `{ assignedTo: 1 }`, `{ phone: 1 }`.

### QuoteRequest

"Request a Quote" purchase method: name, mobile, vehicle details, quantity, notes. Saved to CRM. Distinct from a Quotation (the staff-produced priced document).

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| requestNumber | String | req | — | unique via Counter |
| customerName | String | req | — | |
| mobile | String | req | — | indexed (spec lists mobile required) |
| email | String | opt | — | |
| vehicle | VehicleInfo subdoc | opt | — | |
| items | [{ product?, name, partNumber?, qty (default 1) }] | opt | `[]` | |
| quantity | Number | opt | — | |
| notes | String | opt | — | |
| status | String | req | `"New"` | `[New, Contacted, Quoted, Converted, Closed]` |
| customer | ObjectId → Customer | opt | — | if logged in |
| assignedTo | ObjectId → AdminUser | opt | — | |
| quotation | ObjectId → Quotation | opt | — | produced quotation |
| inquiry | ObjectId → Inquiry | opt | — | also mirrored into Inquiry on create |

Notes: On create, also write an Inquiry row with `source: "Quote Request"` so the unified inquiry list and dashboard counts stay consistent. Indexes `{ status: 1, createdAt: -1 }`, `{ mobile: 1 }`.

### Quotation

Staff-produced priced quote (sent to customer).

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| quotationNumber | String | req | — | unique via Counter, "SM-Q-2026-00088" |
| status | String | req | `"Draft"` | `[Draft, Sent, Approved, Rejected, Expired]` |
| customerName | String | req | — | |
| phone | String | opt | — | |
| email | String | opt | — | |
| customer | ObjectId → Customer | opt | — | |
| vehicle | VehicleInfo subdoc | opt | — | |
| items | [QuotationItem subdoc] | req | — | embedded |
| subtotal | Number (fils) | req | — | |
| taxTotal | Number (fils) | req | `0` | |
| discountTotal | Number (fils) | req | `0` | |
| grandTotal | Number (fils) | req | — | |
| currency | String | req | `"AED"` | |
| validUntil | Date | opt | — | drives auto-Expired |
| notes / terms | String | opt | — | |
| sourceInquiry | ObjectId → Inquiry | opt | — | |
| sourceQuoteRequest | ObjectId → QuoteRequest | opt | — | |
| convertedOrder | ObjectId → Order | opt | — | if approved → order |
| createdBy | ObjectId → AdminUser | req | — | sales author |
| sentAt / approvedAt / rejectedAt | Date | opt | — | |
| pdfFile | { publicId, url } | opt | — | generated PDF (Cloudinary/raw) |

**QuotationItem subdoc:** `{ product?: ObjectId→Product, name, partNumber?, oemNumber?, sku?, brandName?, qty (req), unitPrice: Number(fils, req), lineTotal: Number(fils), taxRate? }`.

Notes: Indexes `{ quotationNumber: 1 }` unique, `{ status: 1, createdAt: -1 }`, `{ customer: 1 }`, `{ validUntil: 1 }` (expiry sweep).

---

### Banner

Homepage banners — upload/edit/hide/reorder.

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| title | String | opt | — | |
| subtitle | String | opt | — | |
| image | { publicId, url } | req | — | Cloudinary; desktop |
| mobileImage | { publicId, url } | opt | — | responsive variant |
| ctaLabel | String | opt | — | |
| ctaLink | String | opt | — | internal/external URL |
| placement | String | req | `"home-hero"` | `[home-hero, home-strip, category-top, promo]` |
| sortOrder | Number | req | `0` | reorderable |
| isActive | Boolean | req | `true` | hide/show |
| startAt / endAt | Date | opt | — | scheduled campaigns |

Notes: Index `{ placement: 1, sortOrder: 1, isActive: 1 }`.

### FAQ

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| question | String | req | — | |
| answer | String | req | — | |
| category | String | opt | — | grouping, e.g. "Orders", "Shipping" |
| sortOrder | Number | req | `0` | |
| isActive | Boolean | req | `true` | |

Notes: Index `{ category: 1, sortOrder: 1 }`.

### ContentPage

About Us, Contact Information, Terms & Conditions, Privacy Policy — slugged editable docs.

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| slug | String | req | — | unique; `[about, contact, terms, privacy, returns]` (extensible) |
| title | String | req | — | |
| body | String | req | — | HTML/markdown rich text |
| metaTitle / metaDescription | String | opt | — | SEO |
| isPublished | Boolean | req | `true` | |
| updatedBy | ObjectId → AdminUser | opt | — | |
| version | Number | req | `1` | bump on edit |

Notes: Index `{ slug: 1 }` unique. Contact-specific structured fields (phone, address, hours, social) live in **Setting/SiteConfig**, not here.

### Notification

In-CRM notifications (also fan out to email/WhatsApp via workers).

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| type | String | req | — | `[New Order, New Inquiry, New Quote Request, Low Stock, Order Status, System]` |
| title | String | req | — | |
| message | String | opt | — | |
| severity | String | req | `"info"` | `[info, warning, critical]` |
| referenceType | String | opt | — | `[Order, Inquiry, QuoteRequest, Product, Lead]` |
| referenceId | ObjectId | opt | — | polymorphic |
| recipient | ObjectId → AdminUser | opt | — | null = broadcast to role |
| recipientRole | String | opt | — | role-targeted (e.g. Inventory Manager for Low Stock) |
| channels | [String] | opt | `["crm"]` | items in `[crm, email, whatsapp]` |
| isRead | Boolean | req | `false` | indexed |
| readAt | Date | opt | — | |
| deliveryStatus | { email, whatsapp } | opt | — | `[pending, sent, failed]` per channel |

Notes: Indexes `{ recipient: 1, isRead: 1, createdAt: -1 }`, `{ recipientRole: 1, isRead: 1 }`. Optional TTL on old read notifications.

### AuditLog

Generic action audit for staff operations (compliance, "track stock changes" is separate via StockMovement; this is broader).

| Field | Type | R/O | Default | Enum / Notes |
|---|---|---|---|---|
| actor | ObjectId → AdminUser | opt | — | null = system |
| actorName | String | opt | — | snapshot |
| action | String | req | — | `[create, update, delete, login, logout, status_change, bulk_import, export, role_change]` |
| entityType | String | req | — | collection name |
| entityId | ObjectId | opt | — | |
| before | Mixed | opt | — | snapshot (redacted of secrets) |
| after | Mixed | opt | — | |
| ip / userAgent | String | opt | — | |

Notes: Append-only. Index `{ entityType: 1, entityId: 1, createdAt: -1 }`, `{ actor: 1, createdAt: -1 }`.

### Setting / SiteConfig

Single (or few) document(s) for editable global config — contact info, WhatsApp number, service areas, social links (replaces static `siteConfig.js`).

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| key | String | req | `"global"` | unique; supports namespacing later |
| brand | { name, fullName, legalName, tagline, foundedYear, logo:{publicId,url} } | opt | — | |
| contact | { whatsappNumber, phoneNumber, whatsappDisplay, phoneDisplay, email, address, mapsUrl, hours } | opt | — | seeds from siteConfig.js (WA 971507855298) |
| social | { instagram, facebook, tiktok, youtube } | opt | — | |
| serviceAreas | [String] | opt | — | GCC list |
| whatsappGreeting | String | opt | — | |
| defaults | { currency:"AED", taxRate:5, lowStockThreshold:5 } | opt | — | platform defaults |
| features | { paymentsEnabled:false, chatbotEnabled:true, comingSoon:false } | opt | — | feature flags incl. existing IS_COMING_SOON |

Notes: Index `{ key: 1 }` unique. Cache aggressively (read-mostly).

### RecentlyViewed — Recommendation

**Client-side for guests; lightweight server collection only for logged-in users (optional).** Recently Viewed is ephemeral, per-device, and high-write — store in localStorage on the storefront (matches existing context patterns) for guests. For logged-in users who want cross-device continuity, an optional capped collection:

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| customer | ObjectId → Customer | req | — | indexed |
| items | [{ product: ObjectId→Product, slug, viewedAt: Date }] | req | `[]` | cap to last ~20 (slice on write) |

Notes: One doc per customer; `$push` with `$slice: -20`. Index `{ customer: 1 }` unique. Product `viewCount` increments independently for analytics.

### Counter

Atomic sequence generator for human-friendly numbers (orders, quotes, inquiries, quote requests).

| Field | Type | R/O | Default | Notes |
|---|---|---|---|---|
| key | String | req | — | unique, e.g. `order:2026`, `quotation:2026` |
| seq | Number | req | `0` | incremented via `findOneAndUpdate($inc, upsert)` |

Notes: Index `{ key: 1 }` unique. Pattern: `SM-O-{year}-{padded seq}`. Use one counter per (type, year) for yearly resets, or a single per-type counter if no reset desired. Atomic `findOneAndUpdate` guarantees no collisions under concurrency.

---

### Indexes & Search Strategy

**Product search (50k+ scale).** The spec requires search by Product Name, Part Number, OEM Number, SKU, Vehicle Brand, Vehicle Model with example queries like `"A4602407018"`, `"Engine Mount Mercedes"`, `"BMW E90 Control Arm"`. Two complementary layers:

1. **Exact / prefix identifier lookups** (part numbers, OEM, SKU — users paste exact codes):
   - `{ partNumber: 1 }`, `{ oemNumber: 1 }`, `{ sku: 1 }` (unique sparse), `{ altPartNumbers: 1 }` (multikey).
   - Normalize codes (uppercase, strip spaces/dashes) into a `searchTokens: [String]` field, index `{ searchTokens: 1 }`, so `A4602407018` and `4602407018` both match. This is the most reliable path for auto-parts and should be tried before text search.

2. **Full-text relevance** (name + free phrases):
   - A weighted MongoDB **text index**: `{ name: "text", brandName: "text", categoryName: "text", description: "text", tags: "text", "fitment.makeName": "text", "fitment.modelName": "text", "fitment.generationCode": "text" }` with weights `name:10, brandName:6, fitment.modelName:5, fitment.generationCode:5, tags:3, description:1`. This serves `"Engine Mount Mercedes"` and `"BMW E90 Control Arm"`.
   - One text index per collection limit respected (Product gets the single text index).
   - **At true 50k+ / typo-tolerance / faceted search, recommend Atlas Search (Lucene) or a dedicated engine (Meilisearch/Typesense)** layered on top; the schema's denormalized `*Name` and `searchTokens` fields are designed to feed either MongoDB text or an external index without remodeling.

3. **Filtering / faceting** (catalogue filters):
   - `{ category: 1, status: 1 }`, `{ subcategory: 1, status: 1 }`, `{ brand: 1, status: 1 }`, `{ featured: 1 }`, `{ trending: 1 }`, `{ status: 1, createdAt: -1 }` (listing default sort), `{ salesCount: -1 }` (top selling), `{ price: 1 }` (price sort, sparse since nullable).
   - Compound `{ category: 1, brand: 1, status: 1 }` for the common category+brand filter combo.

**Fitment queries** ("which products fit BMW E90 / N20 engine, 2012–2016"): on the **Fitment** collection:
   - `{ make: 1, model: 1, generation: 1 }` — primary exact-fit lookup.
   - `{ make: 1, model: 1, yearStart: 1, yearEnd: 1 }` — year-range overlap queries.
   - `{ generationCode: 1 }` and `{ modelName: 1 }` for string-based fitment search.
   - `{ product: 1 }` to fetch a product's full fitment list.
   - Year-range matching uses `yearStart <= queryYear AND (yearEnd >= queryYear OR yearEnd == null)`.

**CRM / dashboard performance:**
   - Order: `{ status: 1, createdAt: -1 }`, `{ createdAt: -1 }` (revenue/charts time-series), `{ customer: 1, createdAt: -1 }`, `{ customerPhone: 1 }`.
   - Inquiry/Lead/QuoteRequest: `{ status: 1, createdAt: -1 }`, `{ assignedTo: 1, status: 1 }`, `{ phone: 1 }` / `{ mobile: 1 }`.
   - Inventory low-stock: `{ warehouse: 1, available: 1 }`; StockMovement `{ product: 1, createdAt: -1 }`.
   - Notification: `{ recipient: 1, isRead: 1, createdAt: -1 }`.

**General principles:** every customer-facing list query filters on `status`/`isActive` — keep those leading columns of compound indexes. Denormalize `*Name` fields (brandName, categoryName, fitment names) to avoid joins in hot read paths and to feed the text index. Use partial indexes where useful (e.g. `{ price: 1 }` partial on `price != null`). Cap text index to Product only; use identifier + facet indexes elsewhere.

---

### Enums Reference

| Enum | Values |
|---|---|
| **AdminUser.role** | Super Admin, Sales Team, Inventory Manager, Marketing Manager, Viewer |
| **Order.status** | New, Pending Verification, Confirmed, Processing, Ready For Dispatch, Shipped, Delivered, Cancelled |
| **Order.paymentStatus** | Unpaid, Pending, Paid, Refunded, Failed |
| **Order.paymentMethod** | None, Cash on Delivery, Bank Transfer, Card, WhatsApp |
| **Order.source** | Website, WhatsApp, Phone, CRM |
| **Inquiry.status** / **Lead.status** / **QuoteRequest.status** | New, Contacted, Quoted, Converted, Closed |
| **Inquiry.source** | WhatsApp Inquiry, Chatbot, Contact Form, Quote Request |
| **Lead.source** | Chatbot, WhatsApp Inquiry, Contact Form, Quote Request, Manual |
| **Quotation.status** | Draft, Sent, Approved, Rejected, Expired |
| **Product.availability** | In Stock, Low Stock, Out of Stock, On Request |
| **Product.stockStatus** / **Inventory stock status** | In Stock, Low Stock, Out Of Stock |
| **Product.status** | active, hidden, draft, archived |
| **Product.condition** | Brand New, Used, Refurbished, OEM Surplus |
| **StockMovement.type** | purchase, sale, adjustment, return, transfer_in, transfer_out, reservation, release, correction, bulk_import |
| **Notification.type** | New Order, New Inquiry, New Quote Request, Low Stock, Order Status, System |
| **Notification.severity** | info, warning, critical |
| **Notification.channels** | crm, email, whatsapp |
| **Banner.placement** | home-hero, home-strip, category-top, promo |
| **ContentPage.slug** | about, contact, terms, privacy, returns |
| **AuditLog.action** | create, update, delete, login, logout, status_change, bulk_import, export, role_change |
| **Brand.kind** | vehicle, part |
| **Address.country / serviceAreas** | United Arab Emirates, Saudi Arabia, Oman, Qatar, Kuwait, Bahrain (extensible) |

**Critical pricing rule (restated):** `price` and `costPrice` are nullable. `price == null` ⇒ `availability = "On Request"` and the product is **inquiry/quote-only** (excluded from direct checkout). A product with a non-null `price` participates in cart + direct checkout while still supporting WhatsApp inquiry and quote requests — all three purchase methods coexist per product.


---

## 2. REST API Design (Express + TypeScript)

### Spare Mec REST API — Architecture & Endpoint Reference

Express + TypeScript backend for the Spare Mec storefront + CRM. This document specifies every endpoint grouped by module, with method/path, required auth, query params, request/response shapes, and status codes.

#### Global Conventions

**Base URL & versioning**
- All endpoints are prefixed `/api/v1`. Paths below omit the prefix.
- Public storefront routes live under `/api/v1/...`; admin/CRM routes under `/api/v1/admin/...`. The `/admin` prefix is itself a coarse guard (requires a valid `AdminUser` access token) before per-route RBAC.

**Auth model (recap)**
- Two distinct token audiences: `customer` access tokens (storefront) and `admin` access tokens (CRM). They are not interchangeable; the middleware rejects a customer token on an `/admin/*` route and vice-versa (`aud` claim check).
- Access token: short-lived JWT (15 min), sent as `Authorization: Bearer <token>`.
- Refresh token: long-lived (30 d), delivered as an **httpOnly, Secure, SameSite=Strict cookie** (`sm_rt` for customers, `sm_admin_rt` for staff). Rotated on every refresh; the hash is stored in `Customer.refreshTokenHash` / `AdminUser.refreshTokenHash` for revocation.
- **Guest** = no token. Guest write actions (cart, inquiry, order, quote) are allowed per spec and identified by an opaque `X-Guest-Token` header (UUID minted client-side, also accepted as `sessionToken` in bodies).

**Auth/role column legend**
`public` (no auth, cacheable) · `guest` (no auth but mutating; guest-token aware) · `customer` (valid customer token) · `customer?` (optional — richer response if authed) · then the five staff roles: **Super Admin**, **Sales**, **Inventory**, **Marketing**, **Viewer**. Admin endpoints list the **minimum** permission key (from the static `ROLE_PERMISSIONS` map) rather than a role name where helpful, e.g. `product.write`. Super Admin implicitly satisfies every permission.

**Permission → endpoint mapping** uses the canonical permission keys: `product.read/write/delete`, `inventory.read/write`, `order.read/write`, `customer.read/write`, `lead.read/write`, `quotation.read/write`, `banner.write`, `content.write`, `faq.write`, `report.read`, `user.manage`, `settings.write`. Any `*.read` is granted to Viewer.

**Pagination (all list endpoints)**
Query params: `page` (default `1`, min `1`), `limit` (default `20`, max `100`), `sort` (field name; prefix `-` for desc, comma-separate for multi e.g. `-createdAt,name`). Standard envelope:
```jsonc
{
  "data": [ /* items */ ],
  "meta": { "page": 1, "limit": 20, "total": 1340, "totalPages": 67, "hasMore": true }
}
```
Cursor pagination is offered additionally on the two highest-cardinality, append-heavy reads (Product search, StockMovement) via `cursor`/`nextCursor` to stay performant past deep offsets at 50k+ scale; when `cursor` is supplied `page` is ignored.

**Money representation**
All money fields in requests and responses are **integers in fils** (AED ×100), matching the DB. A field is suffixed conceptually (`subtotal`, `unitPrice`, etc.) and always paired with `currency` (`"AED"`). Clients format for display. `costPrice`, `compareAtPrice`, and `taxRate` are stripped from any non-admin (customer/guest/public) response.

**Money / pricing visibility rule (load-bearing)**
A product with `price == null` serializes `price: null`, `availability: "On Request"`, and `checkoutEligible: false`. Such products are **rejected** from cart-checkout and order creation with `422 PRODUCT_NOT_PURCHASABLE` (they route to inquiry/quote instead). A priced product serializes `checkoutEligible: true`.

**Standard timestamps** — every resource returns `createdAt`, `updatedAt` (ISO 8601). Soft-deleted resources are excluded from default list/detail reads.

#### Error Format & Validation

**Validation approach** — every route is guarded by a **Zod schema** (params, query, body) in middleware. On failure it short-circuits to a `422` with a structured field list before any controller/DB work. Coercion (string→number for query params, fils normalization) happens inside the schema. ObjectId params are validated for shape before any query.

**Consistent error envelope** (every non-2xx):
```jsonc
{
  "error": {
    "code": "VALIDATION_ERROR",      // stable machine string, see table
    "message": "One or more fields are invalid.",
    "details": [                      // present for VALIDATION_ERROR only
      { "field": "email", "message": "Invalid email address" },
      { "field": "items.0.qty", "message": "Must be >= 1" }
    ],
    "requestId": "req_a1b2c3"         // correlates with server logs
  }
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON, bad ObjectId shape, unparseable query |
| 401 | `UNAUTHENTICATED` | Missing/expired/invalid access token |
| 401 | `TOKEN_EXPIRED` | Access token specifically expired (client should refresh) |
| 403 | `FORBIDDEN` | Authenticated but lacks the required permission/role/audience |
| 404 | `NOT_FOUND` | Resource missing or soft-deleted |
| 409 | `CONFLICT` | Unique-key clash (duplicate email, slug, SKU, order number) |
| 409 | `INVALID_STATE_TRANSITION` | Illegal status change (e.g. Delivered→New) |
| 422 | `VALIDATION_ERROR` | Zod validation failed (carries `details[]`) |
| 422 | `PRODUCT_NOT_PURCHASABLE` | On-Request (null-price) item in checkout/order |
| 422 | `INSUFFICIENT_STOCK` | Ordered qty exceeds available |
| 429 | `RATE_LIMITED` | Throttle exceeded (carries `Retry-After` header) |
| 500 | `INTERNAL_ERROR` | Unhandled; generic message, details logged not returned |

**Rate limiting** — applied via middleware, keyed by IP (+ guest token where present). Tiers below; every limited route returns `429 RATE_LIMITED` with `Retry-After` and `X-RateLimit-{Limit,Remaining,Reset}` headers. Routes flagged **🛡️ RL** in tables are rate-limited; unmarked admin routes rely on the authenticated-staff global cap.

| Tier | Routes | Limit |
|---|---|---|
| Auth-strict | login, register, refresh, forgot/reset password, OAuth | 10 / 15 min / IP |
| Public-search | product search/list, lookups, autocomplete | 60 / min / IP |
| Public-write | guest inquiry/quote/order/cart create, contact form, chatbot | 20 / min / IP+token |
| Authed-global | all customer + admin routes | 300 / min / principal |

---

### 1. Auth — `/auth` (customer) & `/admin/auth` (staff)

Customer and staff auth are separate route trees issuing separate token audiences. Shapes mirror each other; differences noted.

#### Customer auth — `/auth`

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| POST | `/auth/register` | public | Create local Customer (email+password) | RL |
| POST | `/auth/login` | public | Email+password login | RL |
| POST | `/auth/google` | public | Google OAuth sign-in / sign-up | RL |
| POST | `/auth/refresh` | guest (cookie) | Rotate refresh → new access | RL |
| POST | `/auth/logout` | customer | Revoke refresh token, clear cookie | — |
| GET | `/auth/me` | customer | Current customer profile + counts | — |
| POST | `/auth/forgot-password` | public | Send reset email | RL |
| POST | `/auth/reset-password` | public | Reset via emailed token | RL |
| POST | `/auth/verify-email` | public | Confirm email via token | RL |

**POST `/auth/register`** — body `{ name, email, password, phone?, marketingOptIn? }`. On success creates Customer (`authProvider:"local"`, `emailVerified:false`), sets refresh cookie. **Merge hook:** if `X-Guest-Token` present, merges the guest's server cart/wishlist (or accepts `mergeCart`/`mergeWishlist` arrays in body) into the new account.
- `201` → `{ accessToken, expiresIn, customer: { id, name, email, emailVerified, authProvider } }`
- `409 CONFLICT` (email taken), `422 VALIDATION_ERROR` (weak password / bad email).

**POST `/auth/login`** — body `{ email, password, guestToken? }`. `200` → same shape as register; updates `lastLoginAt`; merges guest cart/wishlist if token supplied. `401 UNAUTHENTICATED` (bad creds — deliberately not distinguishing missing vs wrong password). `403 FORBIDDEN` if `isActive:false`.

**POST `/auth/google`** — body `{ idToken }` (Google ID token from client). Server verifies signature/`aud`, extracts `sub`→`googleId`, `email`, `name`. Upserts: existing `googleId` → login; matching email + local account → links `googleId` (sets `authProvider` stays `local`, adds googleId) ; else creates `authProvider:"google"` Customer with `emailVerified:true`. `200`/`201` → standard token payload. `401` if token invalid/expired.

**POST `/auth/refresh`** — reads `sm_rt` cookie (no body). Verifies hash matches `refreshTokenHash`, rotates (issues new refresh cookie + access). `200` → `{ accessToken, expiresIn }`. `401 UNAUTHENTICATED` if cookie missing/invalid/revoked (forces re-login).

**POST `/auth/logout`** — clears `refreshTokenHash`, expires cookie. `204` no content.

**GET `/auth/me`** — `200` → `{ customer: { id, name, email, phone, emailVerified, authProvider, marketingOptIn, defaultAddress, vehicles[] }, counts: { orders, wishlist, inquiries, quoteRequests } }`. `401` if unauth.

#### Staff auth — `/admin/auth`

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| POST | `/admin/auth/login` | public | Staff login (email+password) | RL |
| POST | `/admin/auth/refresh` | guest (cookie) | Rotate staff refresh | RL |
| POST | `/admin/auth/logout` | admin (any) | Revoke staff refresh | — |
| GET | `/admin/auth/me` | admin (any) | Current staff identity + resolved permissions | — |

No staff self-registration (accounts seeded/provisioned via User Management). **GET `/admin/auth/me`** `200` → `{ user: { id, name, email, role, avatar }, permissions: ["product.read", ...] }` — the resolved permission set (role map ± `permissionOverrides`) so the CRM can hide/show UI. `login` writes an `AuditLog{action:"login"}`.

---

### 2. Products — `/products` (public) & `/admin/products`

#### Public product reads

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| GET | `/products` | public, `customer?` | Catalogue listing + filters | RL |
| GET | `/products/search` | public, `customer?` | **Unified search** (see §2.1) | RL |
| GET | `/products/autocomplete` | public | Typeahead suggestions | RL |
| GET | `/products/:slug` | public, `customer?` | Product detail page payload | RL |
| GET | `/products/:slug/related` | public | Related + similar + FBT sets | RL |
| POST | `/products/:slug/view` | public, `customer?` | Increment view; record Recently Viewed (authed) | RL |
| GET | `/products/featured` | public | Homepage featured | RL |
| GET | `/products/trending` | public | Homepage trending | RL |

**`customer?`** difference for all product reads: identical product payload, **plus** when authed each product gains `inWishlist: boolean` (resolved against the user's Wishlist). No pricing differs by auth — pricing visibility is a function of `price == null`, not of who is asking; `costPrice`/`compareAtPrice`/`taxRate` are never in any public/customer payload regardless of auth.

**GET `/products`** — query: `category`, `subcategory`, `brand` (slug or id), `featured`, `trending`, `condition`, `availability`, `inStock` (bool → excludes Out of Stock), `priceMin`, `priceMax` (fils; implicitly excludes null-price unless `includeOnRequest=true`), `sort` (`newest|price_asc|price_desc|name|popular`; default `newest`), `page`, `limit`. Returns paginated **list cards** (lean projection): `{ id, slug, name, partNumber, oemNumber, sku, brandName, categoryName, availability, price, currency, compareAtPrice:`omitted`, primaryImage, condition, warranty, featured, trending, checkoutEligible, inWishlist? }`. Plus `meta.facets` (counts per brand/category/availability/condition) for filter sidebars when `facets=true`.
- `200` envelope; `422` on bad enum/number params.

**GET `/products/:slug`** — full detail payload:
```jsonc
{
  "data": {
    "id","slug","name","partNumber","oemNumber","sku","altPartNumbers":[],
    "brand": { "id","name","slug","logo" }, "brandName",
    "category": { "id","name","slug" }, "subcategory": { "id","name","slug" },
    "productType","productFamily","condition",
    "price": null, "currency":"AED", "availability":"On Request", "checkoutEligible": false,
    "stockStatus":"In Stock", "warranty",
    "shortDescription","description","highlights":[],
    "specs":[{ "label","value" }],
    "material","weight":{ "value","unit" }, "dimensions":{ "length","width","height","unit" },
    "countryOfOrigin",
    "fitment":[{ "makeName","modelName","generationCode","engineType","yearStart","yearEnd","position","note","isVerified" }],
    "images":[{ "url","alt","sortOrder","isPrimary" }], "primaryImage":{ "url","alt" },
    "tags":[], "ratingAvg", "viewCount", "inWishlist": false
  }
}
```
`404 NOT_FOUND` if missing, soft-deleted, or `status != active` (hidden/draft/archived are invisible publicly).

**GET `/products/:slug/related`** — `200` → `{ related:[card], similar:[card], frequentlyBoughtTogether:[card], recentlyViewed:[card] }`. `related` = curated `relatedProducts` ∪ same-subcategory fallback; `similar` = same category, different brand or fitment overlap; `frequentlyBoughtTogether` = curated `frequentlyBoughtWith`; `recentlyViewed` echoes client-supplied `?slugs=` (guests) or the server RecentlyViewed (authed).

**POST `/products/:slug/view`** — fire-and-forget; `$inc viewCount`; if authed pushes onto RecentlyViewed (`$slice:-20`). `202` accepted (empty). Rate-limited to dampen abuse of the counter.

#### 2.1 PUBLIC SEARCH — `GET /products/search` (detailed)

The core discovery endpoint. Supports exact identifier paste, vehicle phrases, and faceted filtering against the dual-layer index strategy (normalized `searchTokens` for codes; weighted text index for phrases).

**Auth:** `public` (cacheable per query for ~60 s), `customer?` adds `inWishlist`. 🛡️ Public-search rate tier.

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `q` | string | Free text. Routed intelligently (see resolution below). e.g. `"Engine Mount Mercedes"`, `"BMW E90 Control Arm"` |
| `partNumber` | string | Exact/prefix; normalized (uppercase, strip space/dash) → matched against `searchTokens`+`partNumber`+`altPartNumbers` |
| `oem` | string | Same normalization → `oemNumber` |
| `sku` | string | Exact → `sku` |
| `brand` | string | Part brand slug or id (repeatable / CSV for multi) |
| `vehicleMake` | string | Make slug/id/name → Fitment join |
| `vehicleModel` | string | Model slug/id/name → Fitment join |
| `vehicleGeneration` | string | Chassis code e.g. `E90` → Fitment |
| `vehicleYear` | int | Year-range overlap on Fitment (`yearStart<=y AND (yearEnd>=y OR null)`) |
| `category` | string | slug/id |
| `subcategory` | string | slug/id |
| `availability` | enum CSV | `In Stock,Low Stock,Out of Stock,On Request` |
| `condition` | enum CSV | `Brand New,Used,…` |
| `priceMin`/`priceMax` | int (fils) | Range; null-price excluded unless `includeOnRequest=true` |
| `includeOnRequest` | bool | default `true`; set `false` to show only checkout-eligible |
| `inStock` | bool | shorthand excluding Out of Stock |
| `sort` | enum | `relevance`(default when `q`)`,newest,price_asc,price_desc,popular,name` |
| `page`/`limit`/`cursor` | — | Standard pagination; `cursor` for deep scroll |
| `facets` | bool | default `true` — include aggregated facet counts |

**Query resolution order** (first productive layer wins, results unioned by relevance):
1. If `partNumber`/`oem`/`sku` provided, or `q` matches an identifier pattern (alphanumeric, length ≥ 5, no spaces e.g. `A4602407018`): **identifier lookup** on `searchTokens`/`partNumber`/`oemNumber`/`sku`/`altPartNumbers`. Returns near-instant, highest confidence.
2. Vehicle params (`vehicleMake/Model/Generation/Year`) → **Fitment collection** filter → product id set, intersected with other filters.
3. Remaining `q` text → **weighted `$text`** search (`name:10, brandName:6, fitment.modelName:5, fitment.generationCode:5, tags:3, description:1`), feeding `relevance` sort via `$meta:"textScore"`.
4. Pure-filter requests (no `q`/identifiers) → indexed facet query, default sort `newest`.

All paths additionally enforce `status:"active"`, `isDeleted:false`.

**Response** — `200`:
```jsonc
{
  "data": [ /* product list cards (same projection as GET /products) */ ],
  "meta": {
    "page": 1, "limit": 20, "total": 87, "totalPages": 5, "hasMore": true,
    "nextCursor": "eyJfaWQiOiI2NWY...",       // when cursor mode
    "query": { "q":"BMW E90 Control Arm", "resolvedVia":"fitment+text", "normalizedCode": null },
    "facets": {
      "brand":[{ "slug":"bmw","name":"BMW","count":42 }],
      "category":[{ "slug":"suspension","count":31 }],
      "availability":[{ "value":"In Stock","count":58 }],
      "condition":[{ "value":"Brand New","count":74 }],
      "priceRange":{ "min":1500,"max":480000 }
    },
    "suggestions": []   // populated only when total==0 ("did you mean", alt part numbers)
  }
}
```
`200` with empty `data` (never 404) for no matches; `422` for malformed enums/numbers. **Guest vs authed:** payloads are byte-identical except authed responses set `inWishlist` per card; pricing/facets/sorting are auth-independent.

**GET `/products/autocomplete`** — `?q=` (min 2 chars), `?limit=`(max 10). Returns lightweight mixed suggestions for the search box: `{ products:[{ slug, name, partNumber, primaryImage }], brands:[{slug,name}], categories:[{slug,name}] }`. Cached; `200` only.

#### Admin product CRUD — `/admin/products`

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/products` | `product.read` | Admin listing (all statuses, incl. hidden/draft) + cost data |
| GET | `/admin/products/:id` | `product.read` | Full admin product (incl. `costPrice`, `compareAtPrice`, `taxRate`, audit fields) |
| POST | `/admin/products` | `product.write` | Create product |
| PUT | `/admin/products/:id` | `product.write` | Full update |
| PATCH | `/admin/products/:id` | `product.write` | Partial update (price, stock, flags) |
| PATCH | `/admin/products/:id/status` | `product.write` | Hide / activate / draft / archive |
| DELETE | `/admin/products/:id` | `product.delete` | Soft delete (default) — `?hard=true` Super Admin only |
| POST | `/admin/products/:id/images` | `product.write` | Upload image(s) → Cloudinary |
| PATCH | `/admin/products/:id/images/reorder` | `product.write` | Reorder / set primary |
| PUT | `/admin/products/:id/images/:imageId` | `product.write` | Replace one image |
| DELETE | `/admin/products/:id/images/:imageId` | `product.write` | Remove one image |
| POST | `/admin/products/import` | `product.write` | Bulk Excel import (create+update) |
| POST | `/admin/products/import/validate` | `product.write` | Dry-run validation, returns errors only |
| GET | `/admin/products/import/template` | `product.read` | Download `.xlsx` template |
| GET | `/admin/products/export` | `report.read`/`product.read` | Export catalogue (xlsx/csv) |

**GET `/admin/products`** — admin query superset of public list **plus** `status` (CSV incl. `hidden,draft,archived`), `includeDeleted`, `lowStock` (bool), `q` (admin search reuses §2.1 engine), `brand`, `category`. Returns admin cards including `costPrice`, `stockQuantity`, `lowStockThreshold`, `status`, `externalId`, `salesCount`, `updatedAt`.

**POST `/admin/products`** — body covers the full Product Management form:
```jsonc
{
  "name","slug?", "partNumber?","oemNumber?","sku?","altPartNumbers?":[],
  "brand?": "<brandId>", "category":"<categoryId>", "subcategory?":"<subcatId>",
  "productType?","productFamily?","type?","condition?",
  "price?": null|int, "costPrice?": null|int, "compareAtPrice?": int, "taxRate?": 5,
  "stockQuantity?": 0, "lowStockThreshold?": 5,
  "warranty?","shortDescription?","description?",
  "highlights?":[], "specs?":[{ "label","value" }],
  "material?","weight?":{ "value","unit" }, "dimensions?":{ "length","width","height","unit" },
  "countryOfOrigin?",
  "fitment?":[{ "make?","model?","generation?","makeName?","modelName?","generationCode?","engineType?","yearStart?","yearEnd?","position?","note?","isVerified?" }],
  "frequentlyBoughtWith?":[id], "relatedProducts?":[id], "tags?":[], "featured?","trending?",
  "status?":"active"|"draft"
}
```
Server: auto-slugs from name if absent (collision → `409`), derives `searchTokens` (normalized codes), computes `availability`/`stockStatus`/`isActive`, denormalizes `brandName`/`categoryName`, syncs the **Fitment collection** from `fitment[]`, seeds default-warehouse Inventory from `stockQuantity` (+ a `StockMovement{type:"adjustment"}`), recomputes `Category.productCount`, writes `AuditLog{action:"create"}`. `201` → full admin product. `409` (slug/sku dup), `422` (validation).

**PATCH `/admin/products/:id`** — partial; price/stock changes re-run availability computation and (for stock) write a StockMovement + may emit a Low Stock Notification. `200`.

**PATCH `/admin/products/:id/status`** — body `{ status: "hidden"|"active"|"draft"|"archived" }`. Sets `isActive` accordingly, `AuditLog{action:"status_change"}`. `200`. `409 INVALID_STATE_TRANSITION` if archiving a product on open orders is disallowed by policy.

**DELETE `/admin/products/:id`** — soft delete (`isDeleted:true`,`deletedAt`), removes from catalogue, decrements `Category.productCount`. `?hard=true` (Super Admin) purges doc + Cloudinary images + Fitment rows. `200` `{ deleted:true }`. `404` if absent.

**Image endpoints** — `multipart/form-data`. Upload: field `images[]` (≤ 20, jpg/png/webp, ≤ 5 MB each) → Cloudinary `spare-mec/products/<id>`; appends `ProductImage` subdocs with `sortOrder`, sets `primaryImage` if first. `201` → updated `images[]`. Reorder: `{ order: [{ imageId, sortOrder }], primaryImageId }` → `200`. Replace: new file, reuses slot, deletes old Cloudinary asset by `publicId` → `200`. Delete: removes subdoc + Cloudinary asset; if it was primary, promotes next → `200`. All write `AuditLog{action:"update"}`. `422` on bad mime/size; `404` on missing image.

**Bulk import** — `POST /admin/products/import` `multipart` field `file` (`.xlsx`). Columns (per spec): `Product ID, Product Name, Category, Subcategory, Brand, Product Type, SKU, Part Number, OEM Number, Price, Stock Quantity, Warranty, Description, Vehicle Fitment`. Process: parse → per-row Zod validate → resolve Category/Subcategory/Brand by name (auto-create optional via `?createMissingRefs=true`) → **upsert keyed on `externalId` (Product ID)** else SKU/partNumber → create new / update existing → for stock deltas write `StockMovement{type:"bulk_import"}` → `AuditLog{action:"bulk_import"}`. Response `200`:
```jsonc
{ "summary": { "total":500, "created":120, "updated":360, "skipped":20, "failed":0 },
  "errors": [ { "row":42, "column":"Price", "value":"abc", "message":"Not a number" } ] }
```
`/import/validate` runs the same pipeline **without writes**, returning only `summary`+`errors` (`200`) so the UI can preview. `/import/template` streams the canonical `.xlsx` with headers + one example row (`200`, `Content-Disposition: attachment`). Large files processed via a job; if async, returns `202 { jobId }` and progress is polled at `GET /admin/jobs/:jobId`.

---

### 3. Categories — `/categories` & `/admin/categories`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/categories` | public | Active categories (homepage/nav), `?withCounts=true` |
| GET | `/categories/:slug` | public | Category detail + its subcategories |
| GET | `/admin/categories` | `product.read` | All categories incl. inactive |
| POST | `/admin/categories` | `product.write` | Create (name, slug, icon, tagline, displayOrder) |
| PUT | `/admin/categories/:id` | `product.write` | Update |
| PATCH | `/admin/categories/:id` | `product.write` | Toggle `isActive` / reorder |
| DELETE | `/admin/categories/:id` | `product.delete` | Delete — `409` if non-empty unless `?reassignTo=` |
| POST | `/admin/categories/:id/icon` | `product.write` | Upload Cloudinary icon |

**GET `/categories`** `200` → `[{ id, name, slug, icon, tagline, description, displayOrder, productCount }]`, sorted by `displayOrder`. **POST** auto-slugs, `409` on dup slug. **DELETE** guarded: refuses if `productCount>0` unless `reassignTo` (moves products) supplied. Icon upload mirrors product images (single file). All writes recompute nothing but `AuditLog`.

---

### 4. Subcategories — `/subcategories` & `/admin/subcategories`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/subcategories` | public | `?category=<id\|slug>` required-ish filter |
| GET | `/subcategories/:id` | public | Detail |
| GET | `/admin/subcategories` | `product.read` | All, filter by category |
| POST | `/admin/subcategories` | `product.write` | Create `{ name, slug?, category, description?, displayOrder? }` |
| PUT | `/admin/subcategories/:id` | `product.write` | Update |
| PATCH | `/admin/subcategories/:id` | `product.write` | Toggle/reorder |
| DELETE | `/admin/subcategories/:id` | `product.delete` | Delete — `409` if products reference it |

Compound-unique `{category,slug}` → `409 CONFLICT` on clash within a category. `200`/`201`/`204` standard.

---

### 5. Brands — `/brands` & `/admin/brands`

Single Brand collection serving part brands and vehicle makes (`kind` flag).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/brands` | public | `?kind=part\|vehicle` filter; active only |
| GET | `/brands/:slug` | public | Detail |
| GET | `/admin/brands` | `product.read` | All incl. inactive |
| POST | `/admin/brands` | `product.write` | Create `{ name, slug?, kind:[…], country?, displayOrder? }` |
| PUT | `/admin/brands/:id` | `product.write` | Update |
| PATCH | `/admin/brands/:id` | `product.write` | Toggle active / reorder |
| DELETE | `/admin/brands/:id` | `product.delete` | `409` if referenced by products/models |
| POST | `/admin/brands/:id/logo` | `product.write` | Upload Cloudinary logo |

`200` → `[{ id, name, slug, kind, logo, country, displayOrder }]`. `409` on dup slug or when in use.

---

### 6. Vehicle Taxonomy & Fitment — `/vehicles` & `/admin/vehicles`

Cascading make → model → generation → year for fitment pickers and search. Makes are Brands with `kind` ⊇ `vehicle`.

#### Public cascading lookups (cacheable, RL public-search)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/vehicles/makes` | public | All vehicle makes (`Brand` where kind∋vehicle) |
| GET | `/vehicles/makes/:makeId/models` | public | Models for a make |
| GET | `/vehicles/models/:modelId/generations` | public | Generations for a model |
| GET | `/vehicles/generations/:genId/years` | public | Derived year list (`yearStart..yearEnd`) |
| GET | `/vehicles/generations/:genId/engines` | public | Curated `engineTypes[]` for the generation |
| GET | `/products/by-fitment` | public | Products fitting a vehicle selection |

**Cascade contract:** each step returns `{ id, name, slug, code?, yearStart?, yearEnd? }` lists scoped to the parent. `/years` expands a generation's range into discrete years (or returns `{ yearStart, yearEnd }` when open-ended `yearEnd:null`). **GET `/products/by-fitment`** params `make, model?, generation?, year?, engineType?` + standard pagination → product cards, querying the Fitment collection with the year-overlap rule. `404` if a parent id is unknown.

#### Admin vehicle/fitment management

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | `/admin/vehicles/models` | `product.write` | Create model `{ make, name, slug? }` |
| PUT/PATCH/DELETE | `/admin/vehicles/models/:id` | `product.write`/`delete` | Update/remove |
| POST | `/admin/vehicles/generations` | `product.write` | Create generation `{ model, make, code, name?, yearStart?, yearEnd?, engineTypes? }` |
| PUT/PATCH/DELETE | `/admin/vehicles/generations/:id` | `product.write`/`delete` | Update/remove |
| GET | `/admin/fitments` | `product.read` | List fitment rows (`?product=`,`?make=`,`?generationCode=`) |
| POST | `/admin/fitments` | `product.write` | Add a Fitment row to a product (also syncs embedded copy) |
| PUT/DELETE | `/admin/fitments/:id` | `product.write` | Edit/remove fitment row |

Fitment writes keep the Fitment collection (source of truth) and `Product.fitment[]` embedded copy in sync, denormalizing `makeName/modelName/generationCode`. `409` on duplicate `{model,code}`.

---

### 7. Inventory — `/admin/inventory` (staff only — no public)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/inventory` | `inventory.read` | Stock levels across products/warehouses |
| GET | `/admin/inventory/low-stock` | `inventory.read` | Low/Out-of-stock list (alerts) |
| GET | `/admin/inventory/product/:productId` | `inventory.read` | Per-product levels by warehouse |
| PATCH | `/admin/inventory/:inventoryId` | `inventory.write` | Set/adjust stock (writes movement) |
| POST | `/admin/inventory/adjust` | `inventory.write` | Adjust by product+warehouse delta |
| POST | `/admin/inventory/transfer` | `inventory.write` | Transfer between warehouses |
| GET | `/admin/inventory/movements` | `inventory.read` | StockMovement audit feed |
| GET | `/admin/warehouses` | `inventory.read` | List warehouses |
| POST/PUT/PATCH | `/admin/warehouses[/:id]` | `inventory.write` | Manage warehouses (one default enforced) |

**GET `/admin/inventory`** — query `warehouse`, `q` (product name/sku), `status` (`In Stock|Low Stock|Out Of Stock`), `lowStockOnly`, pagination. Row: `{ inventoryId, product:{id,name,sku,primaryImage}, warehouse:{id,code}, quantity, reserved, available, lowStockThreshold, stockStatus, binLocation, lastCountedAt }`.

**PATCH `/admin/inventory/:inventoryId`** — body `{ mode:"set"|"delta", value:int, reason?, type? }`. Recomputes `available`, updates `Product.stockQuantity`/`availability` (if default warehouse), **appends StockMovement** (`quantityBefore/After`, `performedBy`), emits **Low Stock Notification** if it crosses threshold. `200` → updated row. `422 VALIDATION_ERROR` if a `set` would make quantity negative.

**POST `/admin/inventory/transfer`** — `{ product, fromWarehouse, toWarehouse, quantity, reason? }` → two movements (`transfer_out`/`transfer_in`). `422 INSUFFICIENT_STOCK`. **GET `/admin/inventory/movements`** — `?product=`,`?warehouse=`,`?type=`,`?from=&to=` (date range), **cursor** pagination (append-heavy). Append-only feed.

**GET `/admin/inventory/low-stock`** — drives alerts; `available <= threshold`. `200` list ordered by severity (Out of Stock first).

---

### 8. Cart — `/cart`

Server cart for logged-in customers; guests may use a server cart keyed by `X-Guest-Token` (or stay fully client-side). On login the guest cart merges into the customer cart.

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| GET | `/cart` | guest \| customer | Get current cart (token or user) | — |
| POST | `/cart/items` | guest \| customer | Add item `{ productId, qty }` | RL |
| PATCH | `/cart/items/:productId` | guest \| customer | Set qty | — |
| DELETE | `/cart/items/:productId` | guest \| customer | Remove item | — |
| DELETE | `/cart` | guest \| customer | Clear cart | — |
| POST | `/cart/merge` | customer | Merge a guest cart into user cart | RL |

**Identity resolution:** if a customer token is present → that customer's cart; else if `X-Guest-Token` → anonymous cart (`sessionToken`); else a transient cart echoed back (client persists locally). **POST `/cart/items`** snapshots `name, slug, partNumber, brandName, primaryImage, unitPrice` (fils, nullable), sets `isOnRequest = price==null`. On-Request items are **allowed in cart** but flagged; they cannot proceed to checkout. `200/201` → full cart:
```jsonc
{ "data": { "id", "currency":"AED",
  "items":[{ "product","slug","name","partNumber","brandName","primaryImage","unitPrice","qty","isOnRequest","lineTotal" }],
  "summary": { "itemCount", "checkoutEligibleCount", "onRequestCount", "subtotal", "hasOnRequestItems": true } } }
```
**POST `/cart/merge`** — body `{ guestToken }` (or items array); unions, summing qty for shared products, re-validating prices. `200`. `404` if guest cart unknown (treated as no-op merge). `422` if a product was deleted/hidden since add (item dropped with a notice in `summary.warnings`).

---

### 9. Wishlist — `/wishlist`

Server wishlist for logged-in customers (one doc, embedded items). Guests use client `WishlistContext`, merged on login.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/wishlist` | customer | Get wishlist (populated product cards) |
| POST | `/wishlist/items` | customer | Add `{ productId }` |
| DELETE | `/wishlist/items/:productId` | customer | Remove |
| POST | `/wishlist/toggle` | customer | Toggle `{ productId }` (matches storefront UX) |
| POST | `/wishlist/merge` | customer | Merge guest wishlist `{ slugs:[] }` on login |
| DELETE | `/wishlist` | customer | Clear |

`200` → `{ data: { items: [productCard + { addedAt }] , count } }`. `toggle` returns `{ inWishlist:boolean, count }`. Add is idempotent (`200` even if present). `merge` resolves slugs → product ids, skipping unknown.

---

### 10. Addresses — `/addresses` (customer)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/addresses` | customer | List own addresses |
| POST | `/addresses` | customer | Create `{ contactName, phone, line1, line2?, area?, city, emirate?, country?, label?, isDefault? }` |
| PUT | `/addresses/:id` | customer | Update |
| DELETE | `/addresses/:id` | customer | Delete (cannot delete last default unless reassigned) |
| PATCH | `/addresses/:id/default` | customer | Set as default |

All scoped to `req.customer._id` (ownership enforced → `404` not `403` for foreign ids, to avoid enumeration). Setting default unsets the prior default and updates `Customer.defaultAddress`. `country` defaults `"United Arab Emirates"`. `201/200/204`.

---

### 11. Orders — `/orders` (guest+customer) & `/admin/orders`

#### Storefront orders

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| POST | `/orders` | guest \| customer | **Direct checkout** — create order | RL |
| GET | `/orders` | customer | Own order history | — |
| GET | `/orders/:orderNumber` | customer \| guest(token) | Order detail / tracking | RL |

**POST `/orders`** — the Direct Checkout method. **Min required: `customerName`** (guest allowed); payment not mandatory. Body:
```jsonc
{
  "customerName": "…",                 // required
  "customerPhone?": "…", "customerEmail?": "…",
  "items": [{ "productId", "qty" }],   // OR omit to use server cart (guestToken/customer)
  "useCart?": true,
  "shippingAddress?": { "contactName","phone","line1","line2?","area?","city","emirate?","country?" },
  "vehicle?": { "brand","model?","year?","generation?","engineType?","vin?" },
  "paymentMethod?": "None|Cash on Delivery|Bank Transfer|WhatsApp",
  "notes?": "…", "guestToken?": "…"
}
```
Server: loads items (body or cart), **rejects any null-price item → `422 PRODUCT_NOT_PURCHASABLE`** (listing offending slugs), re-validates `unitPrice` from DB, checks Inventory (`422 INSUFFICIENT_STOCK` if short), snapshots OrderItems + address, computes `subtotal/taxTotal/grandTotal` (fils), generates `orderNumber` via Counter (`SM-O-2026-00042`), sets `status:"New"` then transitions to **`Pending Verification`** per spec, **reserves stock** (Inventory `reserved += qty`, StockMovement `type:"reservation"`), links `customer` if authed (`isGuest:true` otherwise), clears the cart, emits **New Order Notification** (CRM + sales email/WhatsApp), sends customer confirmation (if email/phone given). `201` →
```jsonc
{ "data": { "orderNumber","status":"Pending Verification","grandTotal","currency",
  "items":[…], "createdAt", "trackingUrl":"/orders/SM-O-2026-00042" } }
```
**GET `/orders`** (customer) — own orders, `?status=`, pagination, sort `-createdAt`. Cards: `{ orderNumber, status, grandTotal, currency, itemCount, createdAt }`. **GET `/orders/:orderNumber`** — full detail; customer must own it, **or** a guest may fetch with the matching `X-Guest-Token`/`?email=` used at creation (lightweight tracking) → `404` otherwise. Returns items, status, `statusHistory` (customer-visible subset), address, totals.

#### Admin orders

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/orders` | `order.read` | List/filter all orders |
| GET | `/admin/orders/:id` | `order.read` | Full order + customer detail |
| POST | `/admin/orders` | `order.write` | Create order in CRM (phone/walk-in) |
| PATCH | `/admin/orders/:id/status` | `order.write` | Update status (validated transitions) |
| PATCH | `/admin/orders/:id/payment` | `order.write` | Update payment status/method |
| POST | `/admin/orders/:id/notes` | `order.write` | Append internal note |
| PATCH | `/admin/orders/:id` | `order.write` | Edit address/vehicle/items (pre-dispatch) |
| POST | `/admin/orders/:id/cancel` | `order.write` | Cancel (releases reserved stock) |
| GET | `/admin/orders/export` | `report.read` | Export (xlsx/csv/pdf) |

**GET `/admin/orders`** — query: `status` (CSV of the 8 statuses), `paymentStatus`, `source`, `customer`, `q` (orderNumber/customerName/phone/email), `from`/`to` (date), `minTotal`/`maxTotal`, pagination, sort `-createdAt`. Rows include customer snapshot, totals, status, age. **PATCH `…/status`** — body `{ status, note? }`; validates against an allowed-transition map (e.g. `Pending Verification→Confirmed→Processing→Ready For Dispatch→Shipped→Delivered`; `Cancelled` from any non-terminal). On `Confirmed` converts reservation→`sale` movement (commits stock); on `Cancelled` releases reservation (`type:"release"`), decrements as needed; sets milestone timestamps (`confirmedAt`/`shippedAt`/…); appends `statusHistory`; emits **Order Status Notification**; `AuditLog{action:"status_change"}`. `200`; `409 INVALID_STATE_TRANSITION` for illegal jumps. **Notes** append `{ text, by, at }` → `201`.

---

### 12. Inquiries — `/inquiries` (guest create) & `/admin/inquiries`

Unified store for WhatsApp / Chatbot / Contact Form / Quote Request sources.

#### Storefront inquiry creation

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| POST | `/inquiries/whatsapp` | guest \| customer? | WhatsApp inquiry — saves copy **and** returns `wa.me` link | RL |
| POST | `/inquiries/contact` | guest \| customer? | Contact-form submission | RL |
| POST | `/inquiries/chatbot` | guest \| customer? | Chatbot/assistant lead (also creates a Lead) | RL |
| GET | `/inquiries/mine` | customer | Customer's own inquiry history |

**POST `/inquiries/whatsapp`** — implements purchase-method (1). **Required: `customerName`**; optional `phone, email, vehicle{brand,model,year,generation,engineType,vin}, partNumber, items[], quantity, notes, pageUrl`. Item shape mirrors the storefront InquiryContext: `{ slug?, productId?, name, partNumber?, brand?, qty }`. Server builds the formatted WhatsApp message (same template as `src/utils/whatsapp.js`), generates `whatsappLink` to the company number (from Settings, `971507855298`), persists an **Inquiry** (`source:"WhatsApp Inquiry"`, `status:"New"`, stores `whatsappMessage`+`whatsappLink`), assigns `inquiryNumber` (Counter), links `customer` if authed, emits **New Inquiry Notification**. `201` →
```jsonc
{ "data": { "inquiryNumber":"SM-INQ-2026-000123", "whatsappLink":"https://wa.me/971507855298?text=…", "whatsappMessage":"…" } }
```
The client then opens `whatsappLink`. **POST `/inquiries/contact`** — `{ customerName(req), email?, phone?, subject?, notes(message), pageUrl? }` → Inquiry `source:"Contact Form"`. `201`. **POST `/inquiries/chatbot`** — multi-step result `{ customerName(req), phone?, vehicle{brand,model,year}, partRequired?, notes? }` → creates Inquiry `source:"Chatbot"` **and** a linked **Lead** (`source:"Chatbot"`, `slaDueAt = now+1h`); `201` → `{ inquiryNumber, leadId, message:"Thank you. Our sales team will contact you within 1 hour." }`. **GET `/inquiries/mine`** — authed customer's inquiries (`customer` link), pagination. `422` if required `customerName` missing on any create.

#### Admin inquiries

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/inquiries` | `lead.read` | List all inquiries |
| GET | `/admin/inquiries/:id` | `lead.read` | Detail |
| PATCH | `/admin/inquiries/:id/status` | `lead.write` | Update status (New→…→Closed) |
| PATCH | `/admin/inquiries/:id/assign` | `lead.write` | Assign to a sales user |
| POST | `/admin/inquiries/:id/convert` | `lead.write` | Convert → Order or Quotation |
| POST | `/admin/inquiries` | `lead.write` | Manually log an inquiry |

**GET `/admin/inquiries`** — query: `source` (4 sources), `status` (5 statuses), `assignedTo`, `q` (name/phone/partNumber), `from`/`to`, pagination, sort `-createdAt`. **PATCH `…/status`** sets funnel timestamps (`contactedAt`/`quotedAt`/…). **convert** links `convertedOrder`/`convertedQuotation`. `200`.

#### Leads — `/admin/leads`

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/leads` | `lead.read` | Pipeline list (`?status=`,`?assignedTo=`,`?overdueSla=`) |
| GET | `/admin/leads/:id` | `lead.read` | Detail |
| POST | `/admin/leads` | `lead.write` | Create lead |
| PATCH | `/admin/leads/:id` | `lead.write` | Update / status / assign |
| DELETE | `/admin/leads/:id` | `lead.write` | Remove |

`overdueSla=true` filters `slaDueAt < now AND status="New"` for the 1-hour SLA dashboard. Leads are a separate dashboard count from Inquiries per spec.

---

### 13. Quote Requests & Quotations

#### Quote Requests — `/quote-requests` (storefront) & `/admin/quote-requests`

Purchase method (3): name, mobile, vehicle, qty, notes → saved to CRM (also mirrored into Inquiry).

| Method | Path | Auth | Purpose | 🛡️ |
|---|---|---|---|---|
| POST | `/quote-requests` | guest \| customer? | Request a quote | RL |
| GET | `/quote-requests/mine` | customer | Own quote requests |
| GET | `/admin/quote-requests` | `quotation.read` | List all |
| GET | `/admin/quote-requests/:id` | `quotation.read` | Detail |
| PATCH | `/admin/quote-requests/:id/status` | `quotation.write` | Update status |
| PATCH | `/admin/quote-requests/:id/assign` | `quotation.write` | Assign |

**POST `/quote-requests`** — **required `customerName`, `mobile`**; optional `email, vehicle{…}, items[], quantity, notes`. Generates `requestNumber` (Counter), `status:"New"`, **also writes an Inquiry** (`source:"Quote Request"`, linked via `inquiry`) so unified lists/counts stay consistent, emits **New Quote Request Notification**. `201` → `{ requestNumber, status:"New" }`. `422` if name/mobile missing.

#### Quotations — `/admin/quotations` (staff-produced priced quotes)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/quotations` | `quotation.read` | List/filter |
| GET | `/admin/quotations/:id` | `quotation.read` | Detail |
| POST | `/admin/quotations` | `quotation.write` | Create (Draft) |
| PUT | `/admin/quotations/:id` | `quotation.write` | Edit (Draft only) |
| PATCH | `/admin/quotations/:id/status` | `quotation.write` | Draft→Sent→Approved/Rejected/Expired |
| POST | `/admin/quotations/:id/send` | `quotation.write` | Generate PDF + email/WhatsApp customer |
| POST | `/admin/quotations/:id/convert` | `quotation.write` + `order.write` | Approved → Order |
| GET | `/admin/quotations/:id/pdf` | `quotation.read` | Download/stream PDF |
| GET | `/quotations/:quotationNumber/public` | public (signed token) | Customer-facing view via emailed link 🛡️ RL |

**POST `/admin/quotations`** — body `{ customerName, phone?, email?, customer?, vehicle?, items:[{ productId?, name, partNumber?, oemNumber?, sku?, brandName?, qty, unitPrice(fils), taxRate? }], discountTotal?, validUntil?, notes?, terms?, sourceInquiry?, sourceQuoteRequest? }`. Computes line/subtotal/tax/grand totals (fils), `quotationNumber` (Counter), `createdBy`, `status:"Draft"`. `201`. **`/send`** renders PDF → Cloudinary (`pdfFile`), sets `status:"Sent"`,`sentAt`, dispatches via email/WhatsApp; `200`. **`/status`** Approved sets `approvedAt` (and links source quote/inquiry status→Converted); auto-`Expired` is also run by a daily sweep on `validUntil`. **`/convert`** spawns an Order from quotation items (priced), links `convertedOrder`. `409 INVALID_STATE_TRANSITION` editing a non-Draft. **Public view** uses a signed, expiring token in the emailed link — no login — returning a read-only quotation; rate-limited.

---

### 14. Customers — `/admin/customers` (staff) + storefront self-service

Storefront "My Account" profile/vehicle endpoints (self):

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/me/profile` | customer | Profile (alias of `/auth/me` detail) |
| PATCH | `/me/profile` | customer | Update name/phone/marketingOptIn |
| PATCH | `/me/password` | customer | Change password (local accounts) |
| GET | `/me/vehicles` | customer | List saved vehicles |
| POST | `/me/vehicles` | customer | Add vehicle subdoc |
| PATCH | `/me/vehicles/:vehicleId` | customer | Update vehicle |
| DELETE | `/me/vehicles/:vehicleId` | customer | Remove vehicle |
| GET | `/me/dashboard` | customer | Account dashboard (counts + recent activity) |

**Vehicle subdoc** body: `{ label?, brand, model?, generation?, year?, engineType?, vin?, makeRef?, modelRef? }`. `/me/dashboard` aggregates recent orders, inquiries, quote requests, wishlist count, saved vehicles for the My-Account landing. `PATCH /me/password` requires `{ currentPassword, newPassword }` → `422` if current wrong; `400` for Google-only accounts (no password).

Admin customer management:

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/customers` | `customer.read` | List/search customers |
| GET | `/admin/customers/:id` | `customer.read` | 360° view: info, orders, wishlist, vehicles, inquiries, quote requests |
| PATCH | `/admin/customers/:id` | `customer.write` | Edit (activate/deactivate, notes) |
| GET | `/admin/customers/:id/orders` | `customer.read`+`order.read` | Their orders |
| GET | `/admin/customers/:id/inquiries` | `customer.read`+`lead.read` | Their inquiries |
| GET | `/admin/customers/export` | `report.read` | Export customers |

**GET `/admin/customers`** — `q` (name/email/phone), `isActive`, `marketingOptIn`, `from`/`to`, pagination. **GET `/admin/customers/:id`** returns the consolidated CRM profile per spec (orders, wishlist, vehicle details, inquiry history, quote requests). Deactivation is reversible (`isActive:false`); customers are never hard-deleted by default (GDPR-style erase is a Super Admin-only special op, out of normal CRUD).

---

### 15. Banners — `/banners` (public) & `/admin/banners`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/banners` | public | Active banners `?placement=home-hero` (date-window filtered) |
| GET | `/admin/banners` | `banner.write` | All banners incl. inactive |
| POST | `/admin/banners` | `banner.write` | Create (image upload + meta) |
| PUT | `/admin/banners/:id` | `banner.write` | Update |
| PATCH | `/admin/banners/:id` | `banner.write` | Toggle active / schedule |
| PATCH | `/admin/banners/reorder` | `banner.write` | Bulk reorder `{ order:[{id,sortOrder}] }` |
| DELETE | `/admin/banners/:id` | `banner.write` | Delete (removes Cloudinary asset) |

**GET `/banners`** `200` → active, within `startAt`/`endAt` window, sorted `sortOrder`, by placement. Create/Update are `multipart` (`image`, optional `mobileImage`) + fields `{ title?, subtitle?, ctaLabel?, ctaLink?, placement, sortOrder?, startAt?, endAt? }`. `201/200`.

---

### 16. FAQ — `/faqs` (public) & `/admin/faqs`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/faqs` | public | Active FAQs `?category=` grouped/sorted |
| GET | `/admin/faqs` | `faq.write` | All FAQs |
| POST | `/admin/faqs` | `faq.write` | Create `{ question, answer, category?, sortOrder? }` |
| PUT | `/admin/faqs/:id` | `faq.write` | Update |
| PATCH | `/admin/faqs/:id` | `faq.write` | Toggle active / reorder |
| DELETE | `/admin/faqs/:id` | `faq.write` | Delete |

`200` → grouped by `category`, sorted `sortOrder`. Standard CRUD codes.

---

### 17. Content Pages — `/content` (public) & `/admin/content`

About / Contact / Terms / Privacy / Returns — editable, no developer.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/content/:slug` | public | Published page (`about\|contact\|terms\|privacy\|returns`) |
| GET | `/admin/content` | `content.write` | List all pages (incl. unpublished) |
| GET | `/admin/content/:slug` | `content.write` | Editable page incl. drafts |
| PUT | `/admin/content/:slug` | `content.write` | Upsert `{ title, body, metaTitle?, metaDescription?, isPublished? }` |
| PATCH | `/admin/content/:slug/publish` | `content.write` | Publish/unpublish |

**GET `/content/:slug`** `200` → `{ slug, title, body, metaTitle, metaDescription, updatedAt }`; `404` if missing or unpublished. **PUT** bumps `version`, sets `updatedBy`, `AuditLog{action:"update"}`. Slug constrained to the known enum (extensible). Contact's structured fields (phone/address/social) come from Settings, not here.

---

### 18. Notifications — `/admin/notifications` (staff only)

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/notifications` | any admin | Current user's + role-broadcast notifications |
| GET | `/admin/notifications/unread-count` | any admin | Badge count |
| PATCH | `/admin/notifications/:id/read` | any admin | Mark one read |
| PATCH | `/admin/notifications/read-all` | any admin | Mark all read |
| DELETE | `/admin/notifications/:id` | any admin | Dismiss |
| GET | `/admin/notifications/stream` | any admin | SSE live feed (optional realtime) |

**GET** resolves `recipient == me OR recipientRole == my role`, `?isRead=`, `?type=`, pagination, sort `-createdAt`. Row: `{ id, type, title, message, severity, referenceType, referenceId, isRead, createdAt }`. `/stream` is Server-Sent Events pushing new notifications (New Order / New Inquiry / New Quote Request / Low Stock). Email/WhatsApp fan-out is handled by background workers, not these endpoints; `deliveryStatus` reflects worker results. `200/204`.

---

### 19. Dashboard & Reports — `/admin/dashboard`, `/admin/reports`

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/dashboard/stats` | `report.read` | Headline counts |
| GET | `/admin/dashboard/charts` | `report.read` | Time-series for all charts |
| GET | `/admin/dashboard/top-products` | `report.read` | Top selling |
| GET | `/admin/dashboard/top-categories` | `report.read` | Top categories |
| GET | `/admin/reports/sales` | `report.read` | Sales report (+export) |
| GET | `/admin/reports/orders` | `report.read` | Orders report (+export) |
| GET | `/admin/reports/products` | `report.read` | Products report (+export) |
| GET | `/admin/reports/customers` | `report.read` | Customers report (+export) |
| GET | `/admin/reports/inquiries` | `report.read` | Inquiries report (+export) |

**GET `/admin/dashboard/stats`** `200` →
```jsonc
{ "data": {
  "totalProducts","totalCategories","totalOrders","totalCustomers","totalLeads","totalQuoteRequests",
  "revenue": { "amount": 1234500, "currency":"AED", "period":"all" },
  "orders": { "pending","processing","delivered","cancelled","new","confirmed","shipped","readyForDispatch" }
} }
```
**GET `/admin/dashboard/charts`** — `?from=&to=&granularity=day|week|month` → `{ salesOverview:[{period,total}], ordersOverview:[{period,count}], topSellingProducts:[{productId,name,salesCount}], topCategories:[{categoryId,name,count}], customerGrowth:[{period,count}] }`, computed via aggregation pipelines on the `{createdAt:-1}` indexes.

**Reports** — each accepts `from`,`to`, entity filters, and a **`format` param**: omit → JSON (paginated, for on-screen tables); `format=csv|xlsx|pdf` → streams a file (`200`, `Content-Type` per format, `Content-Disposition: attachment`), writing `AuditLog{action:"export"}`. PDF generation (and large exports) may run as a job returning `202 { jobId }` then `GET /admin/jobs/:jobId` → `{ status, downloadUrl }`. This satisfies the spec's Excel/CSV/PDF export requirement uniformly across Sales/Orders/Products/Customers/Inquiries.

---

### 20. Settings / SiteConfig — `/settings` (public read) & `/admin/settings`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/settings/public` | public | Storefront-safe config (brand, contact, social, service areas, feature flags) |
| GET | `/admin/settings` | `settings.write` | Full settings doc |
| PUT | `/admin/settings` | `settings.write` | Update settings |
| POST | `/admin/settings/logo` | `settings.write` | Upload brand logo |

**GET `/settings/public`** — replaces static `siteConfig.js`; `200` → `{ brand:{ name, fullName, legalName, tagline, foundedYear, logo }, contact:{ whatsappNumber:"971507855298", whatsappDisplay, phoneNumber, phoneDisplay, email, address, mapsUrl, hours }, social:{…}, serviceAreas:[…], whatsappGreeting, features:{ paymentsEnabled, chatbotEnabled, comingSoon } }`. Heavily cached (read-mostly). The `features.comingSoon` flag drives the existing `IS_COMING_SOON` storefront gate. **PUT `/admin/settings`** partial-merges `{ brand?, contact?, social?, serviceAreas?, whatsappGreeting?, defaults?, features? }`; `AuditLog{action:"update"}`; busts cache. Admin GET additionally exposes `defaults:{ currency, taxRate, lowStockThreshold }`.

---

### 21. RBAC — User & Role Management — `/admin/users`, `/admin/roles`

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/users` | `user.manage` | List staff users |
| GET | `/admin/users/:id` | `user.manage` | Staff user detail (+resolved perms) |
| POST | `/admin/users` | `user.manage` | Provision staff `{ name, email, password, role, phone?, permissionOverrides? }` |
| PUT | `/admin/users/:id` | `user.manage` | Update profile/role |
| PATCH | `/admin/users/:id/role` | `user.manage` | Change role |
| PATCH | `/admin/users/:id/permissions` | `user.manage` | Set `permissionOverrides[]` (`+perm`/`-perm`) |
| PATCH | `/admin/users/:id/active` | `user.manage` | Activate/deactivate |
| POST | `/admin/users/:id/reset-password` | `user.manage` | Admin-initiated reset |
| DELETE | `/admin/users/:id` | `user.manage` (Super Admin) | Soft delete (never the last Super Admin) |
| GET | `/admin/roles` | `user.manage` | List roles + static permission map |
| GET | `/admin/permissions` | `user.manage` | Enumerate all permission keys (for UI) |

**POST `/admin/users`** — only `user.manage` (effectively Super Admin). Sets `createdBy`. `role` ∈ the 5-enum. `201` (no password echoed). **Guards (service layer):** the **last Super Admin cannot be deleted or demoted or deactivated** → `409 CONFLICT`; a user cannot change their own role/permissions (prevents lockout) → `403`. **GET `/admin/roles`** returns the hardcoded `ROLE_PERMISSIONS` map (the optional `Role` collection is not surfaced unless UI-editable roles are later enabled). `role_change` and user mutations write `AuditLog{action:"role_change"|"update"|"create"|"delete"}`.

---

### 22. Health / Ops (non-functional)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | public | Liveness `{ status:"ok" }` |
| GET | `/health/ready` | public | Readiness (DB/Cloudinary checks) |
| GET | `/admin/jobs/:jobId` | any admin | Poll async job (import/export/PDF) status |

`/health` is unthrottled; everything else under the global limiter.

---

#### Cross-cutting summary

- **Public, cacheable, rate-limited (public-search/read tier):** all `GET /products*`, `/categories`, `/subcategories`, `/brands`, `/vehicles/*`, `/banners`, `/faqs`, `/content/:slug`, `/settings/public`. Search and detail tuned for 50k+ via the identifier/text/facet index split and optional cursor pagination.
- **Guest-write, public-write rate tier, guest-token aware:** `POST /cart*`, `/inquiries/{whatsapp,contact,chatbot}`, `/quote-requests`, `/orders`. All enforce `customerName` as the single hard requirement, persist a CRM copy, and (inquiry) return the `wa.me` link.
- **Auth-strict tier:** every `/auth/*` and `/admin/auth/*` credential endpoint.
- **Pricing coexistence:** every purchase path honors the null-price rule — On-Request products are inquiry/quote-only (`checkoutEligible:false`, `422 PRODUCT_NOT_PURCHASABLE` at checkout); priced products support cart+checkout while still allowing WhatsApp inquiry and quote requests.
- **Validation:** Zod on params/query/body at the edge; ObjectId shape pre-checks; money coerced to fils; consistent `{ error:{ code, message, details?, requestId } }` envelope across all failures.
- **Auditing/notifications baked into writes:** stock changes → `StockMovement`; staff mutations → `AuditLog`; New Order / New Inquiry / New Quote Request / Low Stock → `Notification` (CRM + email/WhatsApp workers).

No files were written. This markdown is the complete deliverable.


---

## 3. RBAC & Authentication

### Security & Authorization Architecture — Spare Mec

This is the authoritative design for authentication, authorization (RBAC), enforcement in Express + TypeScript, and audit logging. It is grounded in the canonical data model: a hard split between `AdminUser` and `Customer`, hardcoded role enum + `permissionOverrides`, guest checkout that creates no `Customer` document, and the existing storefront's localStorage cart/wishlist contexts (merged on login).

---

### 1. Authentication Strategy

#### 1.1 Two separate auth realms

There are **two completely independent auth systems** sharing zero token namespace. This is non-negotiable for security: a customer token must never be accepted on an admin route, and vice versa.

| | **Customer realm** (storefront) | **Admin realm** (CRM/Vite app) |
|---|---|---|
| Collection | `Customer` | `AdminUser` |
| Self-registration | Yes (email+password, Google) | No — seeded/provisioned by Super Admin only |
| Token audience claim (`aud`) | `"customer"` | `"admin"` |
| JWT signing secret | `JWT_CUSTOMER_SECRET` | `JWT_ADMIN_SECRET` (**distinct secret**) |
| Cookie names | `sm_cust_at` / `sm_cust_rt` | `sm_adm_at` / `sm_adm_rt` |
| Cookie path scope | `/` (storefront API) | `/api/admin` (admin API only) |
| Google OAuth | Yes | No (admins use email+password; optional Google-Workspace SSO later) |
| Refresh lifetime | 30 days (sliding) | 7 days (shorter — privileged) |
| Access lifetime | 15 min | 15 min |

Using **two different signing secrets + an `aud` claim check** means a stolen/forged customer JWT is structurally unable to authenticate against admin middleware even if the attacker controls the payload — the signature won't verify under the admin secret, and the `aud` guard rejects it as defense-in-depth.

#### 1.2 JWT access + refresh design

- **Access token (JWT, 15 min):** stateless, carries minimal claims. Verified on every request without a DB hit.
  - Customer claims: `{ sub: customerId, aud: "customer", typ: "access", authProvider, ver: tokenVersion }`
  - Admin claims: `{ sub: adminUserId, aud: "admin", typ: "access", role, ver: tokenVersion }`
  - **Role is embedded in the admin access token** so the common case (permission check) needs no DB read. Permissions are *derived* from `role` + `permissionOverrides` — but `permissionOverrides` are **not** put in the token (they can change; instead a short access-token lifetime + `ver` bump on override change keeps it fresh). For correctness-critical override changes, see "token invalidation" below.
- **Refresh token (15-min ≪ 30-day, opaque random, 256-bit):** **NOT a JWT.** A high-entropy random string (`crypto.randomBytes(32).toString('base64url')`). Only its **hash** (`refreshTokenHash`, SHA-256) is stored on the user document (`select:false`). On refresh:
  1. Client sends refresh cookie → server hashes it → compares to `refreshTokenHash`.
  2. If match: **rotate** — issue a new access + new refresh token, overwrite `refreshTokenHash` with the new hash, set new cookies.
  3. If the presented refresh token hashes to a value that is **not current** (reuse of a rotated token) → treat as theft: **clear `refreshTokenHash`** (logout everywhere) and force re-login. This is refresh-token rotation with reuse detection.

  > A random opaque refresh token (vs. a long-lived JWT) is chosen deliberately: it is revocable server-side (just null the hash), supports rotation/reuse-detection, and never carries claims an attacker could read. JWT refresh tokens cannot be revoked without a denylist, defeating their statelessness benefit anyway.

  > **`tokenVersion` (`ver`) field:** add an integer `tokenVersion` (default 0) to both `AdminUser` and `Customer` (small addition to the model). Incrementing it instantly invalidates **all** outstanding access tokens for that user (deactivation, password change, role change, force-logout). The access-token verifier compares `token.ver` to the user's current `tokenVersion` — but only when a fresh check is warranted (see 1.6) to keep the hot path stateless.

#### 1.3 Token storage: **httpOnly cookies** (chosen) — with reasoning

**Decision: store both access and refresh tokens in `httpOnly`, `Secure`, `SameSite` cookies. Do NOT use `localStorage` or the `Authorization` header for browser clients.**

Cookie attributes:
```
Set-Cookie: sm_cust_at=<jwt>;  HttpOnly; Secure; SameSite=Lax;    Path=/;          Max-Age=900
Set-Cookie: sm_cust_rt=<rand>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=2592000
Set-Cookie: sm_adm_at=<jwt>;   HttpOnly; Secure; SameSite=Strict; Path=/api/admin;  Max-Age=900
Set-Cookie: sm_adm_rt=<rand>;  HttpOnly; Secure; SameSite=Strict; Path=/api/admin/auth/refresh; Max-Age=604800
```

Reasoning:

- **XSS token theft is the dominant threat for an e-commerce SPA** (third-party scripts, marketing tags, dependency supply-chain). `localStorage` tokens are readable by *any* script on the page → one XSS = full account takeover, and the token is exfiltratable. `httpOnly` cookies are unreadable by JS, so an XSS cannot steal the token itself (it can still ride the session while the page is open, but cannot exfiltrate long-lived credentials).
- **CSRF is the cost of cookies, and it is cheaply mitigated** (see 1.4): `SameSite` + a double-submit CSRF token on state-changing requests. XSS is the harder, more damaging class; we optimize against it.
- **`SameSite` scoping:** customer access cookie is `Lax` (allows top-level GET navigations, e.g. returning from Google OAuth redirect and email links). Refresh cookies and **all** admin cookies are `SameSite=Strict` (no cross-site sending at all). The admin app is a separate origin/app; its cookies are path-scoped to `/api/admin` so they're never even sent to storefront endpoints.
- **Refresh cookie `Path` is narrowed** to the refresh endpoint only, so it is not transmitted on every API call (smaller attack surface, smaller request size).

> **Mobile / future native clients:** for non-browser clients (a future React Native app, or server-to-server), expose a **bearer-token mode**: same JWTs returned in the JSON body, sent via `Authorization: Bearer`. The `authenticate` middleware reads the token from **either** the cookie **or** the `Authorization` header. Browsers use cookies (XSS-safe); native clients use the header (no cookie jar, store in secure keystore). This dual-read keeps one code path while giving each client type its safest storage.

#### 1.4 CSRF protection (the cookie tax)

Because we use cookies, every **state-changing** request (`POST/PUT/PATCH/DELETE`) requires CSRF defense:

- **Double-submit token:** on login, also set a **non-httpOnly** cookie `sm_csrf=<random>` (readable by JS). The SPA reads it and echoes it in an `X-CSRF-Token` header on mutating requests. Middleware asserts header === cookie. An attacker's cross-site form cannot read the cookie to forge the header (Same-Origin Policy), so the check fails.
- **`SameSite=Strict/Lax`** already blocks most CSRF; the double-submit token is belt-and-suspenders and covers the `Lax` top-level-POST edge cases.
- **Safe methods (`GET/HEAD`) are exempt** — they must be side-effect-free anyway (enforced by convention + the permission matrix: `GET` = read only).
- Enforced by a single `csrfGuard` middleware applied globally to mutating verbs.

#### 1.5 Google OAuth flow (customers only)

Server-side **Authorization Code flow** (not implicit, not client-only token):

1. Storefront hits `GET /api/auth/google` → server generates a `state` (CSRF nonce, stored in a short-lived signed cookie) + redirects to Google consent.
2. Google redirects back to `GET /api/auth/google/callback?code=...&state=...`.
3. Server validates `state`, exchanges `code` for tokens at Google's token endpoint (server-side, using `GOOGLE_CLIENT_SECRET`), and verifies the **ID token** (JWT) signature against Google's JWKS, checking `iss`, `aud` (our client id), and `exp`.
4. Extract `sub` (→ `googleId`), `email`, `email_verified`, `name`.
5. **Account resolution / linking:**
   - Find `Customer` by `googleId` → if found, log in.
   - Else find by `email`:
     - If a local-password account exists with that email and `emailVerified` → **link** `googleId` to it (set `authProvider` stays `local` but `googleId` populated), log in. (Mitigates pre-emptive account-hijack: only link to an already-verified email.)
     - If exists but email **not** verified → require email verification before linking (avoid hijack).
   - Else **create** a new `Customer` with `authProvider: "google"`, `googleId`, `emailVerified: true` (Google asserts it), `passwordHash: null`.
6. Issue customer access + refresh cookies exactly as the local flow. Redirect to the storefront.

- **ID-token signature is verified server-side against Google JWKS** — never trust a token forwarded from the browser without verification.
- Google OAuth is **disabled for the admin realm** by design (admins are provisioned, not self-service). A future "Sign in with Google Workspace" for staff would be a separate, domain-restricted (`hd` claim) flow.

#### 1.6 Password hashing: **argon2id** (recommended), bcrypt acceptable

**Recommendation: `argon2id`** via the `argon2` npm package.

- `argon2id` is the current OWASP password-storage first choice: memory-hard (resists GPU/ASIC cracking) and side-channel-resistant. Suggested params: `memoryCost: 19456 (19 MiB)`, `timeCost: 2`, `parallelism: 1` (OWASP baseline; tune up to ~50–100 ms/hash on prod hardware).
- **bcrypt is an acceptable fallback** if the deployment target struggles with argon2's memory (e.g. tiny serverless tiers) — `bcrypt` cost factor **12** minimum. bcrypt's 72-byte input truncation must be handled (pre-hash with SHA-256 if you ever allow >72-byte passphrases).
- Applies to **both** `AdminUser.passwordHash` and `Customer.passwordHash`. Both are `select:false` and never leave the server.
- Hashes are computed only at registration/password-change; verification on login. On successful login, if the stored hash's params are below current policy, **transparently re-hash** with current params ("hash upgrade on login").
- Password policy: min 8 chars (customers), min 12 (admins), checked against a breached-password list (e.g. HaveIBeenPwned k-anonymity API or a local bloom filter) on set.
- Rate-limit login (per-IP + per-account), exponential backoff / lockout after N failures, generic error ("invalid email or password") to prevent enumeration. Same for password-reset (always respond 200, don't reveal existence).

**When a full `tokenVersion` / override freshness check happens:** the access-token hot path stays stateless. A DB check (loading `tokenVersion`, `isActive`, `permissionOverrides`) is performed (a) on **every token refresh**, and (b) optionally on **sensitive admin mutations** (`user.manage`, `settings.write`, deletes) via a `requireFreshAuth` middleware that reloads the AdminUser. This bounds the staleness of a revoked/role-changed admin to at most the 15-min access-token TTL for non-sensitive reads, and to *immediate* for sensitive writes.

#### 1.7 Guest handling — no login required (browse / cart / inquiry / checkout)

Guests are first-class. **No guest ever creates a `Customer` document** (per the data model: "Guest checkout creates **no** Customer doc; data lives on the Order/Inquiry directly").

- **Browse / search / filter:** fully public. `GET` catalogue, category, product, search, banners, content, FAQ endpoints require **no auth** and are served through an `optionalAuth` middleware (attaches `req.user` if a valid cookie exists, otherwise proceeds anonymously). Public endpoints also strip RBAC-gated fields (`costPrice`, `compareAtPrice`, internal stock notes) regardless of auth.
- **Cart:** lives **client-side in localStorage** (the existing `InquiryContext`/`WishlistContext` pattern). Optionally a server-side guest cart keyed by `sessionToken` (random, httpOnly cookie `sm_cart`) for cross-device/abandoned-cart analytics — TTL-indexed. On login, the client cart is **merged** into the customer's server `Cart` (union by product, max qty), then the local copy cleared.
- **Inquiry (WhatsApp / chatbot / contact / quote):** all four sources accept anonymous `POST`. Only `customerName` is required (mobile also required for QuoteRequest per spec). These write `Inquiry`/`Lead`/`QuoteRequest` rows with `customer: null`. They are **rate-limited per IP + CAPTCHA** (e.g. on the contact/chatbot forms) to prevent spam flooding the CRM. The generated WhatsApp message + `wa.me` link are returned to the client and a CRM copy is saved.
- **Direct checkout as guest:** allowed. `POST /api/orders` with `isGuest:true`, min-required `customerName`; optional phone/email/address/vehicle captured **on the order itself** (address snapshot, `vehicle` subdoc). Order enters `New` → immediately transitions to `Pending Verification`. No account is created. If the same person later registers with the same email, orders are **not** auto-claimed (privacy) unless they verify the email and explicitly claim — a future enhancement; the schema supports it because guest orders store `customerEmail`/`customerPhone`.
- **"On Request" products** (`price == null`) are **excluded from checkout** at the API layer: the order-create service rejects any line item whose product has `price == null` (or routes it to inquiry), enforcing the pricing rule server-side, not just in the UI.

---

### 2. The Roles (exact)

Seven principals — five staff roles (the fixed spec set) plus the two storefront principals.

| Role | Realm | Scope summary |
|---|---|---|
| **Super Admin** | Admin | Full access to everything, including user/role management and settings. Cannot be deleted (only deactivated). |
| **Sales Team** | Admin | Orders, Customers (read), Leads, Quote Requests, Quotations, Inquiries; read reports. |
| **Inventory Manager** | Admin | Products, Categories/Subcategories/Brands, Inventory/Stock, Warehouses; read reports. |
| **Marketing Manager** | Admin | Banners, Content Pages, FAQ; (read products/dashboard). |
| **Viewer** | Admin | Read-only across all admin resources. |
| **Customer** | Storefront | Own profile, addresses, vehicles, wishlist, cart, orders, inquiries, quote requests — **own records only**. |
| **Guest** | Public | Browse/search public catalogue + content; submit inquiries/quotes; guest checkout. No account. |

Permission keys (constants in code, exactly as the data model specifies): `product.read/write/delete`, `inventory.read/write`, `order.read/write`, `customer.read/write`, `lead.read/write`, `quotation.read/write`, `banner.write`, `content.write`, `faq.write`, `report.read`, `user.manage`, `settings.write` — extended here with the read/write granularity needed for the matrix (`category.*`, `brand.*`, `inquiry.*`, `banner.read`, `content.read`, `faq.read`, `notification.read/write`, `dashboard.read`).

Static `ROLE_PERMISSIONS` map (source of truth in code):

```ts
// Super Admin → ['*']  (wildcard, short-circuits all checks)
// Sales Team:        order.*, customer.read, lead.*, quotation.*, inquiry.*,
//                    report.read, dashboard.read, notification.read,
//                    product.read, category.read, brand.read
// Inventory Manager: product.*, category.*, subcategory.*, brand.*,
//                    inventory.*, report.read, dashboard.read,
//                    notification.read
// Marketing Manager: banner.*, content.*, faq.*, dashboard.read,
//                    product.read, category.read, notification.read
// Viewer:            <every>.read  (all read perms, no writes)
```

`permissionOverrides` on `AdminUser` (`['+perm', '-perm']`) are applied **after** the role map: resolved set = `(ROLE_PERMISSIONS[role] ∪ granted(+)) \ revoked(-)`. Super Admin's `'*'` ignores revocations to prevent self-lockout of the last admin (guarded in service layer).

---

### 3. Permission Matrix

Cells: **C**reate / **R**ead / **U**pdate / **D**elete. `—` = no access. **R\*** = read but with field-level redaction (e.g. `costPrice`, customer PII partially masked). "Own" = ownership-scoped (resource-level check, see §4.3). Guest = unauthenticated public.

Admin-realm resources first; the last three rows are storefront/public resources.

| Resource ↓ \ Role → | Super Admin | Sales Team | Inventory Mgr | Marketing Mgr | Viewer | Customer | Guest |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Products** | C R U D | R | C R U D | R | R | R\* | R\* |
| **Categories** | C R U D | R | C R U D | R | R | R | R |
| **Subcategories** | C R U D | R | C R U D | R | R | R | R |
| **Brands** | C R U D | R | C R U D | R | R | R | R |
| **Inventory / Stock** | C R U D | R | C R U D | — | R | — | — |
| **Stock Movements** (audit) | R | R | C R | — | R | — | — |
| **Warehouses** | C R U D | R | C R U _ | — | R | — | — |
| **Orders** | C R U D | C R U _ | R | — | R | **R U** (own)¹ | C (guest)² |
| **Customers** | C R U D | R | — | — | R | R U (self) | — |
| **Addresses** | R | R | — | — | R | C R U D (own) | — |
| **Wishlist** | R | R | — | — | R | C R U D (own) | (localStorage) |
| **Cart** | R | R | — | — | R | C R U D (own) | (localStorage)³ |
| **Inquiries** | C R U D | C R U _ | — | — | R | C R (own)⁴ | C⁴ |
| **Leads** | C R U D | C R U D | — | — | R | — | C (via chatbot)⁴ |
| **Quote Requests** | C R U D | C R U _ | — | — | R | C R (own) | C |
| **Quotations** | C R U D | C R U D | — | — | R | R (own, if sent) | — |
| **Banners** | C R U D | — | — | C R U D | R | R (active) | R (active) |
| **Content Pages** | C R U D | — | — | C R U D | R | R (published) | R (published) |
| **FAQ** | C R U D | — | — | C R U D | R | R (active) | R (active) |
| **Users / Roles** (AdminUser) | C R U D | — | — | — | — | — | — |
| **Reports / Exports** | R | R | R | — | R | — | — |
| **Settings / SiteConfig** | R U | R⁵ | R⁵ | R\* (content subset)⁶ | R | R\* (public subset)⁷ | R\* (public subset)⁷ |
| **Dashboard** | R | R | R | R | R | — | — |
| **Notifications** | R U D | R U (own) | R U (own) | R U (own) | R | — | — |
| **Audit Logs** | R | — | — | — | R | — | — |

**Footnotes:**

1. **Customer Orders:** read **only their own** orders (`order.customer === req.user.sub`); `U` limited to **cancel** a still-cancellable order (status ∈ {New, Pending Verification}) — not arbitrary edits. Status progression beyond cancel is staff-only.
2. **Guest Orders:** create-only (guest checkout). A guest cannot list/read orders (no identity). A post-checkout one-time signed link / order-lookup-by-(orderNumber+phone) may expose a single order read without auth — optional, rate-limited.
3. **Guest Cart/Wishlist:** primarily localStorage. Optional server guest cart keyed by `sessionToken` cookie; readable/writable only via that token.
4. **Inquiries/Leads/QuoteRequests (Customer & Guest create):** anonymous create allowed (rate-limited + CAPTCHA). A logged-in customer can read **their own** inquiry/quote history (linked via `customer`); guests cannot read back. Leads are chatbot-generated; not customer-readable.
5. **Settings read for Sales/Inventory:** read-only access to operational defaults (currency, tax, low-stock threshold, WhatsApp number) needed to render forms; no write.
6. **Marketing Settings:** may update the **content/contact/social/brand** subset of `Setting` (it replaces `siteConfig.js`), gated by `content.write`; cannot touch security/feature-flag fields like `paymentsEnabled`.
7. **Public Settings:** Guest/Customer get a **redacted projection** — brand, contact (WhatsApp/phone/email/address/hours/maps), social, service areas, public feature flags (`comingSoon`, `chatbotEnabled`) only. No internal defaults/secrets.

**Field-level redaction (R\*) rules:**
- **Products (Customer/Guest):** hide `costPrice`, `salesCount` analytics internals, `externalId`; show `price` only when non-null (else availability "On Request").
- **Customers (Viewer/Sales R\*):** Viewer sees masked PII (email/phone partially obscured) unless they also hold a `customer.read` PII grant; Sales sees full (needs it to serve customers). Implemented via projection + a `canSeePII` derived flag.

---

### 4. Enforcement in Express + TypeScript

#### 4.1 Request augmentation & the auth chain

```ts
// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;   // present iff authenticated
    }
  }
}

type AuthContext =
  | { realm: 'customer'; customerId: string; authProvider: 'local' | 'google' }
  | { realm: 'admin'; adminId: string; role: AdminRole; permissions: Set<string> };
```

Two router trees mount different auth pipelines:

```
/api/...           → storefront router  (optionalAuth or authenticateCustomer)
/api/admin/...     → admin router        (authenticateAdmin → permission gates)
```

#### 4.2 Core middleware

**`authenticate` (realm-parameterized factory):**

```ts
function authenticate(realm: 'customer' | 'admin', required = true) {
  return async (req, res, next) => {
    const token = readToken(req, realm); // cookie sm_*_at OR Authorization: Bearer
    if (!token) return required ? res.sendStatus(401) : next();
    try {
      const secret = realm === 'admin' ? ADMIN_SECRET : CUSTOMER_SECRET;
      const payload = jwt.verify(token, secret, {
        audience: realm,            // aud claim guard (cross-realm rejection)
        algorithms: ['HS256'],      // pin alg → block 'none'/alg-confusion
      }) as TokenPayload;
      if (payload.typ !== 'access') return res.sendStatus(401);

      if (realm === 'admin') {
        req.auth = {
          realm: 'admin',
          adminId: payload.sub,
          role: payload.role,
          permissions: resolvePermissions(payload.role, /*overrides loaded lazily*/),
        };
      } else {
        req.auth = { realm: 'customer', customerId: payload.sub,
                     authProvider: payload.authProvider };
      }
      return next();
    } catch {
      return required ? res.sendStatus(401) : next();
    }
  };
}

export const authenticateCustomer = authenticate('customer', true);
export const optionalAuth        = authenticate('customer', false); // public + maybe-logged-in
export const authenticateAdmin   = authenticate('admin', true);
```

- `algorithms: ['HS256']` is **pinned** to prevent the classic `alg:none` and RS/HS confusion attacks.
- `audience` enforced so a customer token presented to `/api/admin` is rejected at verify time (in addition to the distinct secret already making it fail).

**`requireRole` (coarse):**

```ts
const requireRole = (...roles: AdminRole[]) =>
  (req, res, next) =>
    req.auth?.realm === 'admin' && roles.includes(req.auth.role)
      ? next() : res.sendStatus(403);
```

**`requirePermission` (fine — the workhorse):**

```ts
const requirePermission = (...needed: string[]) =>
  (req, res, next) => {
    if (req.auth?.realm !== 'admin') return res.sendStatus(403);
    const perms = req.auth.permissions;
    if (perms.has('*')) return next();                       // Super Admin
    const ok = needed.every(p => perms.has(p));
    return ok ? next() : res.sendStatus(403);
  };

// resolvePermissions: (ROLE_PERMISSIONS[role] ∪ +overrides) \ -overrides
```

**`requireFreshAuth` (sensitive admin mutations):** reloads the `AdminUser`, asserts `isActive`, re-derives permissions **including `permissionOverrides`**, and checks `tokenVersion === payload.ver`. Applied to `user.manage`, `settings.write`, and destructive deletes so privilege changes / deactivations take effect immediately rather than waiting for token expiry.

**`csrfGuard`:** double-submit check on mutating verbs (see §1.4).

**Rate-limiters:** `loginLimiter` (per-IP + per-account), `publicWriteLimiter` (inquiry/quote/contact endpoints) + CAPTCHA verification middleware.

#### 4.3 Resource-level ownership checks

Coarse RBAC ("can a customer read orders?") is insufficient — a customer may read **only their own** orders. Two complementary patterns:

**(a) Query-scoping (preferred — enforce in the data layer, can't be bypassed):** ownership-scoped list/read queries always inject the owner filter; there is no code path that fetches another user's data.

```ts
// GET /api/account/orders
router.get('/account/orders', authenticateCustomer, async (req, res) => {
  const orders = await Order.find({
    customer: req.auth.customerId,         // scoping is part of the query
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
  res.json(orders);
});
```

**(b) `requireOwnership` middleware (for single-resource by id):** loads the resource and asserts the owner field, returning **404 (not 403)** when the caller isn't the owner — so existence isn't leaked.

```ts
const requireOwnership =
  (model: Model<any>, ownerField = 'customer', param = 'id') =>
  async (req, res, next) => {
    const doc = await model.findById(req.params[param]).select(`${ownerField} status`);
    if (!doc) return res.sendStatus(404);
    const isOwner = req.auth?.realm === 'customer'
      && String(doc[ownerField]) === req.auth.customerId;
    const isStaff = req.auth?.realm === 'admin';      // staff bypass per matrix
    if (!isOwner && !isStaff) return res.sendStatus(404);
    (req as any).resource = doc;                       // reuse, avoid double-fetch
    next();
  };
```

Customer-cancel of an order additionally checks a **state machine** (`status ∈ {New, Pending Verification}`) in the service, not just ownership.

**Field-level redaction (R\*)** is enforced by **serializers/projections per realm**, never by trusting the client:
```ts
const publicProductView = (p) => omit(p, ['costPrice','externalId','salesCount', ...]);
```
Sensitive fields are `select:false` at the schema level (`costPrice`, `passwordHash`, `refreshTokenHash`) so they don't even load unless a staff query explicitly selects them with the right permission.

#### 4.4 How routes wire it together (examples)

```ts
// ---- Public storefront (Guest + Customer) ----
catalog.get('/products',        optionalAuth, listProducts);          // redacted view
catalog.get('/products/:slug',  optionalAuth, getProduct);
catalog.post('/inquiries',      publicWriteLimiter, captcha, createInquiry); // guest ok
orders.post('/orders',          optionalAuth, captcha, createOrder);   // guest checkout

// ---- Customer account (must be logged in, own data) ----
account.use(authenticateCustomer, csrfGuard);
account.get   ('/me',            getProfile);
account.patch ('/me',           updateProfile);
account.get   ('/orders',       listMyOrders);                         // query-scoped
account.get   ('/orders/:id',   requireOwnership(Order), getMyOrder);
account.post  ('/orders/:id/cancel', requireOwnership(Order), cancelMyOrder);
account.get   ('/wishlist',     getMyWishlist);

// ---- Admin (CRM) ----
admin.use(authenticateAdmin, csrfGuard, auditContext);  // attach actor for AuditLog

admin.get   ('/products',        requirePermission('product.read'),  adminListProducts);
admin.post  ('/products',        requirePermission('product.write'), withAudit('create','Product'), createProduct);
admin.patch ('/products/:id',    requirePermission('product.write'), withAudit('update','Product'), updateProduct);
admin.delete('/products/:id',    requirePermission('product.delete'), withAudit('delete','Product'), deleteProduct);

admin.patch ('/orders/:id/status', requirePermission('order.write'), withAudit('status_change','Order'), changeOrderStatus);

admin.post  ('/banners',         requirePermission('banner.write'),  ...);
admin.put   ('/content/:slug',   requirePermission('content.write'), ...);

// User & settings management — Super Admin only, fresh-auth enforced
admin.use('/users',    requirePermission('user.manage'), requireFreshAuth);
admin.post('/users',                 createAdminUser);
admin.patch('/users/:id/role',       withAudit('role_change','AdminUser'), changeRole);
admin.patch('/settings',             requirePermission('settings.write'), requireFreshAuth, withAudit('update','Setting'), updateSettings);
```

Order of middleware on every admin mutation: **authenticate → csrf → permission → (ownership/fresh) → audit-wrap → handler**. Deny-by-default: any admin route without an explicit `requirePermission` is a bug; add an integration test asserting every `/api/admin` route declares a permission gate.

---

### 5. Hardcoded enum roles vs dynamic DB-driven permissions — Recommendation

**Recommendation: hardcoded role enum + a code-defined `ROLE_PERMISSIONS` map, with the per-user `permissionOverrides` escape hatch. Do NOT build a dynamic Role/Permission collection now.** (This matches the canonical data model's stance.)

Reasoning:

- **The role set is fixed by the spec** (exactly 5 staff roles). Their permission bundles change rarely and only by developer decision. A dynamic system solves a problem (non-technical admins editing roles at runtime) that **does not exist** in the requirements.
- **Security & auditability:** permissions in code are version-controlled, code-reviewed, diffable, and testable. A DB-driven permission table is mutable at runtime by anyone with DB/UI access — a larger attack surface and a privilege-escalation vector (e.g. a compromised Super Admin silently granting `user.manage` to a Viewer with no code trail). Code changes leave a Git history; that's the strongest audit.
- **Performance:** role → permissions resolves from an in-memory map with **zero DB round-trips** on the hot path. A dynamic model needs a join/lookup (or cache with invalidation complexity) per request.
- **Correctness:** an `enum` + `as const` map gives **compile-time** exhaustiveness — TypeScript flags a role or permission key referenced but not defined. A DB table gives only runtime errors.
- **Flexibility is preserved** without the full machinery: `permissionOverrides: ['+report.read', '-product.delete']` covers the rare "this one Inventory Manager also needs reports" / "revoke deletes from this user" cases via data, no migration.
- **Forward path is open:** the data model already specs an **optional `Role` collection** (`key/name/permissions/isSystem`). If UI-editable roles are ever genuinely required, switch `resolvePermissions()` to read from a cached `Role` collection — the rest of the enforcement layer (`requirePermission`, the permission **keys**, the matrix) is unchanged because it's already keyed on permission strings, not role names. We design *to the permission-string interface* so the backing store can change later without touching route guards.

Net: hardcoded roles + static permission map + `permissionOverrides` is the right altitude — secure, fast, type-safe, sufficiently flexible, and non-blocking for future dynamic roles.

---

### 6. Audit Logging of Admin Actions

Two complementary, **append-only** trails (both in the data model):

- **`StockMovement`** — the specialized, immutable ledger for **every** stock change (already in the model; carries `quantityBefore/After`, `type`, `performedBy`, polymorphic `referenceType/Id`). This is the authoritative inventory audit and powers "track stock changes".
- **`AuditLog`** — the **broad** staff-action audit for everything else: `create/update/delete/login/logout/status_change/bulk_import/export/role_change` across any `entityType`, with `actor`, `actorName` (snapshot), `before`/`after` (redacted), `ip`, `userAgent`.

**Implementation:**

- A **`withAudit(action, entityType)` wrapper** (shown in §4.4) captures `before` (pre-image, for updates/deletes), runs the handler, captures `after`, and writes the `AuditLog` row **after** the mutation commits. For non-CRUD events (login/logout/export) the service emits the log directly.
- **`auditContext` middleware** attaches the actor (`req.auth.adminId` + name) and request metadata (`ip` from a trusted proxy header, `userAgent`) to the request so every wrapped handler has them.
- **Redaction is mandatory:** `before`/`after` snapshots run through a scrubber that drops `passwordHash`, `refreshTokenHash`, tokens, and full PAN/secrets before persistence. `costPrice` may be retained (staff-internal) but is access-controlled on read.
- **Append-only enforcement:** `AuditLog` and `StockMovement` models expose **no update/delete** service methods; deny `update`/`delete` at the schema/route level. Optionally enable MongoDB document-level immutability via application invariants + periodic export to write-once storage for compliance.
- **What is always audited (non-negotiable):** every admin `login`/`logout` (and failed logins → security log), **all** `role_change` and `user.manage` actions, `settings.write`, every order `status_change`, every product create/update/delete/price/stock change, `bulk_import` runs (with row counts + error summary), and every `export` (who exported which report — data-exfiltration trail).
- **Reads of AuditLog** are restricted to **Super Admin** (and Viewer per matrix) — sales/inventory staff cannot read the audit trail of their own or others' actions.
- **Notifications tie-in:** security-relevant events (new admin user, role change, repeated failed logins, deactivation) also raise a `Notification` (`severity: warning|critical`, `recipientRole: "Super Admin"`).

**Failed-login / security events:** failed admin logins, refresh-token reuse detection, and `aud`/signature rejections are logged to the security trail (and rate-limiter store) even though no `AuthContext` exists — actor is `null`, `actorName: "<unauthenticated>"`, with `ip`/`userAgent` retained for forensics.

---

#### Minor additions this design requires to the canonical model (small, backward-compatible)

- Add `tokenVersion: Number (default 0)` to **`AdminUser`** and **`Customer`** (instant global token invalidation on deactivate/password-change/role-change). Everything else (`refreshTokenHash`, `permissionOverrides`, `isActive`, `AuditLog`, `StockMovement`, `Setting.features`) already exists in the model and is used as-is.

**Relevant existing files** (storefront, to be wired to the new auth API — guest contexts already match the "merge on login" design):
- `/home/nibras-s/Desktop/Projects/sm-auto/src/context/InquiryContext.jsx` (localStorage cart → merge into server `Cart` on login)
- `/home/nibras-s/Desktop/Projects/sm-auto/src/context/WishlistContext.jsx` (localStorage wishlist → merge into server `Wishlist` on login)
- `/home/nibras-s/Desktop/Projects/sm-auto/src/config/siteConfig.js` (public `Setting`/SiteConfig projection seeds from here)
- `/home/nibras-s/Desktop/Projects/sm-auto/src/utils/whatsapp.js` (WhatsApp message/link generation — mirrored server-side so the CRM copy + `wa.me` link are produced authoritatively on inquiry create)


---

## 4. Admin / CRM App (React + Vite + TS)

### Spare Mec — Admin/CRM Frontend Architecture

A **new, separate** application: **React 18 + Vite + TypeScript + TailwindCSS**. It lives in its own folder (`admin/`), has its own `package.json`, its own dev server, and talks to the same Express API as the storefront. It shares **conventions** with the CRA storefront (monochrome `--accent` theme, `slugify`, money-in-fils, status-map badge pattern, the canonical enums) but **no build tooling and no component code** — the storefront stays CRA/JS, the admin is Vite/TS.

> Throughout: money is **fils (integer, AED×100)**. The admin is the only surface that sees `costPrice`, margins, and gated fields, so RBAC is enforced both server-side (source of truth) and client-side (UX/affordance hiding).

---

### 1. Foundation: structure, routing, auth, data, forms, libs

#### 1.1 Recommended dependency set

| Concern | Choice | Why (for this app specifically) |
|---|---|---|
| Build/dev | **Vite + `@vitejs/plugin-react`** | Spec-mandated. Fast HMR; `import.meta.env.VITE_*` for `API_URL`. |
| Language | **TypeScript (strict)** | The data model is large and enum-heavy; types are the single biggest defect-reducer here. Generate types from the Mongoose models (see §1.7). |
| Routing | **React Router v6.4+ (data routers, `createBrowserRouter`)** | Same major as storefront → shared mental model. Nested layouts + `loader`/`lazy` for code-splitting per route. |
| Server state | **TanStack Query v5** (`@tanstack/react-query`) | The admin is ~95% server-state CRUD (lists, detail, mutations). Query gives caching, pagination, optimistic updates, background refetch, invalidation — exactly the dashboard/list/detail loop. |
| HTTP | **axios** (single configured instance) | Interceptors for `Authorization`, refresh-token rotation, and global 401/403 handling. |
| Forms | **react-hook-form + zod** (`@hookform/resolvers`) | Product/Quotation/Order forms are huge and nested (arrays of specs, images, fitment, line items). RHF field arrays + zod resolver handle this with minimal re-renders. |
| Tables | **TanStack Table v8** (headless) styled with Tailwind | Headless = full control over the Tailwind look + matches our DataTable abstraction. Sorting/filtering/column-visibility/row-selection built in; server-side pagination wired to Query. (AG Grid only if they later demand Excel-grade in-cell editing — overkill now.) |
| Charts | **Recharts** | Declarative, composable, good-enough for the 5 dashboard charts (area/bar/line/pie). Tree-shakeable; no license. (ECharts/`apexcharts` are alternatives if they want heavier interactivity later.) |
| Drag & drop | **@dnd-kit/core + @dnd-kit/sortable** | Sortable product images and drag-reorder banners/FAQs. Modern, accessible, touch-friendly. |
| Excel (import/export) | **`xlsx` (SheetJS)** client-side parse for the bulk-import preview + template download; server does authoritative validation. **Exports** (Reports) preferably server-generated. |
| Dates | **date-fns** | Lightweight; formatting order timestamps, SLA countdowns, chart axes. |
| Toasts | **sonner** (or `react-hot-toast`) | Mutation success/error feedback + the in-app notification toasts. |
| Icons | **lucide-react** | (Storefront uses `react-icons`; admin can match by using `react-icons` too — either is fine. Pick one and keep it.) |
| Rich text | **@tiptap/react** | Content pages (About/Terms/Privacy) + product long description. Outputs HTML to store in `ContentPage.body`. |
| Class utils | **clsx + tailwind-merge** (`cn()` helper) | Same ergonomics the storefront gets from manual className concatenation, but safe. |

#### 1.2 Folder / app structure

```
admin/
├─ index.html
├─ vite.config.ts                # alias @ -> src; proxy /api -> backend in dev
├─ tailwind.config.ts            # PORTS storefront tokens (ink, accent via --accent, fonts, shadows)
├─ tsconfig.json                 # strict; paths { "@/*": ["src/*"] }
├─ .env.development               # VITE_API_URL, VITE_GOOGLE_CLIENT_ID
└─ src/
   ├─ main.tsx                   # mounts <App/>, QueryClientProvider, RouterProvider, Toaster
   ├─ App.tsx                    # router + global providers wrapper
   ├─ index.css                  # Tailwind layers + --accent CSS vars (mirrors storefront)
   │
   ├─ app/                       # cross-cutting app wiring
   │  ├─ router.tsx              # createBrowserRouter: route tree, lazy(), loaders, guards
   │  ├─ queryClient.ts          # QueryClient defaults (staleTime, retry, error handler)
   │  ├─ providers.tsx           # AuthProvider, ThemeProvider, Toaster compose
   │  └─ queryKeys.ts            # centralized query-key factory (typed)
   │
   ├─ config/
   │  ├─ env.ts                  # typed import.meta.env access
   │  ├─ nav.ts                  # sidebar nav definition (label, icon, path, permission)
   │  └─ constants.ts            # page sizes, debounce ms, currency=AED
   │
   ├─ lib/
   │  ├─ axios.ts                # the configured instance + interceptors
   │  ├─ api/                    # thin typed API client per domain (see §1.5)
   │  │  ├─ auth.api.ts  products.api.ts  orders.api.ts  inventory.api.ts
   │  │  ├─ customers.api.ts  inquiries.api.ts  leads.api.ts  quoteRequests.api.ts
   │  │  ├─ quotations.api.ts  banners.api.ts  faqs.api.ts  content.api.ts
   │  │  ├─ users.api.ts  notifications.api.ts  reports.api.ts  settings.api.ts
   │  │  ├─ dashboard.api.ts  brands.api.ts  categories.api.ts  uploads.api.ts
   │  ├─ format.ts               # fils<->AED, formatMoney, formatDate, formatNumber
   │  ├─ money.ts                # filsToAed / aedToFils / displayPrice (null -> "On Request")
   │  ├─ slug.ts                 # PORT of storefront slugify (identical output)
   │  ├─ permissions.ts          # ROLE_PERMISSIONS map + can(perm) (mirrors backend)
   │  ├─ cn.ts                   # clsx + tailwind-merge
   │  └─ xlsx.ts                 # parse/preview + template generation
   │
   ├─ types/                     # shared TS types (ideally generated from backend)
   │  ├─ models.ts   enums.ts   api.ts (Paginated<T>, ApiError)   dto.ts
   │
   ├─ hooks/                     # TanStack Query hooks per domain (the real data layer)
   │  ├─ useAuth.ts
   │  ├─ products/  useProducts.ts useProduct.ts useProductMutations.ts useBulkImport.ts
   │  ├─ orders/    useOrders.ts useOrder.ts useOrderStatus.ts
   │  ├─ inventory/ useStockLevels.ts useStockMovements.ts useStockAdjust.ts
   │  ├─ ... (one folder per domain: customers, inquiries, leads, quoteRequests,
   │  │        quotations, banners, faqs, content, users, notifications, reports,
   │  │        dashboard, settings, taxonomy[brands/categories/subcategories/vehicles])
   │  ├─ usePermissions.ts        # can('product.write') etc.
   │  ├─ useDebounce.ts  usePagination.ts  useTableState.ts (sort/filter/page <-> URL)
   │
   ├─ components/                # REUSABLE, presentational (see §3)
   │  ├─ ui/        Button Input Select Textarea Checkbox Switch Badge Card
   │  │             Drawer Modal Tabs Dropdown Tooltip Spinner Skeleton EmptyState
   │  │             Pagination ConfirmDialog Avatar Money
   │  ├─ data/      DataTable/ (Table, Columns, Toolbar, Pagination, RowActions)
   │  ├─ form/      Form FormField TextField NumberField MoneyField SelectField
   │  │             TextareaField SwitchField TagsInput RichTextField AsyncSelect
   │  │             SpecsEditor FitmentEditor LineItemsEditor (field-array editors)
   │  ├─ media/     ImageUploader/ (Dropzone, SortableGrid, ImageCard, Cropper?)
   │  ├─ charts/    AreaChartCard BarChartCard LineChartCard PieChartCard ChartCard
   │  ├─ feedback/  StatusBadge KpiCard StatCard TrendDelta
   │  └─ layout/    AppShell Sidebar Topbar Breadcrumbs PageHeader RoleGate
   │                NotificationBell UserMenu CommandPalette(optional)
   │
   ├─ features/                  # screen-level code, one folder per domain
   │  ├─ auth/            LoginPage.tsx
   │  ├─ dashboard/       DashboardPage.tsx + widgets/
   │  ├─ products/        ProductsListPage ProductFormPage BulkImportPage + parts/
   │  ├─ inventory/       InventoryPage StockMovementsPage
   │  ├─ orders/          OrdersListPage OrderDetailPage
   │  ├─ customers/       CustomersListPage CustomerDetailPage
   │  ├─ inquiries/       InquiriesListPage InquiryDetailDrawer
   │  ├─ leads/           LeadsListPage
   │  ├─ quoteRequests/   QuoteRequestsListPage
   │  ├─ quotations/      QuotationsListPage QuotationFormPage QuotationDetailPage
   │  ├─ banners/         BannersPage
   │  ├─ faqs/            FaqsPage
   │  ├─ content/         ContentPagesList ContentEditorPage
   │  ├─ users/           UsersListPage UserFormDrawer RolesPage
   │  ├─ notifications/   NotificationsPage
   │  ├─ reports/         ReportsPage + report tabs
   │  └─ settings/        SettingsPage (tabbed)
   │
   └─ assets/                    # admin logo, favicon (NOT the storefront assets)
```

**Why `features/` + `components/` split:** `components/` is dumb/reusable and reused across every feature; `features/` composes them into screens and owns the route. Data hooks live in `hooks/` so they're testable and reusable from multiple screens (e.g. the Dashboard and Orders both read order counts).

#### 1.3 Routing with role-protected routes

Use **data-router** with nested layout routes. Two top-level branches: a bare `AuthLayout` (login) and the protected `AppShell`.

```
/login                         → AuthLayout > LoginPage          (public)
/                              → <AppShell> (guard: authenticated)
   index → /dashboard
   /dashboard                  perm: report.read (any authed staff sees KPIs scoped by role)
   /products                   perm: product.read
   /products/new               perm: product.write
   /products/:id/edit          perm: product.write
   /products/import            perm: product.write
   /inventory                  perm: inventory.read
   /inventory/movements        perm: inventory.read
   /orders                     perm: order.read
   /orders/:id                 perm: order.read
   /customers                  perm: customer.read
   /customers/:id              perm: customer.read
   /inquiries                  perm: lead.read
   /leads                      perm: lead.read
   /quote-requests             perm: lead.read   (+ quotation.read)
   /quotations                 perm: quotation.read
   /quotations/new             perm: quotation.write
   /quotations/:id             perm: quotation.read
   /banners                    perm: banner.write
   /faqs                       perm: faq.write
   /content                    perm: content.write
   /content/:slug              perm: content.write
   /users                      perm: user.manage
   /roles                      perm: user.manage
   /notifications              (any authed)
   /reports                    perm: report.read
   /settings                   perm: settings.write
   *                           → NotFound
```

Guard implementation — two layers:

- **`<RequireAuth>`** wraps the whole `AppShell`: if no valid session, `redirect('/login?from=…')` (done in the route `loader` so it runs before render).
- **`<RequirePermission perm="product.write">`** wraps individual routes (or a `requirePermission` in the route's `loader`). On fail → render a `403 Forbidden` panel (not a redirect, so deep links are debuggable).
- The **sidebar** (`config/nav.ts`) carries a `permission` per item; `<RoleGate>` hides items the user can't access so the menu only shows what each role can do. Menu hiding is UX; the route guard + server are the real enforcement.

```ts
// config/nav.ts (excerpt) — single source for sidebar + breadcrumbs
export const NAV: NavSection[] = [
  { items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "report.read" }] },
  { title: "Catalogue", items: [
    { label: "Products",   path: "/products",  icon: Package,  permission: "product.read" },
    { label: "Inventory",  path: "/inventory", icon: Boxes,    permission: "inventory.read" },
    { label: "Bulk Import",path: "/products/import", icon: Upload, permission: "product.write" },
  ]},
  { title: "Sales", items: [
    { label: "Orders",         path: "/orders",         icon: ShoppingCart, permission: "order.read" },
    { label: "Customers",      path: "/customers",      icon: Users,        permission: "customer.read" },
    { label: "Inquiries",      path: "/inquiries",      icon: MessageSquare,permission: "lead.read" },
    { label: "Leads",          path: "/leads",          icon: UserPlus,     permission: "lead.read" },
    { label: "Quote Requests", path: "/quote-requests", icon: FileQuestion, permission: "lead.read" },
    { label: "Quotations",     path: "/quotations",     icon: FileText,     permission: "quotation.read" },
  ]},
  { title: "Content", items: [
    { label: "Banners",  path: "/banners", icon: Image,    permission: "banner.write" },
    { label: "FAQ",      path: "/faqs",    icon: HelpCircle,permission: "faq.write" },
    { label: "Pages",    path: "/content", icon: FileEdit, permission: "content.write" },
  ]},
  { title: "System", items: [
    { label: "Reports",  path: "/reports",  icon: BarChart3, permission: "report.read" },
    { label: "Users & Roles", path: "/users", icon: ShieldCheck, permission: "user.manage" },
    { label: "Settings", path: "/settings", icon: Settings,  permission: "settings.write" },
  ]},
];
```

#### 1.4 Auth & token handling (JWT access + refresh)

Aligned to the data model (`AdminUser.refreshTokenHash`, rotation/revoke).

- **Access token**: short-lived JWT (~15 min). Held **in memory** (React state inside `AuthProvider`) — not localStorage — to limit XSS blast radius. Attached by the axios request interceptor as `Authorization: Bearer`.
- **Refresh token**: long-lived, delivered as an **HttpOnly, Secure, SameSite cookie** by the backend (`/auth/refresh`). The client never reads it. Refresh-token **rotation**: every refresh returns a new access token and rotates the cookie; backend stores `refreshTokenHash` for revoke.
- **Bootstrap on load**: `AuthProvider` calls `/auth/refresh` once on mount → gets an access token + the current `AdminUser` (id, name, role, `permissionOverrides`, avatar). While pending, show a full-screen splash. On 401 → unauthenticated → login.
- **Silent refresh on 401**: axios **response interceptor** catches `401`, calls `/auth/refresh` **once** (single-flight: queue concurrent failures behind one refresh promise), retries the original request. If refresh fails → hard logout (clear memory, redirect `/login`).
- **403 handling**: interceptor surfaces a toast ("You don't have permission") and the screen renders the Forbidden panel; never triggers a refresh loop.
- **Logout**: `POST /auth/logout` (server clears `refreshTokenHash` + cookie) → clear in-memory token + Query cache (`queryClient.clear()`) → redirect.
- **Google OAuth**: "Sign in with Google" button (admin sign-in is staff-only — backend must reject Google identities not matching a provisioned, active `AdminUser`). Flow: Google → backend verifies `sub` → issues the same access/refresh pair.
- **Permission resolution** lives client-side in `lib/permissions.ts`, mirroring the backend's static `ROLE_PERMISSIONS` map and applying `permissionOverrides` (`+perm`/`-perm`). `useAuth()` exposes `user`, `can(perm)`, `hasAnyRole(...)`. **This is convenience only** — every mutation is authorized again server-side.

```ts
// lib/permissions.ts — mirrors the canonical static map
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  "Super Admin": ["*"],
  "Sales Team": ["order.read","order.write","customer.read","lead.read","lead.write",
                 "quotation.read","quotation.write","report.read"],
  "Inventory Manager": ["product.read","product.write","product.delete",
                        "inventory.read","inventory.write","report.read"],
  "Marketing Manager": ["banner.write","content.write","faq.write"],
  "Viewer": ["product.read","inventory.read","order.read","customer.read",
             "lead.read","quotation.read","report.read"],
};
export function resolvePermissions(u: Pick<AdminUser,"role"|"permissionOverrides">): Set<Permission> {
  const base = ROLE_PERMISSIONS[u.role].includes("*")
    ? new Set(ALL_PERMISSIONS) : new Set(ROLE_PERMISSIONS[u.role]);
  for (const ov of u.permissionOverrides ?? []) {
    if (ov.startsWith("+")) base.add(ov.slice(1) as Permission);
    else if (ov.startsWith("-")) base.delete(ov.slice(1) as Permission);
  }
  return base;
}
```

#### 1.5 Data fetching layer (TanStack Query + axios)

Three tiers keep it clean:

1. **`lib/api/*.api.ts`** — thin typed functions over the axios instance. No React. `productsApi.list(params): Promise<Paginated<Product>>`, `productsApi.update(id, dto)`, etc. One file per domain.
2. **`hooks/<domain>/*`** — Query/Mutation hooks wrapping those functions. This is what screens import.
3. **`app/queryKeys.ts`** — a typed key factory so invalidation is consistent.

```ts
// app/queryKeys.ts
export const qk = {
  products: {
    all: ["products"] as const,
    list: (p: ProductQuery) => ["products", "list", p] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  orders: { all: ["orders"], list: (p)=>["orders","list",p], detail:(id)=>["orders","detail",id] },
  dashboard: { stats: (range)=>["dashboard","stats",range] },
  // …one block per domain
} as const;

// hooks/products/useProducts.ts
export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: qk.products.list(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,   // smooth pagination
  });
}
// hooks/products/useProductMutations.ts
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ProductUpdateDto }) => productsApi.update(id, dto),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: qk.products.detail(id) });
      qc.invalidateQueries({ queryKey: qk.products.all });
    },
  });
}
```

**Query defaults** (`queryClient.ts`): `staleTime: 30s` for lists, `retry: 1`, a global `onError` that ignores 401/403 (handled by interceptors) and toasts everything else. **Optimistic updates** for cheap toggles (product hide/activate, banner reorder, notification read, inquiry status). **Server-driven pagination/sort/filter**: list query params are encoded in the **URL search string** (via `useTableState`) so list views are shareable/back-button-safe and feed the Query key directly.

#### 1.6 Forms (react-hook-form + zod)

- One **zod schema per form** in the feature folder (`product.schema.ts`); inferred TS type is the form model. Resolver = `zodResolver(schema)`.
- **Field arrays** (`useFieldArray`) for: `specs[]`, `fitment[]`, `images[]`, order/quotation `items[]`, `altPartNumbers[]`, `highlights[]`, vehicle lists.
- **Money fields** edit in **AED** (human) but the schema `transform`s to **fils** on submit and the DTO carries fils; reverse on load. `price` is **nullable** → an empty money field submits `null` ⇒ backend sets availability "On Request". A `MoneyField` component encapsulates this.
- **Reusable field components** (`components/form/*`) bind to RHF via `useFormContext`, so feature forms are declarative: `<MoneyField name="price" label="Price" optional/>`.
- Cross-field rules in zod refinements (e.g. `compareAtPrice > price` when both set; quotation `lineTotal = unitPrice*qty`).

#### 1.7 Type sharing with the backend

Strong recommendation: a tiny **shared `packages/contracts`** (or a generated `types/models.ts`) so the admin's TS types are derived from the Mongoose schemas / DTOs rather than hand-kept. Options, in order of preference: (a) define request/response DTOs with **zod on the backend** and infer both sides; (b) generate OpenAPI from Express and run `openapi-typescript`; (c) at minimum, a hand-written `types/enums.ts` that is the literal copy of the **Enums Reference** so the admin never drifts from the canonical status lists.

---

### 2. Full screen inventory (mapped to spec)

For every screen: **Route**, **Permission**, **Shows**, **Actions**, **API**.

#### 2.1 Login — `/login`
- **Perm:** public.
- **Shows:** Spare Mec admin logo, email + password, "Sign in with Google", error banner, "forgot password?" (optional).
- **Actions:** submit credentials → store access token, bootstrap user, redirect to `from` or `/dashboard`; Google sign-in.
- **API:** `POST /auth/login`, `POST /auth/google`, `POST /auth/refresh` (bootstrap).

#### 2.2 Dashboard — `/dashboard`
- **Perm:** `report.read` (data **scoped by role** — Inventory Manager sees product/stock KPIs emphasized, Sales sees order/lead KPIs; Viewer read-only).
- **Shows — exact KPI count cards** (via `KpiCard`): **Total Products, Categories, Orders, Customers, Leads, Quote Requests, Revenue** (formatted AED from fils), and order-status counts **Pending, Processing, Delivered, Cancelled** (rendered from the canonical 8-status set; "Pending" = `Pending Verification`). A date-range selector (Today / 7d / 30d / Quarter / Custom) drives everything.
- **Shows — charts** (each in a `ChartCard`):
  - **Sales Overview** — area/line, revenue over time.
  - **Orders Overview** — stacked bar by status over time.
  - **Top Selling Products** — horizontal bar (by `salesCount`).
  - **Top Categories** — pie/donut (by `Category.productCount` or order lines).
  - **Customer Growth** — line, new customers over time.
- **Plus:** "Recent Orders" mini-table, "Latest Inquiries" list, **Low-stock alert** widget (links to Inventory filtered), unread Notifications peek.
- **Actions:** change range; click any KPI/segment → deep-link to the filtered list (e.g. Pending card → `/orders?status=Pending Verification`).
- **API:** `GET /dashboard/stats?range=…` (single aggregated payload: counts + series + top lists), backed by Order/Product/Customer/Inquiry/QuoteRequest aggregations.

#### 2.3 Products — list — `/products`
- **Perm:** `product.read` (write actions gated by `product.write`/`product.delete`).
- **Shows:** `DataTable` columns — thumbnail (`primaryImage`), Name, SKU, Part No, OEM, Brand, Category/Subcategory, **Price** (`Money`; "On Request" when null), Stock (`stockQuantity`), **Availability** (`StatusBadge`), **Status** (active/hidden/draft/archived), Featured/Trending flags, updatedAt. Server pagination + total count.
- **Filters/Toolbar:** debounced search (name/part/OEM/SKU/altPartNumbers via `searchTokens`), filter by Category, Subcategory, Brand, Status, Availability, Featured/Trending, "has price / On Request", price range; column-visibility; sort by created/updated/price/salesCount.
- **Row actions:** Edit, **Hide/Activate** (toggles `status` active↔hidden, optimistic), Duplicate, **Delete** (soft-delete via `isDeleted`, ConfirmDialog), quick toggles for Featured/Trending. **Bulk actions** (row selection): hide/activate/delete, set category, export selected.
- **Page actions:** "Add Product" → `/products/new`, "Bulk Import" → `/products/import`, "Export".
- **API:** `GET /products`, `PATCH /products/:id` (status/flags), `DELETE /products/:id`, `POST /products/bulk-action`.

#### 2.4 Products — add/edit form — `/products/new`, `/products/:id/edit`
- **Perm:** `product.write`.
- **Shows — ALL spec fields**, organized into tabbed/sectioned form (one `<Form>`, RHF + zod):
  - **Basics:** Name (auto-`slug` preview via ported `slugify`, editable), Brand (AsyncSelect → Brand), Category (Select), Subcategory (dependent Select on Category), Product Type, Product Family, legacy `type`, Condition (enum), `tags[]`, Featured/Trending switches, **Status** (active/hidden/draft/archived).
  - **Identifiers:** Part Number, OEM Number, SKU, `altPartNumbers[]` (TagsInput).
  - **Pricing & tax** (gated; `costPrice` only visible with `product.write`): **Price** (`MoneyField`, **optional → null = On Request**), Compare-at Price, **Cost Price**, Tax Rate (%), Currency (AED).
  - **Stock:** Stock Quantity, Low-Stock Threshold (note: authoritative stock is Inventory; form write updates default-warehouse level + logs a StockMovement server-side). Read-only computed **Availability** preview.
  - **Descriptions:** Short Description, **Rich-text** Description (Tiptap), `highlights[]` (key-features bullets).
  - **Specifications:** `SpecsEditor` field-array of `{label,value}` (add/remove/reorder).
  - **Vehicle Fitment:** `FitmentEditor` field-array — each row dependent selects Make → Model → Generation (with manual `engineType`, `yearStart/yearEnd`, `position`, `note`, `isVerified`). Writes the embedded `Product.fitment` **and** the Fitment collection rows.
  - **Attributes:** Material, Weight `{value,unit}`, Dimensions `{l,w,h,unit}`, Country of Origin, Warranty.
  - **Images:** `ImageUploader` — **multiple**, drag-**sortable** (dnd-kit), set primary, replace, delete, alt text. Uploads to Cloudinary (signed) → stores `{publicId,url,sortOrder,isPrimary}`.
  - **Relations:** `frequentlyBoughtWith[]`, `relatedProducts[]` (AsyncSelect multi).
- **Actions:** Save (create/update), Save as Draft, Save & Add another, Cancel; image add/replace/sort/delete/setPrimary; unsaved-changes guard (router blocker).
- **API:** `GET /products/:id`, `POST /products`, `PUT /products/:id`, `POST /uploads/sign` + Cloudinary direct upload, taxonomy fetches for selects.

#### 2.5 Bulk Import — `/products/import`
- **Perm:** `product.write`.
- **Shows:** **Download template** button (xlsx with the exact spec columns: Product ID, Product Name, Category, Subcategory, Brand, Product Type, SKU, Part Number, OEM Number, Price, Stock Quantity, Warranty, Description, Vehicle Fitment); Dropzone for `.xlsx/.csv`; a **client-side parsed preview grid** (SheetJS) with **per-row, per-cell validation** errors (zod row schema) — invalid rows highlighted with tooltips; summary chips (X valid, Y errors, Z will-create, W will-update by `externalId`/SKU).
- **Actions:** Upload file → preview; "Validate on server" (authoritative); **Import** (creates new + updates existing via upsert key `externalId`→`Product.externalId`); download an **error report** of failed rows; logs a `bulk_import` StockMovement + AuditLog server-side.
- **API:** `POST /products/import/validate` (multipart) → row results; `POST /products/import/commit` → `{created, updated, failed[]}`; `GET /products/import/template`.

#### 2.6 Inventory — `/inventory` (+ `/inventory/movements`)
- **Perm:** `inventory.read` (writes `inventory.write`).
- **Shows:** `DataTable` of **stock levels** per product (per warehouse; default warehouse selected, Warehouse switcher for future multi-WH): Product, SKU, Warehouse, On-hand `quantity`, `reserved`, **Available**, Threshold, **Stock Status** (`StatusBadge`: In/Low/Out), bin location, lastCountedAt. **Low-stock filter** + a prominent low-stock alert banner.
- **Actions:** **Update stock** (drawer: set/adjust ±, reason, type from StockMovement enum) → writes Inventory + appends StockMovement + recomputes `Product.stockQuantity`/availability; set threshold; cycle-count. Sub-page **Stock Movements** = append-only audit timeline (filter by product/warehouse/type/date) showing `quantityBefore→quantityAfter`, reason, performedBy.
- **API:** `GET /inventory`, `PATCH /inventory/:id/adjust`, `GET /inventory/movements`, `GET /inventory/low-stock`.

#### 2.7 Orders — list — `/orders`
- **Perm:** `order.read`.
- **Shows:** `DataTable` — `orderNumber`, Date, Customer (name; guest badge if `isGuest`), Phone, Items count, **Grand Total** (`Money`), **Status** (`StatusBadge`, 8-state), **Payment Status**, Source, Warehouse. Server pagination.
- **Filters:** status (8-state), payment status, source, date range, search (orderNumber/phone/customer name), guest-only.
- **Actions:** open detail; quick **status advance** (gated `order.write`); export.
- **API:** `GET /orders`.

#### 2.8 Orders — detail — `/orders/:id`
- **Perm:** `order.read` (mutations `order.write`).
- **Shows:** header (`orderNumber`, created, source, badges); **Items** table (snapshot: name, part/OEM/SKU, brand, unitPrice, qty, lineTotal, "On Request" flag); **Totals** (subtotal/tax/shipping/discount/grand, all fils→AED); **Customer block** (name/phone/email, link to Customer if not guest); **Shipping address snapshot**; **Vehicle** context; **Payment** (status/method); **Status History** timeline + **Notes** thread (`{text, by, at}`); milestone timestamps.
- **Actions — the 8-status workflow:** advance/set `status` ∈ [New, Pending Verification, Confirmed, Processing, Ready For Dispatch, Shipped, Delivered, Cancelled] via a guarded transition control (each change appends to `statusHistory`, sets the milestone timestamp, may fire notifications + stock reservation/release). Cancel (capture `cancellationReason`). Update payment status/method. **Add note.** Assign warehouse. Print/PDF (optional). Convert-from-inquiry linkage shown if applicable.
- **API:** `GET /orders/:id`, `PATCH /orders/:id/status`, `PATCH /orders/:id/payment`, `POST /orders/:id/notes`.

#### 2.9 Customers — list — `/customers`
- **Perm:** `customer.read`.
- **Shows:** Name, Email, Phone, Auth provider, #Orders, #Vehicles, marketingOptIn, isActive, lastLoginAt, createdAt.
- **Filters/search:** name/email/phone, provider, active.
- **Actions:** open profile; deactivate/reactivate; export.
- **API:** `GET /customers`.

#### 2.10 Customers — detail — `/customers/:id`
- **Perm:** `customer.read`.
- **Shows (tabbed):** **Profile** (contact, provider, verified, marketing, active); **Orders** (their order history table → links to order detail); **Wishlist** (server Wishlist items); **Vehicles** (`VehicleInfo` list: brand/model/generation/year/engine/VIN); **Inquiries** (their Inquiry rows); **Quote Requests**; **Addresses** (saved addresses). Mirrors the "Customers: info, orders, wishlist, vehicle details, inquiry history, quote requests" requirement.
- **Actions:** deactivate/reactivate, edit basic fields (limited), start a Quotation for them, add an internal note.
- **API:** `GET /customers/:id` (+ `?include=orders,wishlist,vehicles,inquiries,quotes,addresses` or sub-routes).

#### 2.11 Inquiries — `/inquiries`
- **Perm:** `lead.read` (status updates `lead.write`).
- **Shows:** unified `DataTable` over **all sources** — `inquiryNumber`, **Source** (`StatusBadge`: WhatsApp Inquiry / Chatbot / Contact Form / Quote Request), customerName, phone, vehicle summary, partRequired/partNumber, **Status** pipeline (New→Contacted→Quoted→Converted→Closed), assignedTo, createdAt.
- **Filters:** source, status, assignee, date, phone search. Optional **Kanban** view by status (drag to change status).
- **Row/detail (Drawer `InquiryDetailDrawer`):** full fields + items + **the generated `whatsappMessage`** and `whatsappLink` (CRM copy per spec); page/referrer.
- **Actions:** change status (pipeline), assign to staff, **open WhatsApp** (`whatsappLink`), **convert → Quotation** or **→ Order**, add note.
- **API:** `GET /inquiries`, `PATCH /inquiries/:id` (status/assignee), `POST /inquiries/:id/convert`.

#### 2.12 Leads — `/leads`
- **Perm:** `lead.read` / `lead.write`.
- **Shows:** chatbot-generated leads — name, phone, email, vehicle, partRequired, **source**, **status** (same 5-stage), assignedTo, **`slaDueAt`** (the "contact within 1 hour" SLA — show countdown / overdue badge), sourceInquiry link.
- **Actions:** assign, change status, convert (→ Quotation/Order), add notes, open source inquiry.
- **API:** `GET /leads`, `PATCH /leads/:id`.

#### 2.13 Quote Requests — `/quote-requests`
- **Perm:** `lead.read` (+ `quotation.read`).
- **Shows:** `requestNumber`, customerName, **mobile** (required), vehicle, items/quantity, notes, **status**, linked `inquiry`, produced `quotation`.
- **Actions:** assign, status, **Create Quotation from request** (pre-fills the Quotation form), open mirrored Inquiry.
- **API:** `GET /quote-requests`, `PATCH /quote-requests/:id`, `POST /quote-requests/:id/create-quotation`.

#### 2.14 Quotations — list / create / detail — `/quotations`, `/quotations/new`, `/quotations/:id`
- **Perm:** `quotation.read` (write `quotation.write`).
- **List shows:** `quotationNumber`, customerName, **Status** (`StatusBadge`: Draft/Sent/Approved/Rejected/Expired), grandTotal, validUntil (expiry badge), createdBy, createdAt.
- **Create/Edit form (RHF + zod):** customer fields (or pick existing Customer), vehicle, **`items[]`** field-array (`LineItemsEditor`: product picker or free part, qty, unitPrice in AED→fils, auto lineTotal, taxRate), discount, computed subtotal/tax/grand (fils), validUntil, notes/terms; pre-fill from source Inquiry/QuoteRequest.
- **Detail shows:** full quote, status timeline, generated **PDF** (`pdfFile`), source links, convertedOrder link.
- **Actions:** Save Draft, **Send** (→ status Sent, `sentAt`, generate+attach PDF, email/WhatsApp), mark Approved/Rejected, **convert Approved → Order**, duplicate, expire.
- **API:** `GET /quotations`, `GET /quotations/:id`, `POST /quotations`, `PUT /quotations/:id`, `POST /quotations/:id/send`, `PATCH /quotations/:id/status`, `POST /quotations/:id/convert`.

#### 2.15 Banners — `/banners`
- **Perm:** `banner.write`.
- **Shows:** grouped by **placement** (home-hero/home-strip/category-top/promo); each card: image (+ mobileImage), title/subtitle, CTA, schedule (startAt/endAt), active toggle, sortOrder. **dnd-kit drag-reorder.**
- **Actions:** upload/create (Cloudinary), edit (Drawer), **drag-reorder** (persist `sortOrder`), **hide/show** (`isActive`), schedule, delete.
- **API:** `GET /banners`, `POST /banners`, `PUT /banners/:id`, `PATCH /banners/reorder`, `DELETE /banners/:id`.

#### 2.16 FAQ — `/faqs`
- **Perm:** `faq.write`.
- **Shows:** list grouped by category, question/answer (answer expandable), sortOrder, active toggle; drag-reorder.
- **Actions:** add/edit/delete (Modal/Drawer), reorder, toggle active.
- **API:** `GET /faqs`, `POST /faqs`, `PUT /faqs/:id`, `DELETE /faqs/:id`, `PATCH /faqs/reorder`.

#### 2.17 Content pages — `/content`, `/content/:slug`
- **Perm:** `content.write`.
- **List shows:** the editable `ContentPage` slugs (about, contact, terms, privacy, returns) with published state + version + updatedBy/updatedAt.
- **Editor shows:** title, **Tiptap rich-text body**, metaTitle/metaDescription (SEO), isPublished, live preview, version bump on save. (**Contact's structured** phone/address/hours/social live in **Settings**, not here — per the data-model note.)
- **Actions:** edit, publish/unpublish, save (version++), preview.
- **API:** `GET /content`, `GET /content/:slug`, `PUT /content/:slug`.

#### 2.18 Users & Roles — `/users`, `/roles`
- **Perm:** `user.manage`.
- **Users list shows:** name, email, **role** (badge), isActive, lastLoginAt, createdBy.
- **User actions:** invite/create (UserFormDrawer: name/email/role/phone/avatar, temp password or invite), edit role, **`permissionOverrides`** editor (+/- specific perms), **deactivate** (Super Admin can't be deleted — only deactivated, enforced server-side and disabled in UI), reset password.
- **Roles page shows:** the 5 roles and their resolved permission matrix (read-only by default, sourced from the static map; editable only if the optional `Role` collection is enabled later — UI is built to toggle into editable mode).
- **API:** `GET /users`, `POST /users`, `PUT /users/:id`, `PATCH /users/:id/deactivate`, `GET /roles`.

#### 2.19 Notifications center — `/notifications` (+ Topbar bell)
- **Perm:** any authenticated (filtered by `recipient`/`recipientRole`).
- **Shows:** list of `Notification`s — type (New Order/New Inquiry/New Quote Request/Low Stock/Order Status/System), severity (info/warning/critical color), title/message, reference link, read state, time; channel/delivery status. **Topbar `NotificationBell`** shows unread count + dropdown of latest (polled or via SSE/WebSocket if backend supports).
- **Actions:** mark read / mark all read (optimistic), click → deep-link to referenced entity, filter unread/type.
- **API:** `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, unread-count poll.

#### 2.20 Reports — `/reports`
- **Perm:** `report.read`.
- **Shows (tabbed):** **Sales, Orders, Products, Customers, Inquiries** reports — each a parameterized table + summary chart (date range, grouping). E.g. Sales by period, Orders by status, Top Products by salesCount/revenue, Customer growth/retention, Inquiry funnel by source/status.
- **Actions:** run with filters; **Export Excel / CSV / PDF** (CSV/Excel via SheetJS or server; PDF server-generated for fidelity). Exports logged as `export` in AuditLog.
- **API:** `GET /reports/:type?…`, `GET /reports/:type/export?format=xlsx|csv|pdf`.

#### 2.21 Settings — `/settings`
- **Perm:** `settings.write`.
- **Shows (tabbed, backed by `Setting/SiteConfig` "global" doc — replaces `siteConfig.js`):**
  - **Brand:** name/fullName/legalName/tagline/foundedYear/logo.
  - **Contact:** whatsappNumber (default `971507855298`), phoneNumber, displays, email, address, mapsUrl, hours.
  - **Social:** instagram/facebook/tiktok/youtube.
  - **Service Areas:** GCC list (TagsInput).
  - **WhatsApp greeting** text.
  - **Defaults:** currency (AED), taxRate (5), lowStockThreshold (5).
  - **Feature flags:** `paymentsEnabled`, `chatbotEnabled`, **`comingSoon`** (the existing `IS_COMING_SOON` toggle, now data-driven), plus **Warehouses** management (add/edit, set default) since multi-warehouse is settings-adjacent.
- **Actions:** edit + save each section (cached aggressively, read-mostly).
- **API:** `GET /settings`, `PUT /settings`, `GET/POST/PUT /warehouses`.

---

### 3. Reusable component breakdown

Presentational, in `components/`, consumed by every `features/` screen. Each lists **props** and **where used**.

#### Data & tables
- **`DataTable<T>`** — wraps TanStack Table v8. Props: `columns`, `data`, `pageCount`, `state`(sort/filter/pagination/selection), `onStateChange`, `isLoading`, `onRowClick`, `renderToolbar`, `enableSelection`, `emptyState`. Sub-parts: `DataTableToolbar` (search + filter chips + column toggle + bulk-action bar), `DataTablePagination`, `RowActions` (dropdown). Drives Products, Orders, Customers, Inquiries, Leads, Quote Requests, Quotations, Inventory, Users, Notifications, Reports. Loading → `Skeleton` rows; empty → `EmptyState`.

#### Form primitives (`components/form/`) — all RHF-context-bound
- **`Form`** (provides `FormProvider`, submit handling, server-error mapping), **`FormField`** (label/description/error wrapper). Inputs: **`TextField`, `NumberField`, `MoneyField`** (AED↔fils, optional→null for "On Request"), **`SelectField`, `AsyncSelect`** (async option load for Brand/Category/Product pickers), **`TextareaField`, `SwitchField`, `CheckboxField`, `TagsInput`, `RichTextField`** (Tiptap). Composite field-array editors: **`SpecsEditor`** (`{label,value}[]`), **`FitmentEditor`** (Make→Model→Generation dependent selects + engine/years/position), **`LineItemsEditor`** (order/quotation items with live line totals), **`ImageField`** wrapper. Used across Product form, Quotation form, Settings, Banner/FAQ/Content/User drawers.

#### Media
- **`ImageUploader`** — Props: `value: ProductImage[]`, `onChange`, `multiple`, `maxFiles`, `folder`, `aspect?`. Internals: **Dropzone** (drag/drop + picker), Cloudinary signed direct-upload with progress, **`SortableImageGrid`** (dnd-kit) for reorder, **`ImageCard`** (set-primary, replace, delete, alt-text edit). Single-image mode for Banner/Brand/Category logos/avatars. Used in Product form (multiple, sortable, replaceable — exact spec), Banners, Settings (logos), Users (avatar).

#### Status / KPIs / charts
- **`StatusBadge`** — the admin analogue of the storefront `AvailabilityBadge`, generalized. Props: `value`, `kind` ∈ `order|payment|inquiry|lead|quote|quotation|product|stock|banner|notificationSeverity|source`. A central **`statusColorMap`** (in `lib/`) maps every canonical enum value → Tailwind color/tone, so all statuses render consistently (and stay in sync with the Enums Reference). Used everywhere a status appears.
- **`KpiCard`** — Props: `label, value, format(number|money|percent), icon, trend?{value,direction}, onClick, isLoading`. Renders the Dashboard count cards (Total Products … Cancelled Orders), `Money` for Revenue, optional `TrendDelta`. `StatCard` is a denser variant for sub-pages.
- **Chart wrappers** (`components/charts/`) — **`ChartCard`** (title, range/legend, loading/empty, fixed responsive height) wrapping Recharts: **`AreaChartCard`** (Sales Overview), **`BarChartCard`** (Orders Overview, Top Selling Products), **`LineChartCard`** (Customer Growth), **`PieChartCard`** (Top Categories). Props: `data`, `series`, `xKey`, formatters (money/number/date). Keeps Recharts imports isolated for tree-shaking + a single theme.

#### Overlays & feedback (`components/ui/`)
- **`Drawer`** (slide-over: inquiry detail, stock adjust, user/banner/FAQ edit), **`Modal`**, **`ConfirmDialog`** (destructive deletes/status changes; typed confirm), **`Tabs`** (Product form sections, Customer detail, Reports, Settings), **`Dropdown`/`Menu`**, **`Tooltip`**, **`Pagination`**, **`Spinner`/`Skeleton`** (loading states), **`EmptyState`**, **`Money`** (renders fils→`AED 0.00`, or "On Request" when null — the single money-display component), **`Avatar`**, **`Badge`**, **`Button`/`Input`/`Select`/`Switch`** base primitives.

#### Layout & access control (`components/layout/`)
- **`AppShell`** — Sidebar + Topbar + `<Outlet>` + breadcrumbs; responsive (collapsible sidebar).
- **`Sidebar`** — renders `config/nav.ts`, each item wrapped in **`RoleGate`** so users see only permitted sections (**role-gated menu**); active-route highlight.
- **`Topbar`** — global search (optional command palette), **`NotificationBell`** (unread count + dropdown), **`UserMenu`** (profile, role, logout).
- **`PageHeader`** (title + actions slot + breadcrumbs), **`Breadcrumbs`** (derived from route + nav).
- **`RoleGate`** — Props: `permission | anyOf | role`; renders children only if `useAuth().can(...)`. Used for menu items, action buttons (hide "Delete" without `product.delete`), and gated fields (hide `costPrice`/margins). **`RequireAuth`** / **`RequirePermission`** are the route-level guards.

---

#### Notes on consistency with the existing storefront
- **Theme:** port the storefront's `tailwind.config.js` tokens (`ink`, `accent` driven by `--accent`/`--accent-strong` CSS vars, `Sora`/`Inter` fonts, custom shadows) into `admin/tailwind.config.ts` and copy the `--accent` vars into the admin `index.css`, so admin and storefront read as one brand. (Admin will lean on a denser, lighter UI — but same accent + type.)
- **Shared logic ported (not imported, since storefront is JS/CRA):** `slugify` (identical algorithm for slug previews in Product/Category/Subcategory forms), the **status-map badge pattern** (`AvailabilityBadge` → generalized `StatusBadge`), and the **fils money** convention. The storefront's `InquiryContext`/`WishlistContext` localStorage shapes inform the **InquiryItem/CartItem/Wishlist** snapshot fields the admin reads.
- **Source of truth migration:** `siteConfig.js` → the **Settings** screen (`Setting/SiteConfig` doc); the static `IS_COMING_SOON` flag → Settings → `features.comingSoon`. The admin is where staff now edit what used to be hardcoded.

**Relevant existing files referenced for grounding (all absolute):** `/home/nibras-s/Desktop/Projects/sm-auto/src/config/siteConfig.js`, `/home/nibras-s/Desktop/Projects/sm-auto/src/context/InquiryContext.jsx`, `/home/nibras-s/Desktop/Projects/sm-auto/src/context/WishlistContext.jsx`, `/home/nibras-s/Desktop/Projects/sm-auto/src/utils/whatsapp.js`, `/home/nibras-s/Desktop/Projects/sm-auto/src/utils/slug.js`, `/home/nibras-s/Desktop/Projects/sm-auto/src/components/ui/AvailabilityBadge.jsx`, `/home/nibras-s/Desktop/Projects/sm-auto/tailwind.config.js`, `/home/nibras-s/Desktop/Projects/sm-auto/src/App.js`, `/home/nibras-s/Desktop/Projects/sm-auto/src/data/products.js`. The new admin app should be scaffolded at `/home/nibras-s/Desktop/Projects/sm-auto/admin/`.


---

## 5. Storefront Integration Plan

### Storefront Evolution Plan — Spare Mec (CRA → API-connected)

Guiding principle: **adapter-first, page-by-page, zero rewrite.** Every existing import of `src/data/*.js` is replaced by a same-named hook that returns the **same product/category shape** the components already consume. Pages keep their JSX; only their data source changes. The static `src/data/*.js` files stay in the repo as the **mock fallback** until each page is cut over, then are deleted last.

#### 0. Foundational decisions that de-risk everything

- **Keep CRA.** Add `react-scripts` env: new file `.env` with `REACT_APP_API_URL`, `REACT_APP_GOOGLE_CLIENT_ID`, `REACT_APP_CLOUDINARY_BASE`. (CRA only exposes `REACT_APP_*`.)
- **Field-name bridge is the crux.** The API returns the canonical model (`primaryImage.url`, `brandName`, `price` in fils, `availability` enum `On Request`, etc.); existing components expect `imageKey`, `brand` (string), `categoryName`, `availability` of `"Made to Order"`/`"Limited Stock"`. A single **DTO normalizer** (`src/api/normalize.js`) maps API → component shape so I touch components minimally. Crucially it sets `product.image = primaryImage?.url` and makes `getProductImage` fall back to that URL when `imageKey` is absent.
- **Money:** API stores fils. A `formatPrice(fils, currency)` util (`src/utils/money.js`) renders `AED 219.99`; `null → null` so callers show "On Request".

#### 1. Replace static `src/data/*.js` with API + TanStack Query (keep pages working during migration)

**New files:**
- `src/api/client.js` — `axios` instance: `baseURL` from env, `withCredentials` (refresh cookie), request interceptor injects `Authorization: Bearer <access>`, response interceptor does 401 → refresh → retry, then logout-on-fail. (Guest requests simply omit the header.)
- `src/api/endpoints.js` — typed-ish path builders for every resource (`products`, `categories`, `subcategories`, `brands`, `inquiries`, `quote-requests`, `orders`, `cart`, `wishlist`, `auth`, `content`, `banners`, `faqs`, `search`, `me`, `vehicles`).
- `src/api/normalize.js` — `normalizeProduct`, `normalizeCategory`, `normalizeBrand` (API → existing component shape, incl. availability enum remap and `primaryImage.url`).
- `src/api/queryClient.js` — `QueryClient` (staleTime 5 min for catalogue, retry off for 4xx).
- **Query hooks** (one file per domain, the literal drop-in replacements for the data selectors):
  - `src/api/hooks/useProducts.js` → `useProducts(filters)`, `useProduct(slug)`, `useFeaturedProducts()`, `useTrendingProducts()`, `useRelatedProducts(slug)`, `useProductBrands()` — names mirror the current `featuredProducts`, `trendingProducts`, `getProductBySlug`, `getRelatedProducts`, `productBrands` exports so swap is mechanical.
  - `src/api/hooks/useCategories.js` → `useCategories()`, `useCategory(slug)`, `useProductsByCategory(slug)`.
  - `src/api/hooks/useSearch.js`, `useSiteConfig.js`, `useContentPage.js`, `useBanners.js`, `useFaqs.js`.

**Migration mechanic (keeps everything green):** keep `src/data/products.js` etc. as-is. For each page, switch its import from `../data/products` to `../api/hooks/useProducts`, add a `isLoading`/`isError` branch (skeleton + retry), and render from the hook. Because the normalizer reshapes API data back to the legacy shape, the existing `ProductCard`, `AvailabilityBadge`, `Breadcrumbs`, etc. need **no change** for the read path. Cut over in this order: Catalogue → Category/Categories → ProductDetail → Home sections → Wishlist → Faqs/Contact/About/Returns (content) → Navbar search. Delete `src/data/*.js` only after the last consumer is migrated.

**Existing files changed (read path):** `src/index.js` (wrap `<QueryClientProvider>`), `src/pages/Catalogue.jsx`, `src/pages/Category.jsx`, `src/pages/Categories.jsx`, `src/pages/Home.jsx`, `src/components/home/{FeaturedProducts,CategoriesSection,BrandsSection,FaqPreview,TestimonialsSection}.jsx`, `src/pages/Wishlist.jsx`, `src/pages/Faqs.jsx`, `src/components/layout/Footer.jsx` + `Navbar.jsx` (consume `useSiteConfig` instead of `siteConfig.js`). `src/utils/productImages.js` gains a URL fallback. `src/config/siteConfig.js` is kept as the **bootstrap default** that `useSiteConfig` falls back to before the Setting API responds (so contact/WhatsApp never break).

> Note `Catalogue.jsx` currently filters/sorts **client-side over the full array**. At 50k+ products that must become **server-driven**: `useProducts` sends `{ q, category, brand[], availability[], type[], sort, page }` to `GET /products`; the API does the filtering/paging/text-search. The filter UI (FilterGroup/CheckRow/RadioRow) stays; only `filtered = useMemo(...)` is replaced by the query result + facet counts from the API. Add pagination/infinite-scroll (page already has the grid).

#### 2. Reconcile business model: optional price + "On Request"

- **Kill the mock-price hack** in `ProductCard.jsx` (`getMockPriceAndRating`). Replace with real `product.price` (fils → `formatPrice`). New `src/components/ui/PriceBlock.jsx`: if `price == null` → render **"On Request"** + availability badge; else render price (+ `compareAtPrice` strikethrough). Ratings: hide until reviews exist (or read `ratingAvg`).
- **`AvailabilityBadge.jsx`**: extend `MAP` to the 4 canonical enums `In Stock | Low Stock | Out of Stock | On Request` (keep legacy keys aliased so mixed data renders during migration).
- **`ProductDetail.jsx`** "Best price on inquiry" card becomes price-aware: priced product → price + **Add to Cart** (checkout-eligible) + secondary WhatsApp/Quote; unpriced → **"On Request"** with WhatsApp Inquiry + Request a Quote as primary CTAs (no Add-to-Cart-for-checkout).
- **Cart split:** `InquiryContext` stays for the WhatsApp inquiry list, but priced items can also go to a true checkout cart. Introduce `src/context/CartContext.jsx` (see §3) so "On Request" items route to inquiry while priced items route to checkout. `ProductCard`/`ProductDetail` "Add to Cart" dispatches to **CartContext** when priced, **InquiryContext** when on-request (or both, with the button label adapting).

#### 3. Three purchase methods

**(A) WhatsApp Inquiry — keep message-building AND POST to CRM.**
- Keep `src/utils/whatsapp.js` exactly (it builds the message body). New `src/api/inquiries.js` `createInquiry(payload)` → `POST /inquiries` with `source: "WhatsApp Inquiry"`, the structured fields, and the generated `whatsappMessage`/`whatsappLink` (so the CRM keeps the copy per spec).
- **`InquiryDrawer.jsx` change:** the "Send Inquiry on WhatsApp" handler first `await createInquiry(...)` (fire-and-forget with optimistic UX — never block the wa.me open), then opens the wa.me link. Map the drawer's `customer` fields (`name, phone, carMake→vehicle.brand, carModel→vehicle.model, year→vehicle.year, vin→vehicle.vin, emirate, notes`) + `items[]` → Inquiry DTO. Same treatment for `productWaLink` on ProductDetail (single-item inquiry).

**(B) Direct Checkout — guest allowed, min field = Customer Name, → Order "Pending Verification".**
- **New context** `src/context/CartContext.jsx` (localStorage `sparemec_cart_v1`; mirrors InquiryContext API: `addItem/removeItem/setQty/clear/count/subtotal`; only priced products). On login, **merge** guest cart into server `Cart` (`POST /cart/merge`), then read/write server cart via `useCart` hook.
- **New components/pages:**
  - `src/components/layout/CartDrawer.jsx` — priced-cart drawer (separate from InquiryDrawer) with line totals + "Checkout".
  - `src/pages/Cart.jsx` (route `/cart`) — full cart page.
  - `src/pages/Checkout.jsx` (route `/checkout`) — guest-friendly form: **required Customer Name**; optional phone/email/address/vehicle; payment method optional (`None`/`COD`/`Bank Transfer`). Submits `POST /orders` → server creates Order in `New` then transitions to **Pending Verification**; returns `orderNumber`.
  - `src/pages/OrderConfirmation.jsx` (route `/order/confirmation/:orderNumber`) — confirmation screen ("We'll verify and contact you"). Guest order lookup by `orderNumber`+phone.
- **New api:** `src/api/orders.js` (`createOrder`, `getOrderByNumber`, `getMyOrders`).

**(C) Request a Quote — → QuoteRequest in CRM.**
- **New** `src/components/forms/QuoteRequestModal.jsx` + page `src/pages/RequestQuote.jsx` (route `/request-quote`, also openable as a modal from ProductDetail/Cart). Fields per spec: name, **mobile (required)**, vehicle details, quantity, notes, optional product context. `POST /quote-requests` (`src/api/quotes.js`). Success → "Our team will send your quote shortly."

#### 4. Optional auth + My Account (preserve guest browsing)

- **New** `src/context/AuthContext.jsx` — holds `user`, `accessToken` (in memory), `isAuthenticated`; methods `login`, `register`, `googleLogin`, `logout`, `refresh`. Access token in memory; refresh via httpOnly cookie (interceptor in `client.js`). **Guest = no provider gating**; nothing in the public site requires auth.
- **New api:** `src/api/auth.js` (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/google`, `/auth/logout`, `/auth/me`).
- **New pages (routes):** `src/pages/auth/Login.jsx` (`/login`), `Register.jsx` (`/register`), `ForgotPassword.jsx` (`/forgot-password`). Google via `@react-oauth/google` (new dep) → send `credential` to `/auth/google`.
- **New** `src/components/auth/RequireAuth.jsx` — wrapper that redirects to `/login?next=` only for account routes.
- **My Account** under `/account/*` with a new `src/pages/account/AccountLayout.jsx` (sidebar nav) + children, each a route:
  - `Dashboard.jsx` (`/account`), `Profile.jsx` (`/account/profile`), `Addresses.jsx` (`/account/addresses`), `WishlistAccount.jsx` (`/account/wishlist`), `Orders.jsx` (`/account/orders`) + `OrderDetail.jsx` (`/account/orders/:orderNumber`), `Inquiries.jsx` (`/account/inquiries`), `Vehicles.jsx` (`/account/vehicles`), `Quotes.jsx` (`/account/quotes`).
  - api hooks: `src/api/hooks/useAccount.js` (`useMe`, `useMyOrders`, `useMyInquiries`, `useMyQuoteRequests`, `useAddresses`, `useVehicles`).
- **Existing changed:** `src/index.js` (wrap `<AuthProvider>` + `<GoogleOAuthProvider>`), `src/components/layout/Navbar.jsx` (add account/login affordance + cart icon), `src/App.js` (new routes; see §9).

#### 5. Product Detail enhancements (spec parity)

`src/pages/ProductDetail.jsx` is the largest single edit. Additions, all fed by the richer product DTO + new endpoints:
- **Image gallery:** replace single `<img>` with `src/components/product/ImageGallery.jsx` (sortable `images[]` thumbnails + zoom). Fallback to `primaryImage`.
- **Identifiers block:** show **OEM Number, SKU, Brand, part number, category/subcategory** (currently only partNumber).
- **PriceBlock** (§2) + availability (4-enum).
- **Specifications tab:** render from `specs[]` plus structured `material/weight/dimensions/countryOfOrigin/warranty/condition/OEM` (spec lists these explicitly).
- **Fitment tab:** upgrade from string list to structured **Brand/Model/Generation/Engine Type/Year Range** table from `product.fitment[]` (new `src/components/product/FitmentTable.jsx`).
- **Key features:** keep `highlights` bullets.
- **Related / Similar / Frequently Bought Together / Recently Viewed**, each a `ProductCard` carousel:
  - `useRelatedProducts(slug)` + `GET /products/:slug/similar` + `product.frequentlyBoughtWith`.
  - `src/components/product/RecentlyViewed.jsx` backed by **new** `src/context/RecentlyViewedContext.jsx` (localStorage `sparemec_recent_v1`, cap 20; for logged-in users also `GET/POST /me/recently-viewed`). ProductDetail pushes the current product on mount; also `POST /products/:slug/view` to bump `viewCount`.
- New folder `src/components/product/` houses these so ProductDetail's body stays readable.

#### 6. Search wired to API (name / partNumber / OEM / SKU / brand / model)

- **New** `src/api/hooks/useSearch.js` → `useSearchSuggest(q)` (debounced typeahead, `GET /search/suggest`) and the Catalogue list query (`GET /products?q=`).
- **New** `src/components/search/SearchAutocomplete.jsx` — used by Navbar; shows grouped results (Products / Part Numbers / Vehicles). Handles paste-an-exact-code (`A4602407018`) since the API normalizes codes/`searchTokens`.
- **Existing changed:** `src/components/layout/Navbar.jsx` — replace the two raw `<form>` blocks that do `window.location.href = /catalogue?q=...` with the autocomplete component (still navigates to `/catalogue?q=` on submit, but adds suggestions + direct product jump). `src/pages/Catalogue.jsx` search input bound to the same server query.

#### 7. Chatbot / Inquiry Assistant → CRM Lead

`src/components/layout/ChatWidget.jsx` already implements the exact multi-step flow (Brand → Model → Year → Part → Phone → Notes → Summary) and even has a **Name** gap — spec wants Name too. Changes:
- Add a **Name** step (and keep Phone) so the lead matches `{ name, phone, vehicle.brand, vehicle.model, vehicle.year, partRequired, notes }`.
- On the Summary submit, **before** opening WhatsApp, `await createLead(payload)` → **new** `src/api/leads.js` `POST /leads` (source `Chatbot`), then show the spec line **"Thank you. Our sales team will contact you within 1 hour."** Keep the existing WhatsApp send button as a secondary action. (The server also mirrors a Lead into the unified Inquiry feed per the data model.)
- Keep all the existing UI/animation; this is purely wiring the submit handler + one extra step.

#### 8. Wishlist: server for logged-in, localStorage for guests, merge on login

- **`src/context/WishlistContext.jsx` change:** when `isAuthenticated`, proxy to server (`GET/POST/DELETE /wishlist` via new `src/api/wishlist.js` + `useWishlist` query); when guest, keep current localStorage behavior. On login, `POST /wishlist/merge` with local items, then clear local and switch to server source. Public API (`toggleWishlist`, `hasWishlist`, `wishlistCount`) stays identical, so `ProductCard.jsx` and `Wishlist.jsx` don't change.
- `src/pages/Wishlist.jsx` currently filters the static `products` array by wishlist slugs — change it to hydrate items from the wishlist DTO (which already snapshots slug/name/image) or `useProducts({ slugs })`.

#### 9. Retire the `IS_COMING_SOON` flag

- Source of truth moves to the API: `Setting.features.comingSoon`. **`src/App.js` change:** replace the hardcoded `const IS_COMING_SOON = true` with `useSiteConfig().features.comingSoon`, keeping the existing `?preview=true` sessionStorage bypass for staging. While the config loads, default to the env value `REACT_APP_COMING_SOON` (so first paint is correct and there's no flash). Flip it from the **CRM Marketing settings** with no redeploy. Final step of the project; until then leave the flag, just make it config-driven.

---
#### New dependencies to add
`@tanstack/react-query`, `axios`, `@react-oauth/google`. (Optional: `react-hot-toast` for confirmations, `react-helmet-async` if `useSEO` needs upgrading — current `useSEO.js` can stay.)

#### Summary — NEW files / routes
- **API layer:** `src/api/{client,endpoints,normalize,queryClient,auth,inquiries,orders,quotes,leads,wishlist,cart}.js` + `src/api/hooks/{useProducts,useCategories,useSearch,useSiteConfig,useContentPage,useBanners,useFaqs,useAccount,useCart}.js`
- **Contexts:** `src/context/{AuthContext,CartContext,RecentlyViewedContext}.jsx` (+ edits to `InquiryContext`, `WishlistContext`)
- **Utils:** `src/utils/money.js`
- **Components:** `src/components/ui/{PriceBlock}.jsx`; `src/components/layout/CartDrawer.jsx`; `src/components/product/{ImageGallery,FitmentTable,RecentlyViewed,ProductCarousel}.jsx`; `src/components/forms/QuoteRequestModal.jsx`; `src/components/search/SearchAutocomplete.jsx`; `src/components/auth/RequireAuth.jsx`
- **Pages / routes:** `/cart` `Cart.jsx`, `/checkout` `Checkout.jsx`, `/order/confirmation/:orderNumber` `OrderConfirmation.jsx`, `/request-quote` `RequestQuote.jsx`, `/login` `/register` `/forgot-password` (`src/pages/auth/*`), and `/account/*` (`src/pages/account/{AccountLayout,Dashboard,Profile,Addresses,WishlistAccount,Orders,OrderDetail,Inquiries,Vehicles,Quotes}.jsx`)

#### Summary — EXISTING files that change
- `src/index.js` (QueryClient + Auth + Google + Cart/RecentlyViewed providers)
- `src/App.js` (new routes; config-driven coming-soon)
- `src/pages/{Catalogue,Category,Categories,Home,ProductDetail,Wishlist,Faqs,Contact,About,Returns}.jsx` (read from hooks)
- `src/components/home/{FeaturedProducts,CategoriesSection,BrandsSection,FaqPreview,TestimonialsSection}.jsx` (read from hooks)
- `src/components/layout/{Navbar,Footer,InquiryDrawer,ChatWidget,Layout}.jsx` (search autocomplete, site-config, CRM POST on inquiry, lead capture, mount CartDrawer)
- `src/components/ui/{ProductCard,AvailabilityBadge}.jsx` (real price via PriceBlock, 4-enum availability)
- `src/context/{InquiryContext,WishlistContext}.jsx` (CRM POST hook-in; server/guest wishlist + merge)
- `src/utils/productImages.js` (URL fallback), `src/config/siteConfig.js` (becomes bootstrap default), `src/hooks/useSEO.js` (optional)
- Retire last: `src/data/{products,categories,brands,faqs,testimonials}.js` (kept as fallback during migration, deleted at the end)


---

## 6. Infrastructure, Scale & Security

### Spare Mec — Infrastructure & Platform Architecture (Cross-Cutting Concerns)

This document specifies the platform-level (non-domain) infrastructure for the three-app system: **API** (Node + Express + TypeScript + Mongoose), **Admin/CRM** (React + Vite), and the **existing CRA storefront**. Money is in **fils**, pricing is optional, and everything is sized for **50,000+ products** and future GCC payments/ERP.

---

### 1. Cloudinary Image Pipeline

#### 1.1 Topology and security model

Never expose the Cloudinary `api_secret` to either browser app. The CRM uploads via **signed direct-to-Cloudinary uploads**: the API signs an upload request, the browser PUTs bytes straight to Cloudinary (bypassing the API for large binaries), then posts the returned `public_id`/`secure_url` back to the API for persistence. This is the only pattern that scales — routing 50k product images through Express would saturate the API.

```
Admin (Vite) ──(1) request signature──▶  API  ──signs with api_secret──▶ returns { signature, timestamp, apiKey, folder, eager }
Admin        ──(2) POST file + signed params─────────────────────────▶  Cloudinary
Cloudinary   ──(3) { public_id, secure_url, width, height, bytes, format }──▶ Admin
Admin        ──(4) POST those fields to API ─▶ persists into Product.images[] / Banner.image / *.logo
```

**Signing endpoint** (`POST /admin/uploads/sign`, RBAC-gated — `product.write` / `banner.write` / `content.write` depending on target):

```ts
// api/src/services/cloudinary.service.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET, // server-only, never shipped to browser
  secure: true,
});

export function signUpload(folder: string, publicId?: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    timestamp,
    folder,                                  // e.g. "sparemec/products"
    eager: "c_fill,w_1200,h_1200,q_auto,f_auto|c_fill,w_400,h_400,q_auto,f_auto",
    eager_async: "true",
  };
  if (publicId) params.public_id = publicId; // deterministic id => replace-in-place
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return { ...params, signature, api_key: env.CLOUDINARY_API_KEY, cloud_name: env.CLOUDINARY_CLOUD_NAME };
}
```

Constrain uploads with an **upload preset** marked *signed* in the Cloudinary dashboard: whitelist `formats: jpg,png,webp,avif`, `max_file_size: 8_000_000`, `moderation: off`, and an incoming transformation cap (`c_limit,w_2400,h_2400`) so a 40 MP source is normalised on ingest. This is server-enforced regardless of what the browser sends.

#### 1.2 Folder + naming convention

| Asset | Folder | `public_id` pattern |
|---|---|---|
| Product images | `sparemec/products/{productId}` | `{productId}__{nanoid}` (or `{productId}__{sortOrder}` for deterministic replace) |
| Brand logos | `sparemec/brands` | `{brandSlug}` |
| Category icons | `sparemec/categories` | `{categorySlug}` |
| Banners | `sparemec/banners` | `{nanoid}` |
| Quotation PDFs | `sparemec/quotations` (resource_type `raw`) | `{quotationNumber}` |

Storing `publicId` (not just URL) on every image subdoc is what makes **replace** and **delete** possible — the URL alone is not a handle Cloudinary can act on.

#### 1.3 Transformations / responsive variants

Do **not** store multiple resized URLs per image. Store one canonical `secure_url` + `publicId`; derive variants at render time via Cloudinary URL transformations. `f_auto` (auto WebP/AVIF negotiation) and `q_auto` are mandatory on every delivery URL.

Centralise a builder used by **both** the storefront and CRM:

```ts
// shared/cloudinaryUrl.ts
const CLOUD = "<cloud_name>";
type Variant = "thumb" | "card" | "detail" | "zoom" | "og";
const T: Record<Variant, string> = {
  thumb:  "c_fill,w_120,h_120,q_auto,f_auto,dpr_auto",
  card:   "c_fill,w_400,h_400,q_auto,f_auto,dpr_auto",
  detail: "c_pad,w_900,h_900,b_auto,q_auto,f_auto,dpr_auto",
  zoom:   "c_limit,w_2000,h_2000,q_auto,f_auto",
  og:     "c_fill,w_1200,h_630,q_auto,f_auto", // social share cards
};
export const imgUrl = (publicId: string, v: Variant = "card") =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/${T[v]}/${publicId}`;
```

On the storefront use `srcSet` with `dpr_auto` + width descriptors so retina/mobile get appropriately sized bytes:

```jsx
<img src={imgUrl(img.publicId,"card")}
     srcSet={`${imgUrl(img.publicId,"card")} 1x, ${imgUrl(img.publicId,"detail")} 2x`}
     loading="lazy" decoding="async" alt={img.alt} />
```

The product detail gallery (zoom requirement) uses `detail` for the main view and `zoom` only on hover/click — never preload zoom.

#### 1.4 Multiple ordered images

Images are an **embedded `ProductImage[]`** (per the data model — correct: <20 per product, always loaded with the product, order matters). Admin sortable-list mechanics:

- **Reorder**: drag-and-drop writes back the full array with recomputed `sortOrder` (0..n). `PATCH /admin/products/:id/images/reorder` with `[{ publicId, sortOrder }]`. Set `isPrimary=true` on `sortOrder===0` and mirror it into `Product.primaryImage` (denormalised for list views) in the same write.
- **Add**: append after signed upload; recompute `primaryImage` if it was empty.
- **Replace**: upload to the **same `public_id`** (`overwrite:true, invalidate:true`) → URL stays stable, no DB array mutation, CDN cache purged. This is why deterministic `public_id`s are valuable for the primary image.
- **Delete**: `cloudinary.uploader.destroy(publicId, { invalidate: true })` **then** `$pull` from the array. Order matters: pull from DB only after Cloudinary confirms, or you orphan the DB ref; tolerate Cloudinary "not found" as success (idempotent).

#### 1.5 Deletion safety & orphan reconciliation

Two failure modes: (a) DB row deleted, Cloudinary asset leaks (storage cost); (b) Cloudinary deleted, DB still references it (broken image). Mitigations:

- Wrap delete in a small **outbox/cleanup queue**: record `{ publicId, action:"destroy" }`; a worker retries `destroy` until success. Survives a crash between the two writes.
- Nightly **reconciliation cron** (Cloudinary Admin API `resources` listing by folder/prefix) diffs Cloudinary against referenced `publicId`s across `Product.images`, `Banner`, `Brand.logo`, `Category.icon`, `ContentPage` images, `Setting.brand.logo`; deletes assets with **zero** DB references older than 24h. Run via the same scheduler as the quotation-expiry/low-stock sweeps.
- For product **soft-delete** (`isDeleted`), keep Cloudinary assets (restore-ability); only the reconciliation job purges after hard-delete/TTL.

---

### 2. Product Search at 50k+ Scale

#### 2.1 The decision

**Recommendation: ship MongoDB Atlas + Atlas Search (Lucene) as the primary search engine, behind a thin `SearchService` interface.** Reasoning:

| Option | Typo tolerance | Facets | Ops burden | Sync | Verdict |
|---|---|---|---|---|---|
| **Mongo `$text` index** | None (exact stems only) | Weak (`$facet` aggregation, no native facet API) | Zero (it's in the DB) | None (same store) | Fine for MVP, **fails** the auto-parts UX (no fuzzy part numbers, single text index per collection) |
| **Atlas Search** | Yes (`fuzzy.maxEdits`, autocomplete) | **Native** `facet` + `$searchMeta` | Low — managed, **no separate datastore, no sync job** | **None** (indexes the live collection) | **Recommended** |
| **Meilisearch / Typesense** | Best-in-class, instant | Excellent | High — separate service to host/secure/scale + a CDC/sync pipeline + dual-write consistency | Required (you must keep it in sync) | Over-engineered until proven need / non-Atlas hosting |

The clinching factor: the data model **already mandates Atlas** for the customer base, and Atlas Search **indexes the same collection with no separate datastore and no synchronization layer** — eliminating the single biggest source of bugs (search index drift from the source of truth) that a Meilisearch/Typesense deployment introduces. It delivers exactly what auto-parts search needs: fuzzy matching on part numbers, `autocomplete` token type for the search-as-you-type box, and native `facet`/`$searchMeta` for the catalogue filter sidebar with live counts. Meilisearch/Typesense are objectively faster and have nicer typo handling, but they are a **second stateful system** to run, secure, and reconcile — not justified at 50k products on an Atlas-committed stack. The design keeps that door open (see 2.5).

#### 2.2 Two-layer query strategy (matches the example queries)

The spec's example queries split cleanly into two intents; route on input shape **before** hitting the engine:

1. **Identifier paste** — `"A4602407018"` (looks like a part code: alnum, length≥5, low entropy whitespace). Auto-parts buyers paste exact codes; this must be the most reliable path. Normalise (uppercase, strip spaces/dashes/dots) into a precomputed `searchTokens: [String]` field and do an **exact/prefix index hit** on `partNumber`, `oemNumber`, `sku`, `altPartNumbers`, `searchTokens`. So `A4602407018`, `A 460 240 7018`, and `4602407018` all resolve. Try this first; if it returns hits, short-circuit (skip relevance search).

```ts
export const normalizeCode = (s: string) =>
  s.toUpperCase().replace(/[\s\-._/]/g, "");
// pre-save hook builds searchTokens from name words + every code variant
```

2. **Phrase / relevance** — `"Engine Mount Mercedes"`, `"BMW E90 Control Arm"`. Mixes part nouns + brand + chassis code. This is Atlas Search `compound` over `name`, `brandName`, `categoryName`, `tags`, `description`, and the denormalised `fitment.makeName / modelName / generationCode` (which is exactly why the data model denormalises those onto the embedded fitment).

#### 2.3 Atlas Search index definition

```jsonc
// Atlas Search index "product_search" on collection `products`
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name":         [{ "type": "string", "analyzer": "lucene.standard" },
                       { "type": "autocomplete", "tokenization": "edgeGram", "minGrams": 2, "maxGrams": 15 }],
      "brandName":    { "type": "string" },
      "categoryName": { "type": "string" },
      "description":  { "type": "string" },
      "tags":         { "type": "string" },
      "searchTokens": { "type": "string", "analyzer": "lucene.keyword" }, // exact code tokens
      "partNumber":   { "type": "string", "analyzer": "lucene.keyword" },
      "oemNumber":    { "type": "string", "analyzer": "lucene.keyword" },
      "sku":          { "type": "string", "analyzer": "lucene.keyword" },
      "fitment": { "type": "document", "fields": {
        "makeName":       { "type": "string" },
        "modelName":      { "type": "string" },
        "generationCode": { "type": "string", "analyzer": "lucene.keyword" }
      }},
      // facets (StringFacet / NumberFacet) for the filter sidebar
      "category":  { "type": "stringFacet" },
      "brand":     { "type": "stringFacet" },
      "condition": { "type": "stringFacet" },
      "status":    { "type": "string", "analyzer": "lucene.keyword" }, // filter, not facet
      "price":     [{ "type": "number" }, { "type": "numberFacet" }]
    }
  }
}
```

Relevance query (the `compound` shape) with fuzzy + field boosts, always `filter`ed to `status:"active"`:

```ts
const pipeline = [
  { $search: { index: "product_search", compound: {
      should: [
        { text: { query, path: "name",      score: { boost: { value: 10 } }, fuzzy: { maxEdits: 1, prefixLength: 2 } } },
        { text: { query, path: "brandName", score: { boost: { value: 6 } } } },
        { text: { query, path: ["fitment.modelName","fitment.generationCode"], score: { boost: { value: 5 } } } },
        { text: { query, path: "tags",      score: { boost: { value: 3 } } } },
        { text: { query, path: "description" } },
        { text: { query: normalizeCode(query), path: "searchTokens", score: { boost: { value: 12 } } } }, // code hit ranks highest
      ],
      filter:        [{ text: { query: "active", path: "status" } }],
      minimumShouldMatch: 1,
  }}},
  { $addFields: { score: { $meta: "searchScore" } } },
  { $skip: skip }, { $limit: limit },
];
```

Facet counts for the sidebar in a **single** `$searchMeta` round-trip (no second query, accurate live counts):

```ts
{ $searchMeta: { index: "product_search", facet: {
    operator: { /* same compound query */ },
    facets: {
      categoryFacet:  { type: "string", path: "category",  numBuckets: 50 },
      brandFacet:     { type: "string", path: "brand",     numBuckets: 50 },
      conditionFacet: { type: "string", path: "condition" },
      priceFacet:     { type: "number", path: "price", boundaries: [0, 10000, 50000, 100000, 500000], default: "500000+" }
}}}}
```

#### 2.4 Pagination, typo tolerance, fallback

- **Pagination**: `$skip/$limit` is acceptable to a few thousand results (the realistic depth for filtered auto-parts). For deep/infinite scroll use **`searchAfter`** (Atlas Search paginates on the sort token) to avoid `$skip` cost. Default sort `{ score desc, createdAt desc }`; user-selectable: price asc/desc (`price` numeric, nullable → On-Request items sort last), newest, top-selling (`salesCount`).
- **Typo tolerance**: `fuzzy.maxEdits:1` on `name` (raise to 2 only for length>8 terms — guards against over-matching short tokens); `prefixLength:2` protects the leading characters of part-ish words. **Never** apply fuzzy to `searchTokens`/code fields (exact only — fuzzy part numbers return wrong parts, a safety issue for fitment).
- **Autocomplete**: dedicated `$search` using the `autocomplete` mapping on `name` for the type-ahead box, `limit 8`, debounced 200ms client-side.
- **Graceful fallback / MVP path**: `SearchService` implements two backends behind one interface — `AtlasSearchProvider` (default) and `MongoTextProvider` (the `$text` + identifier-index path from the data model). A `SEARCH_DRIVER` env flag selects one. This lets dev/local (Mongo community, no Atlas Search) run the text-index variant, and production run Atlas Search, with **zero call-site changes**. The denormalised `*Name`/`searchTokens` fields feed both.

#### 2.5 External-engine seam (when 50k → 500k or Arabic search demands it)

The denormalised projection (`name, brandName, categoryName, searchTokens, fitment.*Name, price, facet fields`) is the exact document you would feed Meilisearch/Typesense. Trigger to migrate: sustained p95 search latency issues, demand for **Arabic-language** relevance/synonyms, or a move off Atlas. Then `SearchService` gains a `MeilisearchProvider`, fed by a **change-stream → upsert** indexer (Mongo change streams on `products`), and the rest of the app is untouched. Design for it now, build it only when measured.

---

### 3. Bulk Excel Import Pipeline

#### 3.1 Library: `exceljs` (not SheetJS)

**Recommendation: `exceljs`.** It **streams** both read (`WorkbookReader`) and write (`WorkbookWriter`) — essential for a 50k-row import that must not load the whole sheet into memory — and natively writes rich templates (header styling, **data-validation dropdowns** for Category/Brand/Condition, frozen header, column widths). SheetJS (`xlsx`) is excellent for quick parsing but its streaming/styling story is weaker and the well-maintained styling lives behind the paid "Pro" tier. `exceljs` is MIT, covers template-gen + streaming-read in one dependency.

#### 3.2 Column contract & template generation

Template columns (exact spec order) + a hidden `ProductID` upsert key:

`Product ID | Product Name | Category | Subcategory | Brand | Product Type | SKU | Part Number | OEM Number | Price | Stock Quantity | Warranty | Description | Vehicle Fitment`

`GET /admin/products/import/template` streams a generated `.xlsx`:
- Row 1: styled headers (bold, frozen pane, autofilter).
- Row 2: an example row (greyed) showing formats — **Price as AED decimal** (e.g. `450.00`; the importer converts to fils ×100, so the operator never sees fils), **Vehicle Fitment** as a parseable mini-DSL: `Mercedes-Benz>W213>E-Class>OM654 2.0d>2016-2023; BMW>E90>3 Series>N52>2005-2011` (semicolon-separated rows; `Make>Generation>Model>Engine>YearStart-YearEnd`).
- Category / Brand / Condition columns get **`dataValidation` list dropdowns** sourced from current DB values (prevents the #1 import error — typo'd category names that create orphans).
- A second sheet "Instructions" documents required vs optional, the fitment DSL, and that blank Price ⇒ "On Request".

#### 3.3 Validation, upsert, row-level errors

Pipeline stages (each row is independent; one bad row never aborts the batch):

1. **Parse** (streamed): map header→field by name (resilient to column reordering); skip the example row.
2. **Validate** per row with a **Zod row schema**: required `Product Name` + `Category`; `Price`/`Stock` numeric≥0 (Price optional → null); resolve `Category`/`Subcategory`/`Brand` **names to ObjectIds** (Subcategory must belong to the resolved Category); parse the fitment DSL into `Fitment[]`. Unknown category/brand → **error row** (do not auto-create taxonomy in a product import; that hides data-entry mistakes).
3. **Upsert key precedence**: `Product ID` (→ `Product.externalId`, unique sparse) if present, else `SKU` (unique sparse), else `partNumber + brand`. Found ⇒ **update** (patch only provided columns; never null-out omitted fields); not found ⇒ **create** (generate `slug`, recompute `availability`, build `searchTokens`, set `status:"draft"` so new bulk rows are reviewed before going live).
4. **Stock**: a stock value writes the default-warehouse `Inventory` and appends a `StockMovement{ type:"bulk_import", referenceType:"Import" }` — never silently mutate `Product.stockQuantity` without the audit trail.
5. **Report**: per-row outcome `{ row, key, action: created|updated|skipped|error, messages[] }`. Returned as JSON **and** as a downloadable annotated `.xlsx` (original rows + appended `Status` / `Errors` columns, error cells red-filled) so the operator fixes in place and re-uploads.

```ts
const ImportRow = z.object({
  productId:   z.string().trim().optional(),
  name:        z.string().trim().min(1, "Product Name required"),
  category:    z.string().trim().min(1, "Category required"),
  subcategory: z.string().trim().optional(),
  brand:       z.string().trim().optional(),
  sku:         z.string().trim().optional(),
  partNumber:  z.string().trim().optional(),
  oemNumber:   z.string().trim().optional(),
  priceAed:    z.coerce.number().nonnegative().optional(), // ⇒ price=null when blank
  stock:       z.coerce.number().int().nonnegative().optional(),
  warranty:    z.string().trim().optional(),
  description: z.string().trim().optional(),
  fitmentRaw:  z.string().trim().optional(), // parsed via parseFitmentDSL()
});
```

#### 3.4 Background processing for large files

Synchronous import of 50k rows would block the request, the event loop, and trip proxy timeouts. Pattern:

- Upload the `.xlsx` to **Cloudinary `raw`** (or S3); create an `ImportJob` doc `{ status: queued|processing|completed|failed, total, processed, created, updated, errors[], reportFileUrl }`.
- Process via a job queue — **BullMQ on Redis** (the same Redis used for caching/rate-limiting; see §6/§7). A worker streams the file, processes in **batches of ~500 with `bulkWrite`** (unordered, so individual row errors don't abort the batch), updating `ImportJob.processed` for a CRM **progress bar** (poll `GET /admin/products/import/jobs/:id`, or SSE).
- For initial scope without Redis, a **worker_threads**-backed in-process queue with the same `ImportJob` progress contract is acceptable; BullMQ is the production target because it survives restarts and gives retries/concurrency. Keep the job interface identical so the swap is transparent.
- Emit a `Notification{ type:"System" }` + `AuditLog{ action:"bulk_import" }` on completion.

---

### 4. Notifications

#### 4.1 Architecture: persist-then-fan-out (outbox)

Every notifiable event **first** writes a `Notification` doc (source of truth, drives the CRM bell + unread badge via `{ recipient, isRead }` / `{ recipientRole, isRead }` indexes), **then** enqueues delivery to external channels. Persisting first means a failed email/WhatsApp never loses the in-CRM notification, and `deliveryStatus.{email,whatsapp}` (`pending|sent|failed`) tracks each channel for retry. A `NotificationService.dispatch(event)` is the single entry point called by Order/Inquiry/Quote/Inventory services.

```ts
async function dispatch(evt: NotifyEvent) {
  const notif = await Notification.create({
    type: evt.type, title: evt.title, message: evt.message, severity: evt.severity,
    referenceType: evt.refType, referenceId: evt.refId,
    recipientRole: evt.targetRole,            // role-targeted (Low Stock → Inventory Manager)
    channels: evt.channels ?? ["crm"],
    deliveryStatus: { email: "pending", whatsapp: "pending" },
  });
  if (notif.channels.includes("email"))    await queue.add("email",    { notifId: notif._id });
  if (notif.channels.includes("whatsapp")) await queue.add("whatsapp", { notifId: notif._id });
  io.to(`role:${evt.targetRole}`).emit("notification", notif); // optional realtime bell (Socket.IO)
}
```

#### 4.2 Event → recipient → channel matrix

| Event | Trigger | Recipient (role) | CRM | Email | WhatsApp |
|---|---|---|---|---|---|
| **New Order** | Order created (`New`→`Pending Verification`) | Sales Team | ✓ | ✓ staff + ✓ customer confirmation | optional staff |
| **New Inquiry** | Inquiry created (any source) | Sales Team | ✓ | ✓ staff | — (the inquiry itself often *is* a WA message) |
| **New Quote Request** | QuoteRequest created | Sales Team | ✓ | ✓ staff | optional |
| **Low Stock** | `Inventory.available ≤ threshold` after StockMovement | Inventory Manager | ✓ (`severity:"warning"`) | ✓ digest | — |
| **Order Status** | status transition | the Order's customer | — | ✓ customer | optional customer |

Low-stock should be **debounced/digested** (one rollup email per N minutes, not one per unit sold) to avoid alert fatigue — coalesce in the worker keyed by warehouse.

#### 4.3 Email provider — **Resend** (primary), SES (scale fallback)

**Recommendation: Resend** for the transactional layer. Clean Node SDK, **React Email** for templating (the team already writes React — order confirmations/quotes authored as React components, no separate templating system), generous deliverability defaults, simple domain/DKIM setup. When volume or cost dominates (tens of thousands/month), **Amazon SES** is the fallback — cheapest at scale, but more setup (DKIM/SPF/DMARC, warmup, bounce/complaint SNS handling). Abstract behind `EmailProvider` so Resend↔SES is a config swap. **Postmark** is a strong alternative if Resend is unavailable (best-in-class transactional deliverability/analytics). Required emails: customer order confirmation, order-status updates, quotation send (with the Cloudinary PDF link), staff alerts. Always send DKIM-signed from the verified `sparemec.ae`-style domain — never from the Gmail addresses in `siteConfig`.

#### 4.4 WhatsApp — **Meta WhatsApp Cloud API** (recommended), Twilio (fastest start)

Two distinct WhatsApp concerns — don't conflate:

1. **Existing customer-initiated `wa.me` deep links** (the storefront's `src/utils/whatsapp.js` builder, number `971507855298`). This stays exactly as-is — it's free, requires no API, and is the primary inquiry funnel. The CRM merely **stores a copy** of the generated message (`Inquiry.whatsappMessage` / `whatsappLink`) per spec. No provider needed for this.

2. **Outbound business-initiated** staff/customer notifications (optional, future). **Recommendation: Meta WhatsApp Cloud API** — lower per-message cost (no per-message platform markup), direct from Meta, supports template messages required for business-initiated sends outside the 24h window. **Twilio WhatsApp** is the pragmatic *first* integration (one SDK that also covers SMS fallback, simpler onboarding, abstracts Meta's template/approval friction) — recommend **starting on Twilio to ship, planning migration to Cloud API for unit-cost** once volume justifies the heavier onboarding. Gate all of this behind `Setting.features` and a `WHATSAPP_DRIVER` flag; ship `crm`+`email` first, WhatsApp when business-verified. Both go behind a `WhatsAppProvider` interface.

---

### 5. Reports & Exports

| Format | Library | Use |
|---|---|---|
| **Excel (.xlsx)** | `exceljs` (already in for import — **streamed `WorkbookWriter`** for large exports) | Sales, Orders, Products, Customers, Inquiries — styled, multi-sheet |
| **CSV** | `fast-csv` (or `exceljs` CSV stream) | Lightweight/raw, pipe straight to the HTTP response |
| **PDF** | **`pdfmake`** (declarative, table-friendly, easy totals/headers/footers) for reports & **quotation documents**; `puppeteer`/`@sparticuz/chromium` only if pixel-perfect HTML/CSS-templated invoices are later required | Quotation PDF (→ Cloudinary `raw`, stored on `Quotation.pdfFile`), printable order/report PDFs |

Principles: all reports are **aggregation-pipeline driven** off the indexes the data model already defines (`Order {createdAt:-1}`/`{status,createdAt:-1}` for sales time-series; `salesCount:-1` top-selling; `{warehouse,available}` inventory). **Stream** exports to the response (`Content-Disposition: attachment`) — never build a 50k-row buffer in memory. For heavy/scheduled reports, reuse the **BullMQ** job + `ImportJob`-style status pattern and deliver a Cloudinary/S3 download link by email. RBAC: `report.read`. Money formats from **fils → AED** at the presentation boundary only (`/100`, `toFixed(2)`, `Intl.NumberFormat('en-AE',{currency:'AED'})`).

---

### 6. Caching & Performance

#### 6.1 Layered caching

| Layer | What | TTL / invalidation |
|---|---|---|
| **CDN edge** | Cloudinary images (own CDN, `f_auto/q_auto`); storefront static build | Long-lived, `invalidate:true` on replace |
| **HTTP cache headers** | Public read endpoints (catalogue, product, categories, banners, content) | `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`; honoured by a CDN/reverse proxy in front of the API |
| **Redis app cache** | Hot reads: `Setting/SiteConfig` (read-mostly, cache aggressively per data model), category tree, homepage banners, facet metadata, individual product-by-slug | Key `entity:slug:vN`; **bust on write** via version bump / `DEL` in the write service |
| **Mongo / query** | Lean reads (`.lean()`), projection (exclude `costPrice`/`select:false`), the index strategy from the data model | — |

`Setting`, category/subcategory tree, brand list, and active banners are the highest cache-hit/lowest-churn objects — cache them in Redis with explicit invalidation on the (rare) admin write. Product detail caches by slug with a short TTL + write-time bust.

#### 6.2 Pagination at scale

- **Customer catalogue**: search/facet path uses Atlas Search `searchAfter` (§2.4); non-search listing uses **range/keyset pagination** (`createdAt + _id` cursor), never deep `skip` (skip degrades linearly at 50k+).
- **CRM tables** (orders, inquiries, products): cursor or bounded page-size (cap `limit`, e.g. ≤100) on the indexed sort columns the data model specifies.
- Always return `{ items, nextCursor, total? }`; compute `total` only when cheap (use `$searchMeta` count for search, estimated count for huge unfiltered lists — `estimatedDocumentCount` not `countDocuments` on cold collections).

#### 6.3 Read/write split & connection mgmt

- One Mongoose connection pool (`maxPoolSize` tuned, ~10–20) reused across the process; never per-request connections.
- Denormalisation (the `*Name`, `primaryImage`, `productCount`, `Product.stockQuantity` roll-ups already in the model) is the primary "cache" — it removes joins from hot read paths. Keep the recompute hooks (pre-save availability, product-count on category writes) correct; they are what make the cache cheap.
- Heavy/cold work (imports, exports, reconciliation, expiry sweeps, notification fan-out) all run **off the request path** via BullMQ workers — the API stays read-optimised.

---

### 7. Security Hardening

| Concern | Control |
|---|---|
| **Input validation** | **Zod** at every boundary (route handler parses `body`/`query`/`params` into typed DTOs before reaching services). Chosen over Joi for first-class TypeScript inference (one source of truth for type + runtime check), matching the TS stack. The bulk-import row schema (§3.3) is the same library. |
| **NoSQL injection** | `express-mongo-sanitize` (strip `$`/`.` from keys) **plus** the discipline that **Zod-validated, casted values** reach Mongoose — never spread raw `req.body`/`req.query` into a query filter or `$where`. Cast all `:id` params to `ObjectId` and reject invalid. |
| **Rate limiting** | `express-rate-limit` with a **Redis store** (shared across API instances). Tiers: global IP cap; strict on `/auth/*` (login/refresh/OAuth — brute-force) and `/inquiries`,`/quote-requests`,`/orders` guest POST (spam — the storefront allows no-login submits); per-account cap on signed-upload endpoint. |
| **CORS** | `cors` with an **explicit allowlist** (storefront origin, CRM origin from env) — never `origin:true` with credentials. `credentials:true` only for the cookie-bearing auth routes. |
| **HTTP headers** | `helmet` (HSTS, `X-Content-Type-Options`, frameguard, referrer-policy); a CSP whitelisting `res.cloudinary.com`, the API origin, and Google OAuth domains. |
| **Token security** | JWT **access (short, ~15m) + refresh (long, rotating)**. Store **`refreshTokenHash`** on AdminUser/Customer (`select:false`, per data model) — rotate on every use, revoke on logout/breach. Refresh token in an **httpOnly, Secure, SameSite=strict cookie**; access token in memory (not localStorage). Separate JWT secrets/audiences for **admin vs customer** so a customer token can never hit a CRM route. `bcrypt`(≥12)/`argon2id` for `passwordHash`. |
| **RBAC** | The data model's static `ROLE_PERMISSIONS` map + `permissionOverrides`. Middleware `requirePermission('product.write')` resolves the effective set per request. Enforce the **service-layer guards** the model calls out: Super Admin can't be deleted (only deactivated); `costPrice`/`compareAtPrice`/`taxRate` are `select:false`/RBAC-gated and stripped from any customer-facing serializer. |
| **File-upload limits** | Cloudinary signed-preset caps (formats whitelist, 8 MB, incoming-transform downscale, §1.1). The **sign endpoint is RBAC-gated** and rate-limited so only authorised staff obtain signatures. Reject non-image MIME on the persist callback by validating `format` from Cloudinary's response. |
| **Secrets / env** | **No secrets in git** (`.gitignore` already present — verified). `.env` per app + `.env.example` committed; Zod-validate `process.env` at boot (`env.ts`) and **crash fast** on missing keys. Production secrets from the host's secret manager (Render/Railway/Fly env, or AWS Secrets Manager), never baked into images. Rotate Cloudinary/JWT/DB creds on staff offboarding. |
| **Audit** | `AuditLog` (append-only, per data model) on every staff `create/update/delete/login/status_change/bulk_import/export/role_change`, with redacted `before`/`after` (strip `passwordHash`/`refreshTokenHash`). `StockMovement` is the parallel append-only ledger for stock. Both are **immutable** (no update/delete routes). |
| **Transport / misc** | TLS everywhere (HSTS); `express.json({ limit:'1mb' })` body cap; disable `x-powered-by`; structured request-id on every log line; least-privilege Atlas DB user + **IP allowlist** to the API's egress. |

---

### 8. Deployment & Environment

#### 8.1 Hosting topology

| Component | Recommendation | Notes |
|---|---|---|
| **MongoDB** | **MongoDB Atlas** (M10+ prod; M0/M2 dev) | Required for Atlas Search (§2). Pick a **GCC-proximate region** (`me-central-1`/UAE if available, else `eu`/`ap` nearest) for latency. Backups + PITR on. |
| **API** (Express/TS) | **Render** or **Railway** (Docker web service) — or **Fly.io** for GCC-edge regions; AWS ECS/Fargate when ops maturity warrants | Stateless, horizontally scalable; health check `/healthz`. Long jobs on a **separate worker service** (same image, `WORKER=true`). |
| **Redis** | Managed (Render/Railway Redis, **Upstash**, or ElastiCache) | Cache + rate-limit store + BullMQ broker. |
| **Admin/CRM** (Vite static) | **Vercel / Netlify / Cloudflare Pages** (static SPA) | Behind staff auth; locked CORS to API. |
| **Storefront** (CRA static) | **Vercel / Netlify / Cloudflare Pages** | Keep CRA build (`react-scripts build`) per locked decision; serve from CDN. |
| **Images** | **Cloudinary** | Own CDN; no extra infra. |
| **Files/PDFs** | Cloudinary `raw` (or S3) | Quotation PDFs, import files, export artifacts. |

Three separate deploy targets (storefront, CRM, API) + worker + Atlas + Redis. All static front-ends on CDN; only the API/worker are long-running.

#### 8.2 Environment variables (full list)

```bash
# ── Core ─────────────────────────────────────────────
NODE_ENV=production
PORT=8080
API_BASE_URL=https://api.sparemec.ae
WORKER=false                         # true on the worker service

# ── Database / cache / queue ────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster/sparemec?retryWrites=true
MONGODB_DB_NAME=sparemec
REDIS_URL=rediss://default:pass@host:6379
SEARCH_DRIVER=atlas                  # atlas | mongo-text

# ── Auth / JWT ──────────────────────────────────────
JWT_ACCESS_SECRET=...                # admin+customer access (or split below)
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
ADMIN_JWT_AUDIENCE=sparemec-admin
CUSTOMER_JWT_AUDIENCE=sparemec-shop
COOKIE_DOMAIN=.sparemec.ae
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://api.sparemec.ae/auth/google/callback

# ── CORS (explicit origins) ─────────────────────────
STOREFRONT_ORIGIN=https://sparemec.ae
ADMIN_ORIGIN=https://admin.sparemec.ae

# ── Cloudinary ──────────────────────────────────────
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...            # server-only
CLOUDINARY_UPLOAD_FOLDER=sparemec
CLOUDINARY_UPLOAD_PRESET=sparemec_signed

# ── Email ───────────────────────────────────────────
EMAIL_DRIVER=resend                  # resend | ses | postmark
RESEND_API_KEY=...
EMAIL_FROM="Spare Mec <noreply@sparemec.ae>"
EMAIL_REPLYTO=sales@sparemec.ae

# ── WhatsApp (optional, feature-gated) ──────────────
WHATSAPP_ENABLED=false
WHATSAPP_DRIVER=twilio               # twilio | meta-cloud
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+1...
META_WA_PHONE_NUMBER_ID=...
META_WA_ACCESS_TOKEN=...
WHATSAPP_COMPANY_NUMBER=971507855298 # the wa.me deep-link number (from siteConfig)

# ── Ops ─────────────────────────────────────────────
LOG_LEVEL=info
SENTRY_DSN=...
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

Validate all of the above with a **Zod `envSchema`** at boot; fail fast. Commit `.env.example`; never the real `.env`.

#### 8.3 CI/CD outline

- **CI** (GitHub Actions, matrix per app): `install → typecheck (tsc --noEmit) → lint → test → build`. PR-gated.
- **CD**: on merge to `main` → build Docker image (API/worker), push, deploy to Render/Railway (or trigger platform auto-deploy from the branch). Storefront/CRM → Vercel/Netlify auto-deploy from their respective build commands. **Run `mongosh` migration/seed scripts** (seed Super Admin, default Warehouse, `Setting/SiteConfig` from `siteConfig.js`, ensure indexes + Atlas Search index) as a release step.
- **Migrations**: index/Atlas-Search-index creation and the data-migration from static `src/data/*` (map legacy availabilities "Limited Stock"→"Low Stock", "Made to Order"→"On Request" per data model) run as idempotent scripts, version-tracked.
- **Environments**: `dev` (Atlas M0 + local Redis), `staging` (mirrors prod, seeded), `prod`. Separate Cloudinary folders/env per environment.

#### 8.4 Logging & monitoring

- **Structured logging**: `pino` (JSON, fast) with per-request `requestId` + actor; ship to the host log drain or Logtail/Datadog.
- **Errors**: **Sentry** on API, worker, and both front-ends (source-mapped).
- **Uptime/health**: `/healthz` (DB + Redis ping) wired to the platform health check + an external uptime monitor.
- **Metrics**: queue depth/failure (BullMQ board), Atlas performance advisor (slow queries → index gaps), Cloudinary usage. Alert on low-stock job failures, email/WhatsApp delivery failures (`deliveryStatus:"failed"`), and import-job failures.

---

### 9. Future-Proofing

#### 9.1 Online payments (GCC)

Pricing/checkout are **already payment-optional** (`Order.paymentStatus:"Unpaid"`, `paymentMethod:"None"`, orders enter `Pending Verification`) — so payments bolt on without reworking orders. Introduce a `PaymentProvider` interface + a `Payment`/`Transaction` collection (`order, provider, providerRef, amount(fils), status, raw`) and a **webhook endpoint** that flips `paymentStatus`→`Paid` and advances the order.

- **GCC-native gateways preferred for local cards/issuers + AED settlement**: **Telr** and **PayTabs** (both Dubai-based, strong UAE/GCC card + local-method coverage, AED/multi-GCC-currency settlement). **Stripe** where available in-region for the cleanest DX/webhooks, but GCC card acceptance/settlement is the deciding factor — lead with Telr/PayTabs, keep Stripe behind the same interface. **Tabby/Tamara** (BNPL) are popular regional add-ons later.
- Money already in **fils** maps directly to gateway minor-unit AED amounts — no refactor.

#### 9.2 ERP integration seam

The append-only ledgers and external-id hooks are the integration surface:

- `Product.externalId` (the bulk "Product ID") is the natural **ERP SKU foreign key** — two-way sync keys on it.
- `StockMovement` (immutable, typed) is the **inventory event stream** an ERP consumes/produces; `Order.statusHistory` + milestone timestamps are the fulfillment events.
- Build an **`integration` module** exposing outbound **webhooks** (order.created/updated, stockMovement.created) and an idempotent inbound sync API (upsert products/stock keyed by `externalId`). **Mongo change streams** can drive near-real-time push to an ERP/iPaaS without polling. None of this requires schema change — the seams exist now.

#### 9.3 Multi-warehouse

Already structurally present: `Warehouse` + per-warehouse `Inventory` with `{product,warehouse}` unique, `Order.fulfillmentWarehouse`, `StockMovement.warehouse`, `transfer_in/out` movement types. `Product.stockQuantity` is an explicit **default-warehouse roll-up** for fast reads. Activation path: seed additional warehouses, add a warehouse selector to inventory/order-fulfilment UIs, and a roll-up recompute that sums available across warehouses for storefront availability. Zero schema migration.

#### 9.4 Multi-currency & Arabic/RTL i18n

- **Currency**: every money doc carries a `currency` field (defaults `"AED"`); fils storage is currency-agnostic minor units. For GCC expansion, add a `CurrencyRate` table + presentation-layer conversion, or store per-region prices — the field is already there. **Do not** mix display formatting into storage; convert at the serializer boundary only.
- **Content i18n**: localizable text (`Product.name/description`, `Category`, `Banner`, `ContentPage`, `FAQ`) migrates to a `{ en, ar }` shape (or a parallel `*_ar` field / translations subdoc) when Arabic launches. Atlas Search adds an Arabic analyzer index; the denormalised search fields gain Arabic variants.
- **RTL UI**: both React apps adopt `dir="rtl"` + Tailwind **logical properties** (`ps-*/pe-*/ms-*/me-*` instead of `pl/pr/ml/mr`) and an `i18next` + locale-routing setup. Plan the storefront/CRM component styles around logical properties **now** (cheap) so the RTL switch later is a config flip, not a restyle. `Intl.NumberFormat('ar-AE')` for Arabic-Indic numerals where desired.

---

**Cross-cutting through-line:** persist-first + append-only ledgers (`AuditLog`, `StockMovement`, `Notification`, `ImportJob`) give durability and auditability; **provider interfaces** (`SearchService`, `EmailProvider`, `WhatsAppProvider`, `PaymentProvider`, plus the `WORKER`/`SEARCH_DRIVER` flags) make every external dependency swappable; **denormalisation + Redis/CDN + off-request workers** keep the 50k-product read paths fast; and **everything heavy runs on BullMQ off the request path**. The existing `siteConfig.js` and `whatsapp.js` map cleanly onto `Setting/SiteConfig` and the preserved `wa.me` inquiry funnel, so the current storefront wires to this platform without a rewrite.


---

## 7. Monorepo Structure & Tooling

### Spare Mec — Monorepo & Build-Tooling Architecture

This document defines the repository layout, package-manager/workspace strategy, CRA migration plan, per-app tooling, the corrupted-git recovery plan, and root orchestration scripts. It is grounded in the actual repo state inspected at `/home/nibras-s/Desktop/Projects/sm-auto`:

- The CRA storefront lives at the repo root (`src/`, `public/`, `tailwind.config.js`, `postcss.config.js`, CRA `react-scripts`).
- **Git history is corrupted**: `git log` / `git fsck` fail because ~10 objects under `.git/objects/**` are empty (0 bytes), including commit `e1e05f5b4d1035062b90632a8d2edd4d9f2bc363`, which **all three refs** (`refs/heads/main`, `refs/remotes/origin/HEAD`, `refs/remotes/origin/main`) point to. The working tree is fully intact.
- Remote exists: `origin → https://github.com/Nibras-S/sm-auto.git`.
- `src/assets` is **148 MB** and `public/images` is **6.5 MB** — asset weight matters for the move.
- Storefront uses `process.env.PUBLIC_URL` (CRA convention) in `src/components/home/BrakeAnimation.jsx` — preserved because the storefront stays CRA.

---

### 1. Recommended Monorepo Layout

```
sm-auto/                              # repo root (workspace root)
├── apps/
│   ├── api/                          # Express + TypeScript backend
│   │   ├── src/
│   │   │   ├── config/               # env loader, db connect, cloudinary, logger
│   │   │   ├── modules/              # feature-first: products, orders, inquiries,
│   │   │   │   ├── products/         #   quotes, customers, auth, banners, content,
│   │   │   │   │   ├── product.model.ts      #   inventory, reports, uploads
│   │   │   │   │   ├── product.controller.ts
│   │   │   │   │   ├── product.routes.ts
│   │   │   │   │   ├── product.service.ts
│   │   │   │   │   └── product.schema.ts     # zod request validation
│   │   │   │   └── ...
│   │   │   ├── middleware/           # auth (JWT), rbac, errorHandler, rateLimit
│   │   │   ├── jobs/                 # low-stock checks, notifications
│   │   │   ├── app.ts                # express app (no listen) — importable by tests
│   │   │   └── server.ts             # bootstraps app.listen()
│   │   ├── tests/                    # vitest + supertest (imports app.ts)
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── tsconfig.json             # extends ../../tsconfig.base.json
│   │   ├── vitest.config.ts
│   │   └── package.json              # name: @sm/api
│   │
│   ├── admin/                        # React + Vite + TS (CRM/Admin)
│   │   ├── src/
│   │   │   ├── app/                  # router, providers
│   │   │   ├── features/             # dashboard, products, orders, inventory,
│   │   │   │                         #   customers, inquiries, quotations, banners,
│   │   │   │                         #   content, faq, reports, users(rbac)
│   │   │   ├── components/ui/        # shared admin UI primitives
│   │   │   ├── lib/                  # api client (axios), auth store
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── .env.example              # VITE_API_URL=...
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── package.json              # name: @sm/admin
│   │
│   └── storefront/                   # EXISTING CRA, moved here verbatim (React 18, RRv6)
│       ├── public/                   # moved from root /public (index.html, images/, webmanifest)
│       ├── src/                      # moved from root /src (pages, components, context, data, utils)
│       ├── .env.example              # REACT_APP_API_URL=...
│       ├── Dockerfile
│       ├── tailwind.config.js        # moved from root
│       ├── postcss.config.js         # moved from root
│       └── package.json              # name: @sm/storefront (the existing CRA package.json)
│
├── packages/
│   └── shared/                       # shared TS types/enums/constants (api + admin + storefront)
│       ├── src/
│       │   ├── enums.ts              # OrderStatus, InquirySource, InquiryStatus,
│       │   │                         #   QuoteStatus, Availability, UserRole, StockStatus
│       │   ├── constants.ts          # WHATSAPP_NUMBER, LOW_STOCK_THRESHOLD, brand/contact
│       │   ├── types/                # Product, Order, Inquiry, Quote, Customer, Banner…
│       │   ├── dto/                  # request/response contracts shared by api+admin
│       │   └── index.ts              # barrel export
│       ├── dist/                     # build output (gitignored) — CJS + ESM + .d.ts
│       ├── tsconfig.json
│       ├── tsup.config.ts            # dual build so the CRA JS storefront can consume it
│       └── package.json              # name: @sm/shared
│
├── docker-compose.yml                # local Mongo + (optional) all apps
├── tsconfig.base.json                # single source of compiler defaults
├── .eslintrc.cjs                     # root flat-ish base config
├── .prettierrc.json
├── .prettierignore
├── .editorconfig
├── .gitignore
├── .nvmrc                            # pin Node 20 LTS
├── turbo.json                        # Turborepo pipeline
├── pnpm-workspace.yaml
├── package.json                      # root: scripts + devDeps only, "private": true
└── README.md
```

#### Why feature-first modules (not layered `controllers/`, `models/`)
With 50,000+ products and 14+ CRM domains, a `modules/<feature>/` layout keeps each domain's model, routes, service, and validation co-located. This scales far better than global `controllers/`, `models/`, `routes/` folders that grow unboundedly and force wide diffs.

#### Package manager + workspaces: **pnpm workspaces**
**Recommendation: pnpm.** Rationale specific to this repo:
- The root currently has an **888-entry `node_modules`** (CRA's flat tree) plus a 754 KB `package-lock.json`. Moving to three apps + a package multiplies that. pnpm's content-addressable store + symlinked `node_modules` dramatically cuts disk/install time versus npm's per-app duplication — important when CRA (`react-scripts`), Vite, and an Express stack each pull large, overlapping dep trees.
- pnpm's **strict isolation** prevents phantom dependencies (a real risk here: CRA hoists permissively, which masks missing direct deps). Strictness surfaces those before they break the Vite/API builds.
- First-class workspace protocol: `@sm/shared` is referenced as `"@sm/shared": "workspace:*"`.

> npm workspaces is an acceptable fallback (zero extra tooling, already have `package-lock.json`). It works, but installs are slower and disk usage higher. **Choose pnpm unless the deploy/CI platform mandates npm.** Decision below assumes pnpm; the npm-fallback deltas are noted inline.

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```
(npm fallback: put `"workspaces": ["apps/*", "packages/*"]` in root `package.json` instead.)

#### Add **Turborepo**: yes
Worth it here because the dependency graph is non-trivial: `api` and `admin` both depend on `@sm/shared`, so `shared` must build first. Turborepo handles topological ordering + caching so `pnpm build` rebuilds `shared` once and reuses it. It also caches `lint`/`typecheck`, which matters as the codebase grows.

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build":     { "dependsOn": ["^build"], "outputs": ["dist/**", "build/**"] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "lint":      { "outputs": [] },
    "test":      { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "dev":       { "cache": false, "persistent": true }
  }
}
```
`"dependsOn": ["^build"]` ensures `@sm/shared` is built before any app's build/typecheck/test. `dev` is `persistent: true` + uncached so Turbo runs all three watchers concurrently.

#### How the CRA (JS) storefront consumes `packages/shared`
This is the one cross-cutting constraint: **CRA's Babel-based bundler will not transpile a raw-TS dependency from `node_modules`** (it only transpiles app `src/`). So `@sm/shared` must ship a **pre-built** artifact:

- Build `@sm/shared` with **tsup** to emit **ESM + CJS + `.d.ts`** into `dist/`.
- `package.json` exposes:
  ```json
  {
    "name": "@sm/shared",
    "version": "0.0.0",
    "type": "module",
    "main": "./dist/index.cjs",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }
    },
    "files": ["dist"],
    "scripts": { "build": "tsup", "dev": "tsup --watch", "typecheck": "tsc --noEmit" }
  }
  ```
- The storefront imports plain runtime values (enums/constants) at JS runtime: `import { OrderStatus, WHATSAPP_NUMBER } from '@sm/shared';` — it consumes built JS, never `.ts`. Types are erased in JS anyway, so the storefront mainly benefits from shared **enums/constants** (e.g., the WhatsApp number `971507855298`, availability/order-status strings) staying identical to the API.
- `api` (tsx/ts-jest-free, see below) and `admin` (Vite) both transpile TS natively and can additionally consume the source via `tsconfig` path mapping in dev, but the built `dist/` is the contract for all three.

This keeps a **single source of truth** for `OrderStatus`, `InquirySource`, `Availability`, `UserRole`, etc., shared across the Express API, the Vite admin, and the CRA storefront.

---

### 2. CRA → `apps/storefront` Migration (minimal breakage)

The CRA is a **standard, unejected** `react-scripts@5` app with **no `homepage` field, no `proxy`, and no absolute-import (`@/`) config** (verified). That makes the move low-risk: the entire app relocates as a self-contained unit and keeps working exactly as before.

**Critical asset note:** `src/assets` is **148 MB**. Use `git mv` (preserves history once git is repaired/re-inited) and ensure the move is staged in one commit; do not copy-then-delete (doubles disk + loses rename detection).

#### Steps (run after the git recovery in §4 so moves land in clean history)

1. **Scaffold dirs**
   ```bash
   mkdir -p apps/storefront packages/shared apps/api apps/admin
   ```

2. **Move the CRA app wholesale** (everything that is the storefront, not the future monorepo root):
   ```bash
   git mv src apps/storefront/src
   git mv public apps/storefront/public
   git mv tailwind.config.js apps/storefront/tailwind.config.js
   git mv postcss.config.js apps/storefront/postcss.config.js
   git mv package.json apps/storefront/package.json
   git mv package-lock.json apps/storefront/package-lock.json   # will be deleted later (see step 6)
   git mv README.md apps/storefront/README.md                   # then write a new root README
   ```
   (If git isn't yet re-initialized, use plain `mv`; the §4 fresh-init will pick up final positions.)

3. **Delete the root `node_modules`** (CRA's 888-entry tree at root must not become the workspace root's tree):
   ```bash
   rm -rf node_modules
   ```

4. **Rename the storefront package** so workspace references are unambiguous. In `apps/storefront/package.json`, change `"name": "smauto"` → `"name": "@sm/storefront"`. **Keep all CRA scripts/deps as-is** (`react-scripts start|build|test`, the `eslintConfig: ["react-app","react-app/jest"]`, browserslist). Do **not** touch `process.env.PUBLIC_URL` usage — it stays valid under CRA.

5. **Verify no path assumptions broke.** Because there were no `@/` absolute imports and no `homepage`, all relative imports (`../`, `./`) and `public/` references remain correct after the folder move. The one env reference (`PUBLIC_URL`) is CRA-managed and unaffected.

6. **Switch the storefront onto workspaces.** Delete the per-app `apps/storefront/package-lock.json` (the workspace root owns the single lockfile — `pnpm-lock.yaml`, or root `package-lock.json` under npm). Add `@sm/shared` as a dependency:
   ```json
   "dependencies": { "...": "...", "@sm/shared": "workspace:*" }
   ```
   (npm fallback: `"@sm/shared": "*"`.)

7. **Install from the root** to relink everything through the workspace:
   ```bash
   pnpm install          # (npm: npm install)
   ```

8. **Smoke-test the storefront in place:**
   ```bash
   pnpm --filter @sm/storefront start     # serves CRA on :3000 as before
   pnpm --filter @sm/storefront build     # outputs apps/storefront/build/
   ```
   The existing root `build/` directory (currently committed at repo root) should be removed; build output now lives at `apps/storefront/build/` and is gitignored.

9. **Add an `.env.example`** to `apps/storefront` (CRA only injects `REACT_APP_*` vars):
   ```
   REACT_APP_API_URL=http://localhost:4000/api
   REACT_APP_WHATSAPP_NUMBER=971507855298
   ```

**Migration risk summary:** essentially nil for breakage — no ejection, no custom webpack, no absolute imports, no `homepage`/`proxy`. The only real chores are (a) deleting the root `node_modules` and the per-app lockfile, (b) renaming the package, (c) reinstalling from root. CRA stays CRA; the spec explicitly forbids a Next.js rewrite, and nothing here forces one.

---

### 3. Per-App Tooling

#### Shared base `tsconfig.base.json` (root)
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "baseUrl": ".",
    "paths": { "@sm/shared": ["packages/shared/src"] }   // dev source mapping
  }
}
```
Each app/package has a thin `tsconfig.json` that `"extends": "../../tsconfig.base.json"` and overrides only what differs:
- **api**: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"outDir": "dist"`, `"lib": ["ES2022"]`, `"types": ["node"]`.
- **admin**: `"lib": ["ES2022","DOM","DOM.Iterable"]`, `"jsx": "react-jsx"`, `"noEmit": true` (Vite emits), `"types": ["vite/client"]`.
- **shared**: `"outDir": "dist"`, `"declaration": true` (tsup handles emit; tsc used for `--noEmit` typecheck).
- **storefront**: stays on CRA's own JS toolchain — **no TS config needed** (it's `.jsx`). It only consumes built `@sm/shared` JS.

#### ESLint + Prettier
- **Root `.prettierrc.json`** (single style for the whole repo):
  ```json
  { "semi": true, "singleQuote": true, "printWidth": 100, "trailingComma": "all", "arrowParens": "always" }
  ```
- **ESLint** — per-tool because the three apps have different runtimes:
  - **Root base** `.eslintrc.cjs`: `@typescript-eslint` + `eslint-config-prettier` (turns off formatting rules so Prettier owns formatting). Applies to `api`, `admin`, `shared`.
  - **api** extends base + node/import rules.
  - **admin** extends base + `eslint-plugin-react`, `react-hooks`, `jsx-a11y`.
  - **storefront** keeps its existing CRA config (`extends: ["react-app","react-app/jest"]`) — do not fight CRA's bundled ESLint; just add `eslint-config-prettier` last.
- `.prettierignore`: `dist`, `build`, `coverage`, `pnpm-lock.yaml`, `package-lock.json`, `**/public/images`.

#### Env handling (`.env` per app + `.env.example`)
Each app owns its own `.env` (never shared), each with a committed `.env.example`. **The three frameworks read env differently** — this is non-negotiable and baked into the design:

| App | Loader | Prefix exposed to client | Example keys |
|---|---|---|---|
| `apps/api` | `dotenv` + **zod-validated** `config/env.ts` (fail-fast on boot) | n/a (server) | `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `CLOUDINARY_*`, `CORS_ORIGINS`, `WHATSAPP_NUMBER` |
| `apps/admin` | Vite built-in | **`VITE_`** | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |
| `apps/storefront` | CRA built-in | **`REACT_APP_`** | `REACT_APP_API_URL`, `REACT_APP_WHATSAPP_NUMBER` |

`apps/api/src/config/env.ts` validates with zod at startup so a missing `MONGODB_URI` or `JWT_*` secret crashes immediately with a clear message rather than failing deep in a request. All `.env*` files are gitignored (§5); only `.env.example` is committed.

#### Testing
- **api**: **Vitest + Supertest**. `app.ts` exports the Express app **without `listen()`**, so Supertest can mount it in-process. Use `mongodb-memory-server` for integration tests (no external Mongo needed in CI). Script: `vitest run` (CI) / `vitest` (watch). Recommend Vitest over Jest for consistency with admin and zero ts-jest config (Vitest runs TS via esbuild natively).
- **admin**: **Vitest + React Testing Library + jsdom** (`environment: 'jsdom'`).
- **shared**: **Vitest** for pure unit tests on enum/constant invariants.
- **storefront**: keep CRA's bundled **Jest + RTL** (`react-scripts test`). Don't migrate it — it works and the app is staying CRA.

#### Per-app npm scripts (representative)
```jsonc
// apps/api/package.json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc -p tsconfig.json",
  "start": "node dist/server.js",
  "typecheck": "tsc --noEmit",
  "lint": "eslint \"src/**/*.ts\"",
  "test": "vitest run"
}
// apps/admin/package.json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint \"src/**/*.{ts,tsx}\"",
  "test": "vitest run"
}
// apps/storefront/package.json  (unchanged CRA + lint alias)
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "lint": "eslint src --ext .js,.jsx"
}
```
Use **`tsx`** (not `ts-node`) for the API dev runner — faster, ESM-native, zero config.

---

### 4. Git Recovery Plan (corrupted history)

#### Assessment (already run — results captured)
```bash
git fsck --full        # → ~10 "object file … is empty" + "object corrupt or missing"
git log --oneline -5   # → fatal: bad object HEAD
git status             # → fails / unusable
```
**Diagnosis (confirmed):** Multiple loose objects under `.git/objects/**` are **0 bytes** (classic symptom of an interrupted write / power loss / crash during a git op). The damaged set includes commit `e1e05f5b4d1035062b90632a8d2edd4d9f2bc363`, and **every ref points at it**: `refs/heads/main`, `refs/remotes/origin/HEAD`, `refs/remotes/origin/main`. Because the tip commits themselves are gone, **local history cannot be reconstructed** from the broken `.git` alone. The **working tree is 100% intact**, and a healthy copy exists on the remote `https://github.com/Nibras-S/sm-auto.git`.

#### Options considered
- **(A) In-place repair** (`git fsck` + restore empty objects from remote via `git unpack-objects`/`git fetch`, then reset refs). Viable *only* if the remote contains the exact missing objects and they unpack cleanly. Fragile: empty loose objects can leave the index and reflog inconsistent, and you can spend hours chasing partial corruption. **Not recommended as the primary path** given multiple damaged objects including all ref tips.
- **(B) Re-init preserving the working tree with fresh clean history.** Deterministic, fast, and the current tree is exactly what we want to carry forward (we're about to restructure into a monorepo anyway, so deep history has low value). **Recommended.**

#### ✅ Recommended: re-init with a clean history, then reconcile with the remote

This preserves your files (including the 148 MB assets and all source), discards the unrecoverable broken history, and gives a single clean root commit to build the monorepo on.

```bash
# 0. SAFETY: back up the working tree first (excludes node_modules/.git noise)
#    Do this OUTSIDE the repo.
tar --exclude='./node_modules' --exclude='./.git' --exclude='./build' \
    -czf ../sm-auto-worktree-backup.tgz -C /home/nibras-s/Desktop/Projects/sm-auto .

# 1. Quarantine the corrupt git dir (don't delete yet — keep until verified)
mv .git .git.corrupt.bak

# 2. Fresh repo
git init
git branch -M main

# 3. Stage the CURRENT working tree (after, or together with, the §2 monorepo moves)
#    Ensure the new root .gitignore (§5) is in place FIRST so node_modules/build/dist
#    are never staged.
git add -A
git commit -m "chore: re-initialize repository with clean history (recover from corrupt .git)"

# 4. Re-point at the existing remote
git remote add origin https://github.com/Nibras-S/sm-auto.git
git fetch origin           # this DOWNLOADS the remote's intact history into the new repo
```

**Reconcile with remote — choose based on intent:**

- **Keep the remote's existing history and replay your working tree on top of it** (preferred if the GitHub repo's history matters to collaborators):
  ```bash
  git reset --soft origin/main      # moves HEAD to remote tip, keeps your files staged
  git status                        # your monorepo restructure now shows as pending changes
  git commit -m "refactor: restructure into pnpm monorepo (apps/storefront, api, admin, packages/shared)"
  git push origin main
  ```
  This grafts your clean tree onto the real remote history — best of both worlds (you regain history *and* fix corruption).

- **Or replace remote history entirely** with the fresh clean root (only if the remote is also suspect/disposable and you coordinate with any collaborators):
  ```bash
  git push --force-with-lease origin main
  ```

**Verify, then delete the quarantine:**
```bash
git fsck --full        # must report no errors / no empty objects
git log --oneline -5   # must work
rm -rf .git.corrupt.bak ../sm-auto-worktree-backup.tgz   # only after confirming success
```

> **Sequencing:** Do the §4 recovery and the §2 monorepo moves together — i.e., re-init, drop in the new `.gitignore`, perform the folder restructure, then make the first clean commit. That way the corrupt history is gone *and* the very first healthy commit already reflects the monorepo layout, with `build/` and `node_modules/` correctly excluded.

---

### 5. `.gitignore` Additions

The current root `.gitignore` only ignores root-level `/node_modules`, `/coverage`, `/build`, and `.env.*.local`. For a monorepo, the leading-slash anchors miss nested paths. Replace with a root-level, recursive ignore:

```gitignore
# dependencies (root + every app/package)
node_modules/
apps/*/node_modules/
packages/*/node_modules/
.pnp.*

# build / compiled output
dist/
build/                 # NOTE: a committed build/ exists at root today — remove it from the tree
apps/*/dist/
apps/*/build/
packages/*/dist/

# env (commit only *.env.example)
.env
.env.*
!.env.example
!apps/*/.env.example
!packages/*/.env.example

# logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# test / coverage
coverage/

# turbo / tooling caches
.turbo/

# os / editor
.DS_Store
.idea/
.vscode/*
!.vscode/extensions.json

# archives
*.zip
```

**Action item:** the repo currently **commits `build/` at the root** — delete it from tracking (`git rm -r --cached build` before the clean commit), since build output is now per-app and ignored.

---

### 6. Root `package.json` (orchestration)

Root is `"private": true`, holds **only** dev tooling + scripts (no runtime deps). With Turborepo present, scripts fan out across workspaces with correct ordering; `concurrently` is the simple alternative for `dev` if you'd rather not route dev through Turbo.

```jsonc
{
  "name": "sm-auto",
  "private": true,
  "packageManager": "pnpm@9",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "turbo run dev",                                  // all 3 apps' watchers, concurrent
    "dev:concurrently": "concurrently -n api,admin,store -c green,cyan,magenta \"pnpm --filter @sm/api dev\" \"pnpm --filter @sm/admin dev\" \"pnpm --filter @sm/storefront start\"",
    "build": "turbo run build",                              // shared → api/admin/storefront (topo)
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules apps/*/node_modules packages/*/node_modules"
  },
  "devDependencies": {
    "turbo": "^2",
    "concurrently": "^9",
    "prettier": "^3",
    "eslint": "^9",
    "typescript": "^5",
    "@typescript-eslint/parser": "^8",
    "@typescript-eslint/eslint-plugin": "^8",
    "eslint-config-prettier": "^9"
  }
}
```

Notes:
- `turbo run dev` works because each app declares a `dev` script (storefront aliases CRA `start` — either name it `dev` in storefront or list it explicitly: `turbo run dev start`). Simplest is to add `"dev": "react-scripts start"` to the storefront so all three expose a uniform `dev`.
- `dev:concurrently` is the fallback that runs the three watchers without Turbo, with colored, labeled output.
- `build`/`typecheck`/`test` rely on `turbo.json`'s `"^build"` to guarantee `@sm/shared` is built first.
- npm-workspaces fallback: replace `pnpm --filter @sm/X` with `npm run dev -w @sm/X` and drop `packageManager`.

---

### 7. Optional `docker-compose.yml` (local Mongo + apps)

For local dev, the **minimum useful** compose is just **Mongo** (run apps on the host for fast HMR). A full profile can containerize all apps. Mongo replica-set is included as a comment because Mongoose transactions (used later for orders/inventory consistency) require it.

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports: ["27017:27017"]
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-root}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-example}
      MONGO_INITDB_DATABASE: sm_auto
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ---- optional: containerized apps (enable with `--profile full`) ----
  api:
    profiles: ["full"]
    build: { context: ., dockerfile: apps/api/Dockerfile }
    env_file: apps/api/.env
    environment:
      MONGODB_URI: mongodb://${MONGO_USER:-root}:${MONGO_PASSWORD:-example}@mongo:27017/sm_auto?authSource=admin
    ports: ["4000:4000"]
    depends_on:
      mongo: { condition: service_healthy }

  admin:
    profiles: ["full"]
    build: { context: ., dockerfile: apps/admin/Dockerfile }
    ports: ["5173:5173"]
    depends_on: [api]

  storefront:
    profiles: ["full"]
    build: { context: ., dockerfile: apps/storefront/Dockerfile }
    ports: ["3000:3000"]
    depends_on: [api]

volumes:
  mongo_data:
```

Usage:
- **Default (recommended for dev):** `docker compose up -d mongo` → run `pnpm dev` on the host.
- **Full stack:** `docker compose --profile full up --build`.
- A `mongo-express` admin UI can be added similarly under the `full` profile if a DB GUI is wanted.

> When transactions are introduced for orders/inventory, switch the `mongo` service to a single-node replica set (`command: ["--replSet","rs0"]` + a one-time `rs.initiate()`), since Mongoose multi-document transactions require a replica set.

---

#### Summary of key recommendations
1. **pnpm workspaces + Turborepo** (npm-workspaces is the documented fallback).
2. **`@sm/shared` ships pre-built (tsup, ESM+CJS+d.ts)** so the CRA JS storefront can consume shared enums/constants — the single hard constraint that shapes the shared-package build.
3. **CRA moves wholesale** into `apps/storefront` with near-zero breakage (no eject, no `homepage`, no `@/` imports, no `proxy`); chores are deleting root `node_modules` + per-app lockfile and renaming the package to `@sm/storefront`.
4. **Git: re-init preserving the working tree, then `git fetch origin` + `git reset --soft origin/main`** to graft the clean monorepo tree onto the intact remote history — recommended over fragile in-place object repair (all ref tips are among the empty objects). Back up the tree first; quarantine `.git` rather than deleting.
5. **Remove the currently-committed root `build/`** and replace the anchored `.gitignore` with recursive monorepo rules.
6. **Root scripts** via Turbo (`dev/build/lint/typecheck/test`) with a `concurrently` dev fallback.
7. **Optional compose** = Mongo-only by default; `--profile full` for all apps; note the replica-set requirement for future transactions.

Relevant existing paths (absolute): `/home/nibras-s/Desktop/Projects/sm-auto/src` → `apps/storefront/src`; `/home/nibras-s/Desktop/Projects/sm-auto/public` → `apps/storefront/public`; `/home/nibras-s/Desktop/Projects/sm-auto/tailwind.config.js` and `/home/nibras-s/Desktop/Projects/sm-auto/postcss.config.js` → `apps/storefront/`; `/home/nibras-s/Desktop/Projects/sm-auto/build` (delete from tracking); corrupt store at `/home/nibras-s/Desktop/Projects/sm-auto/.git/objects` (empty object `…/e1/e05f5b4d1035062b90632a8d2edd4d9f2bc363` + ~9 others).


---

## Appendix A — Completeness & Consistency Audit

_Adversarial review of the design above against the full requirements spec. These are the items to resolve during M0 and as each milestone lands._

### Gaps & Inconsistencies

**Critical enum/field mismatches (will break at runtime):**

- **`Product.condition` enum mismatch.** Data Model lists `[Brand New, Used, Refurbished, OEM Surplus]`. The original product data + spec also implies "Used" parts but the storefront `AvailabilityBadge`/data uses condition values that may not map. More importantly, the **admin `ROLE_PERMISSIONS` map in the Admin App doc contradicts the canonical map in the Data Model**: Admin App gives **Inventory Manager `product.delete`** and **Viewer no `inventory.read`-equivalent breadth**, while Data Model/RBAC give Inventory Manager `product.*` (which includes delete, OK) but RBAC doc's matrix grants Sales `customer.read` only — yet Admin App's `lib/permissions.ts` omits `inquiry.*`, `category.*`, `brand.*`, `dashboard.read`, `notification.read` that the RBAC doc adds. **Three different permission sets exist across the three docs.** Pick one canonical list.

- **Marketing Manager cannot read products but the nav/route requires it.** Admin App `lib/permissions.ts` gives Marketing Manager only `["banner.write","content.write","faq.write"]`. But the RBAC doc's matrix grants Marketing `product.read`, `category.read`, `dashboard.read`, `notification.read`, and the Admin nav shows Dashboard (perm `report.read`) to all. Marketing Manager would be **locked out of `/dashboard`** (route perm `report.read`) and the banner image picker (needs product/category reads). Inconsistent.

- **Dashboard route permission is `report.read` but Marketing/Inventory lack it in the strict map.** RBAC doc adds `dashboard.read`; Admin App routes use `report.read` for `/dashboard`. Under the strict `ROLE_PERMISSIONS`, Marketing Manager has neither → cannot see the dashboard the Admin doc says every authed staff sees. Fix: gate dashboard on `dashboard.read` (granted to all staff) not `report.read`.

- **`Order.status` "Pending" alias.** Dashboard `stats` returns `orders.pending` and KPI cards label "Pending"; the canonical enum has **`Pending Verification`**, no bare `Pending`. The deep-link `/orders?status=Pending Verification` is correct but the stats field name `pending` is ambiguous — ensure it counts `Pending Verification` specifically and document it.

- **`Quotation` "Expired" auto-transition needs `validUntil` but field is optional.** Quotation.validUntil is `opt`; the daily expiry sweep and `{ validUntil: 1 }` index assume it. Quotations created without `validUntil` never expire — acceptable but undocumented; the `/status` enum includes `Expired` with no manual path described (only auto-sweep). Add manual expire or document that Expired is sweep-only. (Admin doc says "expire" is a manual action — contradicts.)

**Missing requirements (not addressed anywhere):**

- **Contact form storefront endpoint exists (`POST /inquiries/contact`) but there is NO storefront page/component wired for a generic Contact form submission** in the Storefront Integration plan. The plan wires WhatsApp inquiry, chatbot→lead, quote, checkout — but `src/pages/Contact.jsx` is only listed as a *read* (content) migration. The Contact page's actual form-submit → `POST /inquiries/contact` is unspecified. **Contact Form is one of the 4 required inquiry sources.**

- **"Frequently Bought Together" / "Similar Parts" endpoint mismatch.** API exposes `GET /products/:slug/related` returning `{ related, similar, frequentlyBoughtTogether, recentlyViewed }`. But the Storefront Integration plan references `GET /products/:slug/similar` as a *separate* endpoint that does **not exist** in the API design. Reconcile (one endpoint vs several).

- **`POST /products/:slug/view` and RecentlyViewed server route.** Storefront plan references `GET/POST /me/recently-viewed`; the API design's RecentlyViewed is only described as a collection + echoed via `?slugs=` on `/related`. **No `/me/recently-viewed` endpoints are defined** in the API doc. Admin/My-Account has no Recently Viewed either. Missing API.

- **My Account "Vehicle Information", "Quote Requests", "Inquiry History" self-service endpoints partially missing.** API defines `/me/vehicles*`, `/inquiries/mine`, `/quote-requests/mine` — good. But **`GET /me/dashboard`** aggregation and **Saved Addresses** are defined; however the **storefront `useAccount.js` references `useMyInquiries`/`useMyQuoteRequests`** which map to `/inquiries/mine` and `/quote-requests/mine` (exist) — OK. The gap: **no endpoint to fetch a single guest order for the storefront `OrderConfirmation` page by `orderNumber`+phone** is fully specified vs `GET /orders/:orderNumber` requiring `X-Guest-Token` OR `?email=` — but confirmation page uses **phone**, not email/token. Mismatch in guest-order lookup key (email/token vs phone).

- **Bulk import async job polling endpoint inconsistency.** API doc: `GET /admin/jobs/:jobId`. Admin App: `GET /admin/products/import/jobs/:id`. Infra doc: `GET /admin/products/import/jobs/:id`. **Two different job-status paths.** Also import commit path differs: API `POST /admin/products/import` vs Admin App `POST /products/import/commit` vs Infra `import/commit`. Unify.

- **Bulk import "Vehicle Fitment" DSL is defined only in Infra doc**, not in the API import spec or Admin import preview. The API/Admin treat `Vehicle Fitment` as an opaque column; Infra defines `Make>Generation>Model>Engine>YearStart-YearEnd` semicolon DSL. **The DSL order (`Make>Generation>Model`) is suspect** — Generation belongs to Model, so `Make>Model>Generation` is the natural hierarchy. The Infra example even shows `Mercedes-Benz>W213>E-Class` (generation W213 before model E-Class) which **inverts the data model's Make→Model→Generation**. Fix the DSL field order.

- **Image upload field-name inconsistency.** API: `images[]` (multipart). Admin App / Infra: **signed direct-to-Cloudinary** (`POST /admin/uploads/sign` → browser PUTs to Cloudinary → posts back `publicId`). API doc's `POST /admin/products/:id/images` says "Upload image(s) → Cloudinary" via multipart through Express — **contradicts the Infra "never route 50k images through Express" decision.** Decide: signed direct upload (Infra, correct) vs multipart-through-API (API doc). Currently both exist.

- **`POST /admin/uploads/sign` endpoint is referenced by Admin App + Infra but absent from the API endpoint reference** (the API doc only lists per-product `/images` multipart routes). Missing from canonical API surface.

- **Notification realtime channel inconsistency.** API doc: `GET /admin/notifications/stream` (SSE). Admin App: "polled or via SSE/WebSocket". Infra: `io.to(...).emit` (**Socket.IO/WebSocket**). Three different realtime transports. Pick one (SSE is simplest and already an endpoint).

- **`tokenVersion` (`ver`) field is required by RBAC/Auth design but NOT in the Data Model.** RBAC doc explicitly says "Add `tokenVersion: Number` to AdminUser and Customer" as a needed addition — but the Data Model tables do **not** include it. This is a known gap the RBAC doc flags; it must be added to the canonical model or the refresh/invalidation logic breaks.

- **Cookie naming collision across docs.** RBAC doc: `sm_cust_at/sm_cust_rt`, `sm_adm_at/sm_adm_rt`. API doc: `sm_rt` (customer), `sm_admin_rt` (staff), with access token in `Authorization` header. Admin App: access token **in memory**, refresh in httpOnly cookie. **Access-token transport differs** (httpOnly cookie per RBAC vs in-memory+Bearer per API/Admin). This is a real architectural fork — pick one (in-memory access + httpOnly refresh is what Admin/Storefront actually implement).

**Inconsistencies (naming/scoping):**

- **Customer-cancel order status set mismatch.** RBAC matrix footnote: customer may cancel when `status ∈ {New, Pending Verification}`. API `POST /admin/orders/:id/cancel` is staff-only; there is **no customer cancel endpoint** in the API doc (`GET /orders`, `GET /orders/:orderNumber` only — no `POST /orders/:id/cancel` for customers). Storefront plan also omits it. **The RBAC-granted customer cancel has no backing API.**

- **`Address` vs guest checkout.** Order stores `shippingAddress` snapshot; Storefront `Checkout.jsx` allows guest with optional address. Consistent. But **`PATCH /addresses/:id/default` "cannot delete last default unless reassigned"** logic + `Customer.defaultAddress` sync is only in API; Admin customer 360 view shows addresses but **no admin address management endpoint** (matrix gives staff R only) — acceptable, just confirm read-only.

- **Search facet source inconsistency.** API doc computes facets via `meta.facets` (Mongo `$facet`/aggregation). Infra mandates **Atlas Search `$searchMeta` facets**. The API doc's `searchTokens`/text-index approach and Infra's Atlas-Search approach coexist behind `SEARCH_DRIVER` — OK, but the API response contract (`resolvedVia`, `normalizedCode`, `suggestions`) must be producible by **both** drivers; `suggestions`/"did you mean" is **only feasible with Atlas Search**, not Mongo `$text`. Under `SEARCH_DRIVER=mongo-text`, `suggestions` will always be empty — document this degradation.

- **`Product.stockStatus` 3-enum vs `availability` 4-enum redundancy unmanaged in serializers.** Both are stored + computed; the public product card returns `availability` only, admin returns both. The On-Request case: `availability="On Request"` but `stockStatus` still computes In/Low/Out from stockQuantity even when price is null — a null-price product with stock 0 shows `availability="On Request"` + `stockStatus="Out Of Stock"`. Confusing; define `stockStatus` as null/N-A when On-Request, or document precedence.

- **Counter year-reset vs `orderNumber` format.** Counter keys `order:2026`; format `SM-O-2026-00042`. Quotation `SM-Q-2026-00088`, Inquiry `SM-INQ-2026-000123` (6 digits), QuoteRequest `requestNumber` format **unspecified**. Inconsistent zero-padding widths (5 vs 6) and QuoteRequest has no documented pattern. Standardize.

**Under-specified / risks:**

- **Guest cart identity collision.** `X-Guest-Token` (UUID, client-minted) doubles as `sessionToken` on Cart. But on `/auth/register`/`/auth/login` merge, if **two devices share no token**, the guest cart is lost. Also `Cart.customer` is `unique sparse` and `sessionToken` `unique sparse` — a guest who logs in then out then back in as guest gets a new token → orphaned carts (TTL handles cleanup, but **merge-on-login dedupe** when the same product exists in both is "sum qty" in API vs "max qty" in RBAC doc — **conflict: sum vs max**).

- **Stock reservation race at checkout.** Order create "reserves stock (Inventory `reserved += qty`)" but there is **no transaction/locking spec**. At 50k scale + concurrent guest checkouts, `reserved += qty` without `findOneAndUpdate` atomic guard + replica-set transaction risks oversell. Infra notes transactions need a replica set (compose comment) but the **order service never states it uses a session/transaction** across Order insert + Inventory update + StockMovement. High risk.

- **`StockMovement.type` enum vs reservation.** Includes `reservation`/`release`. Order confirm "converts reservation→`sale`". But committing must **decrement quantity AND clear reserved** atomically; the movement log needs a `sale` that also reduces `reserved`. The `quantityBefore/After` semantics for reservation (which doesn't change `quantity`, only `reserved`) are **undefined** — `quantityChange` signed against what? Clarify reservation movements track `reserved`, not `quantity`.

- **`Inquiry.whatsappMessage` server generation vs storefront `whatsapp.js` field names.** Storefront builder uses `{ name, phone, year, carMake, carModel, vin, emirate, notes }`. API `POST /inquiries/whatsapp` accepts `vehicle{brand,model,year,...}`. The **`carMake→brand`, `carModel→model`, `emirate` (dropped?)** mapping must be explicit; `emirate` has no home in `Inquiry.vehicle` subdoc (`{brand,model,year,generation,engineType,vin}` — **no emirate field**). Emirate from the WhatsApp form is **lost**.

- **Reports PDF/Excel for "Products" and "Inquiries" export — Inquiries report uses `lead.read`? No — `report.read`.** Consistent. But **Reports require `report.read`; Marketing Manager lacks it** → cannot export content/banner-related reports (none required for Marketing, OK). Just confirm no Marketing report need.

- **Content "Returns" page.** `ContentPage.slug` enum includes `returns`; storefront has `Returns.jsx`. Good. But **`returns` is not in the Admin content list defaults** consistently (Admin doc lists about/contact/terms/privacy/returns — OK). Minor.

- **Banner `placement` `category-top` has no storefront consumer** in the integration plan (only home-hero used). Unused enum value — low risk, but no `useBanners(placement)` wiring for category pages.

### Prioritized Fixes

1. **Unify the permission model.** Produce ONE canonical `ROLE_PERMISSIONS` + permission-key list (reconcile Data Model vs RBAC vs Admin App). Specifically: add `dashboard.read`, `notification.read`, `category.*`, `brand.*`, `inquiry.*` keys; grant Marketing Manager `dashboard.read` + `product.read` + `category.read`; gate `/dashboard` on `dashboard.read` not `report.read`. Fix Admin App `lib/permissions.ts` to match. (Blocks all RBAC enforcement.)

2. **Add `tokenVersion: Number (default 0)` to AdminUser and Customer in the canonical Data Model.** Without it, refresh-rotation/instant-invalidation in the Auth design is unimplementable.

3. **Resolve access-token transport fork.** Standardize on **in-memory access token + httpOnly Secure refresh cookie** (what Admin + Storefront implement). Update the RBAC doc's "access token in httpOnly cookie" claim and unify cookie names (`sm_cust_rt`/`sm_adm_rt`). Update API doc's `sm_rt`/`sm_admin_rt` accordingly.

4. **Decide image upload path = signed direct-to-Cloudinary.** Remove/redefine the API's multipart `POST /admin/products/:id/images` to be the **persist-callback** (accept `{publicId,url,...}`), and **add `POST /admin/uploads/sign`** to the canonical API endpoint reference. Align field names. (Infra's "no 50k images through Express" is correct and binding.)

5. **Add the missing customer-cancel order endpoint:** `POST /orders/:orderNumber/cancel` (customer, ownership + state-machine `status ∈ {New, Pending Verification}`), since RBAC grants it. Wire it in the storefront My-Account order detail.

6. **Wrap order creation + stock reservation in a Mongo transaction (replica set required).** Specify `session`-bound: Order insert → atomic `Inventory.findOneAndUpdate({available>=qty}, {$inc:{reserved}})` → StockMovement. Define reservation movement semantics (`reserved` delta, `quantity` unchanged). Switch dev Mongo to single-node replica set. (Prevents oversell.)

7. **Fix the bulk-import Vehicle Fitment DSL field order** to `Make>Model>Generation>Engine>YearStart-YearEnd` (Generation under Model, matching the taxonomy), correct the Infra example, and **document the DSL in the API + Admin import specs** (currently only in Infra).

8. **Unify async job + import endpoint paths.** One commit path (`POST /admin/products/import`) and one job-poll path (`GET /admin/jobs/:jobId`). Update Admin App + Infra references.

9. **Reconcile related/similar/FBT endpoints.** Keep the single `GET /products/:slug/related` returning all sets; delete the storefront plan's references to a separate `GET /products/:slug/similar`. **Add `GET/POST /me/recently-viewed`** to the API (referenced by storefront, currently undefined).

10. **Wire the Contact form submit** (`src/pages/Contact.jsx` → `POST /inquiries/contact`) in the Storefront Integration plan — currently only its content is migrated, leaving a required inquiry source unimplemented client-side.

11. **Add `emirate` (and `area`) to the inquiry/order `VehicleInfo`-adjacent capture or to Inquiry top-level**, so the WhatsApp form's `emirate` field isn't dropped. Define the explicit storefront→DTO field map (`carMake→vehicle.brand`, `carModel→vehicle.model`, `emirate→?`).

12. **Fix guest-order lookup key consistency.** `OrderConfirmation` uses `orderNumber`+phone; API's `GET /orders/:orderNumber` accepts `X-Guest-Token`/`?email=`. Add `?phone=` as an accepted guest-verification param or change the confirmation page to carry the guest token.

13. **Resolve cart-merge dedupe rule:** pick **sum qty** (API) or **max qty** (RBAC) — recommend sum — and state it in both docs.

14. **Standardize human-number formats:** define `requestNumber` pattern (`SM-QR-2026-00042`), and fix zero-pad widths (Inquiry 6 vs others 5). One convention.

15. **Document search-driver degradation:** under `SEARCH_DRIVER=mongo-text`, `suggestions`/"did you mean" and fuzzy/facet-count fidelity are reduced; ensure the `meta.query.resolvedVia`/`suggestions` contract is satisfiable (empty) by the Mongo driver. Pick SSE as the single notification realtime transport and drop the WebSocket/Socket.IO mention (or vice-versa) consistently.

16. **Clarify `stockStatus` when `availability="On Request"`** (null-price): set `stockStatus = null`/`N/A` or document that it's ignored, to avoid "On Request + Out Of Stock" contradictions in admin lists.

17. **Pin Quotation `Expired`** semantics: either add a manual `PATCH /status → Expired` path (Admin doc implies a manual "expire" action) or remove that affordance and rely solely on the `validUntil` sweep; make `validUntil` effectively required for any quote that should auto-expire.
