# Spare Mec — Delivery Roadmap

> Phased build plan for the platform described in [ARCHITECTURE.md](ARCHITECTURE.md).
> Effort sizes are rough: **S** ≈ 1–2 days, **M** ≈ 3–5 days, **L** ≈ 1–2 weeks (single dev).

## Delivery Blocks (active plan)

We build in **larger functional blocks** rather than one milestone at a time — completing the
full foundation first, then grouping tightly-related milestones so the sales pipeline and core
platform come online in coherent stretches. The detailed milestone breakdown still applies inside
each block (see Milestone Summary below).

| Block | Contents (milestones) | Outcome | Status |
|-------|-----------------------|---------|--------|
| **A — Foundation** | M0 | Git recovery, monorepo, `@sm/shared`, API skeleton, auth + RBAC core, admin shell, storefront migration | ✅ Done |
| **B — Catalog Core** | Catalog · Brands · Fitment · Images · Search · Storefront | Product/category/brand admin CRUD, Cloudinary images, vehicle fitment, search, live storefront. **No inventory** — availability is manual (status + Available/On Request). | ✅ Done |
| **C — Sales Pipeline** | WhatsApp Inquiry · Orders/Checkout · Quote Requests · Chatbot lead · Customers · Order status | All three purchase flows + CRM intake end-to-end | ✅ Done |
| **D — Platform & Accounts** | Customer Accounts (+Google/reset) · My Account · Quotations+PDF · Dashboard · Notifications · CMS · Bulk Import · RBAC+Audit · Reports | Full CRM + customer self-service + content + ops management | ✅ Done |
| **E — Scale & Hardening** | Search Upgrade · Performance · Payments seam · ESLint · Production Hardening | 50k-product readiness, ops, security | ⬜ Next |

**Block A progress:** git recovered · monorepo + workspaces · `@sm/shared` (canonical enums + one
RBAC permission map, resolving Appendix A fix #1) · API skeleton (env, Mongo, helmet/cors/rate-limit,
health, error contract) · auth + RBAC core (AdminUser/Customer with `tokenVersion`, JWT in-memory
access + httpOnly refresh, bcrypt, `requireRole`/`requirePermission`) · admin shell (Vite + TS +
Tailwind, silent-refresh axios client, role-gated nav, login + protected routes) · seed-admin script.

## Milestone Summary

| ID | Milestone | Goal (one line) | Depends on | Effort |
|----|-----------|-----------------|-----------|--------|
| **M0** | Foundations | Monorepo, git recovery, shared types, API skeleton, Mongo, auth + RBAC core, storefront moved, env/CI | — | **L** |
| **M1** | Catalog Vertical Slice | Products/Categories/Brands/Subcategories model → API → admin CRUD → storefront wired + basic search | M0 | **L** |
| **M2** | Cloudinary Images | Signed direct upload, multi/sortable/replaceable product images, banner/logo assets | M1 | **M** |
| **M3** | Vehicle Taxonomy & Fitment | Make/Model/Generation, Fitment collection + embedded copy, fitment-aware search | M1 | **M** |
| **M4** | Inventory & Stock | Warehouse, Inventory, StockMovement ledger, low-stock alerts, admin stock UI | M1 | **M** |
| **M5** | Purchase Method 1 — WhatsApp Inquiry + CRM Intake | Inquiry collection, guest WhatsApp inquiry API + CRM copy, storefront drawer wired, admin Inquiries list | M0, M1 | **M** |
| **M6** | Purchase Method 2 — Cart & Checkout / Orders | Cart, Order, guest checkout → Pending Verification, stock reservation, admin Orders workflow | M1, M4, M5 | **L** |
| **M7** | Purchase Method 3 — Quote Requests + Chatbot Leads | QuoteRequest, Lead, chatbot → Lead (1h SLA), admin Leads/QuoteRequests | M5 | **M** |
| **M8** | Customer Accounts & My Account | Customer auth (local + Google), addresses, vehicles, wishlist/cart merge, My Account screens | M0, M5, M6 | **L** |
| **M9** | Quotations | Staff-produced priced quotes, PDF, send, status, convert → Order | M2, M6, M7 | **M** |
| **M10** | CMS — Banners / FAQ / Content / Settings | Banners (reorder), FAQ, ContentPages, Setting/SiteConfig, retire IS_COMING_SOON | M2 | **M** |
| **M11** | Dashboard + Reports + Notifications | KPI/charts dashboard, 5 reports + export, persist-then-fanout notifications | M4, M6, M7 | **L** |
| **M12** | Bulk Import | Excel template, validate, upsert, row errors, background job | M1, M3, M4 | **M** |
| **M13** | RBAC Management UI | Staff user CRUD, role/permission-override editor, audit log viewer | M0 | **S** |
| **M14** | Scale, Search Upgrade & Hardening | Atlas Search, caching/cursors, security hardening, payments seam, GCC/RTL readiness | M1, M6, M11 | **L** |

**Critical path (longest dependency chain):** M0 → M1 → M5 → M6 → M9/M11 → M14. M2/M3/M4 hang off M1 and can run in parallel once M1 lands. M10/M13 are independent of the sales chain and can be slotted whenever capacity allows.

**What unblocks what (at a glance):**
- M0 unblocks everything (no real work proceeds without it).
- M1 is the architecture-validation slice — it proves the model→API→admin→storefront round-trip and unblocks M2, M3, M4, M5, M12.
- M4 (reservation logic) + M5 (Inquiry intake) unblock M6 (Orders).
- M5/M6/M7 (the three purchase methods) feed M9 (Quotations) and M11 (Dashboard data has volume to aggregate).
- M2 (images) unblocks M9 (quotation PDF assets) and M10 (banners).

---

## M0 — Foundations

**Goal:** Stand up the monorepo, recover git, ship the shared contracts package, an Express+TS API skeleton with Mongo connectivity, the two-realm auth + RBAC core, relocate the CRA storefront, and wire env/CI — so every later milestone has a stable, type-safe, deployable base.

**Scope / deliverables:**
- **Repo & tooling:** pnpm workspaces + Turborepo; `apps/{api,admin,storefront}` + `packages/shared`; root `tsconfig.base.json`, ESLint/Prettier, `.nvmrc` (Node 20), recursive `.gitignore`.
- **Git recovery:** back up working tree → quarantine corrupt `.git` → `git init` → drop new `.gitignore` (so `node_modules`/`build` never staged) → perform the storefront move in the same restructure → first clean commit → `git remote add origin` + `git fetch origin` → `git reset --soft origin/main` to graft clean tree onto intact remote history → push. `git rm -r --cached build`. Verify `git fsck` clean before deleting quarantine.
- **Storefront relocation:** `git mv src/public/tailwind/postcss/package.json` into `apps/storefront/`; rename package to `@sm/storefront`; delete root `node_modules` + per-app lockfile; add `@sm/shared` dep + storefront `dev` script alias; smoke-test `start`/`build` unchanged.
- **Shared package (`@sm/shared`):** tsup dual build (ESM+CJS+d.ts); `enums.ts` (literal copy of the canonical Enums Reference — OrderStatus, InquirySource/Status, QuoteStatus, Availability, ProductStatus, Condition, StockMovement.type, Notification.type, Banner.placement, AdminUser.role, etc.), `constants.ts` (WHATSAPP_NUMBER `971507855298`, defaults), `ROLE_PERMISSIONS` map + permission-key constants.
- **API skeleton:** `app.ts` (no `listen`) + `server.ts`; module folder convention; zod-validated `config/env.ts` (fail-fast); Mongoose connection (pooled, single); `helmet`, `cors` allowlist, `express-mongo-sanitize`, `express.json({limit:'1mb'})`, request-id + `pino` logging; global error envelope `{error:{code,message,details?,requestId}}`; `/healthz` + `/health/ready`.
- **Auth + RBAC core:** `AdminUser` + `Customer` models (with `tokenVersion`, `refreshTokenHash select:false`, `permissionOverrides`); argon2id hashing; JWT access (15m) + opaque rotating refresh (hashed) with reuse-detection; **two realms** (distinct secrets + `aud` claim), httpOnly cookies (+ bearer dual-read); `authenticate(realm)`, `optionalAuth`, `requirePermission`, `requireRole`, `requireFreshAuth`, `csrfGuard`, rate-limit middleware (Redis store seam, in-memory acceptable for now). `POST /admin/auth/login|refresh|logout` + `GET /admin/auth/me`. Seed script: one Super Admin, default Warehouse, `Setting/SiteConfig` from `siteConfig.js`.
- **CI/CD:** GitHub Actions per-app matrix (`install → typecheck → lint → test → build`, `^build` topo so `shared` builds first); `.env.example` per app; `docker-compose` Mongo-only for local.

**Dependencies:** none.

**Acceptance — done when:**
- `git fsck --full` reports clean; remote history present; `git log` works; monorepo committed with storefront at `apps/storefront`.
- `pnpm install && pnpm build && pnpm typecheck && pnpm lint` pass from root; CI green on PR.
- `pnpm --filter @sm/storefront start` serves the existing CRA unchanged; `@sm/shared` enums import and run in storefront JS, admin TS, and API TS.
- API boots, connects to Mongo, `/healthz` + `/health/ready` return ok; boot crashes fast on a missing env var.
- A seeded Super Admin can log in via `/admin/auth/login`, receive rotating tokens, hit `/admin/auth/me` returning resolved permissions; a customer-audience token is rejected on an `/admin/*` route (403/401); refresh-token reuse triggers revoke.

**Effort:** **L**

---

## M1 — Catalog Vertical Slice (architecture validation)

**Goal:** Prove the full model → API → admin CRUD → storefront-wired round-trip on the catalog, with basic Mongo-text search — the thin slice that de-risks every later module.

**Scope / deliverables:**
- **Models:** `Product` (full canonical shape incl. nullable `price`/`costPrice`, `searchTokens`, `availability`/`stockStatus` computed via pre-save hook, `status`, `isDeleted`, denormalized `brandName`/`categoryName`/`primaryImage`), `Category` (+ `productCount` denorm), `Subcategory`, `Brand` (`kind` flag). Indexes per strategy; **Mongo `$text`** index on Product (the MVP `MongoTextProvider`).
- **`SearchService` interface** with `MongoTextProvider` impl (identifier-normalize path + `$text` relevance + facet `$facet`); `SEARCH_DRIVER` flag (Atlas slot reserved for M14).
- **Public API:** `GET /products`, `/products/:slug`, `/products/search`, `/products/autocomplete`, `/products/featured|trending|:slug/related`, `POST /products/:slug/view`; `GET /categories`, `/categories/:slug`, `/subcategories`, `/brands`. Pricing-visibility rule enforced (`price:null → On Request → checkoutEligible:false`; `costPrice`/`compareAtPrice`/`taxRate` stripped from public).
- **Admin API:** full CRUD for products/categories/subcategories/brands (create auto-slug, derive searchTokens, recompute availability + productCount, AuditLog), status toggle, soft delete; admin list supersets (all statuses, cost data).
- **Admin app bootstrap + screens:** Vite+TS scaffold, router + `AppShell`/Sidebar (nav permission-gated), TanStack Query + axios (interceptors/refresh), `DataTable`, base `ui/` + `form/` primitives, `StatusBadge`, `Money`, `lib/permissions.ts` mirror. Screens: Login, Products list, Product add/edit form (all fields **except** images/fitment-pickers which land in M2/M3 — leave placeholders), Categories/Subcategories/Brands management.
- **Storefront wiring (read path):** `src/api/{client,endpoints,normalize,queryClient}.js` + hooks (`useProducts`, `useProduct`, `useCategories`, `useCategory`, `useFeatured/Trending`, `useProductBrands`); DTO normalizer (API→legacy shape, availability remap, `primaryImage.url`); `formatPrice` fils util; `AvailabilityBadge` 4-enum + `PriceBlock` (kills mock-price hack). Cut over Catalogue (server-driven filter/sort/page), Category, Categories, Home sections, Wishlist read. Static `src/data/*` kept as fallback.
- **Migration script:** map legacy `availability` ("Limited Stock"→"Low Stock", "Made to Order"→"On Request"), seed products/categories/brands from `src/data/*`.

**Dependencies:** M0.

**Acceptance — done when:**
- An Inventory Manager creates/edits/hides/soft-deletes a product in the admin; changes appear in `GET /products` and on the storefront.
- Storefront Catalogue/Category/Home/ProductDetail render from the API (not static data); filters/sort/pagination are server-driven; an On-Request product shows "On Request" with no price and `checkoutEligible:false`; a priced product shows AED price.
- Search returns results for a pasted part code (`A4602407018`, normalized) and a phrase (`Engine Mount Mercedes`); autocomplete returns grouped suggestions; facet counts populate filter sidebar.
- Public product payload never contains `costPrice`/`compareAtPrice`/`taxRate`; admin payload does (gated).
- Seeded/migrated catalog data is queryable with correct remapped availability.

**Effort:** **L**

---

## M2 — Cloudinary Images

**Goal:** Real image management: signed direct-to-Cloudinary uploads with multiple, sortable, replaceable product images, plus banner/brand/category/avatar assets — the storefront galleries and admin uploaders go live.

**Scope / deliverables:**
- **API:** `cloudinary.service.ts` (signed uploads, server-only secret); `POST /admin/uploads/sign` (RBAC-gated by target perm, rate-limited); product image endpoints — `POST /:id/images`, `PATCH /:id/images/reorder`, `PUT /:id/images/:imageId` (replace, same `public_id`, `invalidate`), `DELETE /:id/images/:imageId` (Cloudinary destroy → `$pull`, idempotent). Folder/`public_id` conventions; signed upload preset (format/size/transform caps). `primaryImage` denorm sync on reorder/delete.
- **Orphan safety:** cleanup outbox/queue for deletes + nightly reconciliation cron (diff Cloudinary folder vs referenced `publicId`s).
- **Shared `cloudinaryUrl.ts`** variant builder (`thumb/card/detail/zoom/og`, `f_auto/q_auto/dpr_auto`).
- **Admin:** `ImageUploader` (Dropzone + signed direct upload + progress, dnd-kit `SortableImageGrid`, set-primary/replace/delete/alt) wired into Product form; single-image mode reserved for banners/logos/avatars.
- **Storefront:** `ImageGallery` on ProductDetail (sortable thumbnails + zoom, fallback to `primaryImage`); `srcSet` responsive delivery on cards/detail.

**Dependencies:** M1.

**Acceptance — done when:**
- An admin uploads multiple product images straight to Cloudinary (bytes bypass the API), reorders them, sets primary, replaces one in place (URL stable), and deletes one; DB `images[]` + `primaryImage` reflect each change.
- The Cloudinary `api_secret` never appears in any browser bundle/response; the sign endpoint rejects non-permitted roles.
- Storefront product cards/detail render Cloudinary URLs with `f_auto/q_auto` and responsive `srcSet`; the detail gallery zoom works.
- A deleted image leaves no orphan (reconciliation/cleanup removes assets with zero DB refs).

**Effort:** **M**

---

## M3 — Vehicle Taxonomy & Fitment

**Goal:** Structured vehicle data (Make→Model→Generation) and the Fitment collection powering "search by vehicle" and the product-page fitment table, with the embedded copy kept in sync.

**Scope / deliverables:**
- **Models:** `VehicleModel`, `VehicleGeneration` (Make = `Brand` with `kind∋vehicle`); `Fitment` collection (source of truth, denormalized `makeName/modelName/generationCode`, year-range fields) + `Product.fitment[]` embedded copy.
- **API:** public cascades `GET /vehicles/makes`, `/makes/:id/models`, `/models/:id/generations`, `/generations/:id/years|engines`; `GET /products/by-fitment` (year-overlap rule). Admin: vehicle model/generation CRUD, `GET/POST/PUT/DELETE /admin/fitments` (sync collection ↔ embedded copy). Extend `SearchService` with Fitment-join path + denormalized fitment fields in text index.
- **Admin:** `FitmentEditor` field-array (dependent Make→Model→Generation selects + engine/year/position/note/isVerified) in Product form.
- **Storefront:** `FitmentTable` (structured Brand/Model/Generation/Engine/Year-Range) on ProductDetail; `useProductsByFitment` and vehicle-filter inputs feeding search.

**Dependencies:** M1 (M2 optional, parallel).

**Acceptance — done when:**
- Admin adds fitment rows to a product; both the Fitment collection and `Product.fitment[]` stay consistent (verified on edit/delete).
- `GET /products/by-fitment?make=BMW&generation=E90&year=2008` returns only products whose fitment year-range overlaps; `"BMW E90 Control Arm"` resolves via the fitment-join + text path.
- ProductDetail shows a structured fitment table; storefront vehicle pickers cascade correctly.

**Effort:** **M**

---

## M4 — Inventory & Stock

**Goal:** Authoritative per-warehouse stock with an append-only movement ledger, low-stock detection, and an admin inventory surface — the reservation primitive Orders depend on.

**Scope / deliverables:**
- **Models:** `Warehouse` (one default enforced), `Inventory` (`{product,warehouse}` unique, `quantity/reserved/available`), `StockMovement` (append-only, signed, before/after, type enum, performedBy, polymorphic ref).
- **API:** `GET /admin/inventory`, `/low-stock`, `/product/:productId`, `/movements` (cursor); `PATCH /admin/inventory/:id` (set/delta → recompute available + `Product.stockQuantity`/availability if default WH, append movement, emit Low-Stock notification stub), `POST /adjust`, `POST /transfer` (transfer_in/out, `422 INSUFFICIENT_STOCK`); warehouse CRUD. Product create/edit seeds default-warehouse Inventory + initial `adjustment` movement (wires back into M1 product writes).
- **Reservation service primitives:** `reserve(product, qty)` / `release(...)` / `commitSale(...)` used by Orders in M6 (built here, called there).
- **Admin:** Inventory `DataTable` (qty/reserved/available/status/threshold, low-stock filter + banner), stock-adjust Drawer (set/delta + reason + movement type), Stock Movements audit timeline.

**Dependencies:** M1.

**Acceptance — done when:**
- Adjusting stock recomputes `available` and `Product.stockQuantity`/availability and appends an immutable StockMovement with correct before/after and actor; movements cannot be edited/deleted.
- Crossing the low-stock threshold flags the product as Low Stock and surfaces it in `/low-stock` + the admin banner.
- A transfer between warehouses produces paired movements; an over-quantity transfer/adjust is rejected.
- `reserve`/`release`/`commitSale` correctly mutate `reserved`/`quantity` (unit-tested), ready for M6.

**Effort:** **M**

---

## M5 — Purchase Method 1: WhatsApp Inquiry + CRM Intake

**Goal:** Ship the primary inquiry funnel end-to-end — guest builds a WhatsApp inquiry, the server saves the CRM copy + returns the `wa.me` link, and staff see it in a unified Inquiries list.

**Scope / deliverables:**
- **Model:** `Inquiry` (unified, all sources; `inquiryNumber` via `Counter`; structured `vehicle` subdoc; `whatsappMessage`/`whatsappLink`; items subdoc). `Counter` model + atomic sequence helper. `Notification` model (created here; CRM-only fan-out, email/WhatsApp deferred to M11).
- **Server-side WhatsApp builder** mirroring `src/utils/whatsapp.js` (authoritative message + link to `971507855298` from Settings).
- **API:** `POST /inquiries/whatsapp` (guest/customer?, required `customerName`, returns `{inquiryNumber, whatsappLink, whatsappMessage}`), `POST /inquiries/contact`, `GET /inquiries/mine`; admin `GET /admin/inquiries`, `/:id`, `PATCH /:id/status|assign`, `POST /admin/inquiries` (manual), `POST /:id/convert` stub. Public-write rate limiting + captcha hook.
- **Storefront:** `src/api/inquiries.js` + `createInquiry`; `InquiryDrawer` handler `await createInquiry(...)` (optimistic, never blocks) then opens `wa.me`; map drawer fields (`carMake→vehicle.brand`, etc.) + items → DTO; single-item inquiry on ProductDetail.
- **Admin:** Inquiries list (`DataTable`, source/status/assignee filters), `InquiryDetailDrawer` (full fields + stored `whatsappMessage`/link), status pipeline + assign.

**Dependencies:** M0, M1.

**Acceptance — done when:**
- A guest submits a WhatsApp inquiry (only Customer Name required); the server persists an Inquiry with `source:"WhatsApp Inquiry"`, generates the same message body as the storefront util, returns a `wa.me` link the client opens, and assigns a unique `inquiryNumber`.
- The inquiry appears in the admin Inquiries list with its CRM copy of the message; staff can change status and assign it.
- A logged-in customer's inquiry links to their `customer` and shows in `/inquiries/mine`.
- A `New Inquiry` Notification row is created (in-CRM).

**Effort:** **M**

---

## M6 — Purchase Method 2: Cart & Checkout / Orders

**Goal:** Direct checkout (guest allowed, Customer Name only) producing an Order that enters Pending Verification with stock reserved, plus the full admin 8-status order workflow.

**Scope / deliverables:**
- **Models:** `Cart` (customer or `sessionToken`; CartItem snapshots; `isOnRequest`), `Order` (`orderNumber` via Counter; OrderItem full snapshot; address snapshot; vehicle subdoc; status/payment enums; statusHistory; notes; milestone timestamps).
- **API (storefront):** `GET /cart`, `POST/PATCH/DELETE /cart/items`, `DELETE /cart`, `POST /cart/merge` (guest-token aware); `POST /orders` (load items/cart, **reject null-price → `422 PRODUCT_NOT_PURCHASABLE`**, re-validate prices, check inventory `422 INSUFFICIENT_STOCK`, snapshot, compute totals in fils, generate orderNumber, `New`→`Pending Verification`, **reserve stock** + reservation movement, clear cart, emit New-Order notification, customer confirmation hook), `GET /orders` (own), `GET /orders/:orderNumber` (owner or guest token/email).
- **API (admin):** `GET /admin/orders`, `/:id`, `POST /admin/orders` (CRM/walk-in), `PATCH /:id/status` (validated transition map; `Confirmed`→commit reservation to sale, `Cancelled`→release; milestone timestamps; statusHistory; Order-Status notification; AuditLog), `PATCH /:id/payment`, `POST /:id/notes`, `PATCH /:id` (pre-dispatch edit), `POST /:id/cancel`.
- **Storefront:** `CartContext` (priced items only) + `useCart`; `CartDrawer`, `Cart.jsx` (`/cart`), `Checkout.jsx` (`/checkout`, required name, optional everything else, payment optional), `OrderConfirmation.jsx` (`/order/confirmation/:orderNumber`); "Add to Cart" routes priced→Cart, On-Request→Inquiry. `src/api/orders.js`.
- **Admin:** Orders list + Order detail (items/totals/customer/address/vehicle/payment/status-history/notes) with guarded status-transition control.

**Dependencies:** M1, M4 (reservation), M5 (Notification + On-Request routing).

**Acceptance — done when:**
- A guest checks out with only a Customer Name; an Order is created, transitions to **Pending Verification**, reserves stock (verified via StockMovement `reservation` + `Inventory.reserved`), clears the cart, and returns an `orderNumber` + tracking URL.
- Adding/attempting to checkout an On-Request (null-price) item is rejected with `PRODUCT_NOT_PURCHASABLE`; ordering more than available returns `INSUFFICIENT_STOCK`.
- Admin advances an order through the 8-status workflow; illegal jumps return `INVALID_STATE_TRANSITION`; `Confirmed` commits the reservation to a sale and `Cancelled` releases it; each change appends statusHistory + sets milestone timestamps.
- A `New Order` Notification is raised; guest can look up their order by `orderNumber` + phone/email.

**Effort:** **L**

---

## M7 — Purchase Method 3: Quote Requests + Chatbot Leads

**Goal:** Complete the third purchase method (Request a Quote) and the chatbot Lead funnel with the 1-hour SLA, all flowing into the unified CRM.

**Scope / deliverables:**
- **Models:** `QuoteRequest` (`requestNumber`, required name+mobile; mirrors into an Inquiry `source:"Quote Request"`), `Lead` (chatbot-generated, `slaDueAt`, status aligned with Inquiry).
- **API:** `POST /quote-requests` (guest/customer?, required name+mobile, writes Inquiry mirror, New-Quote-Request notification), `GET /quote-requests/mine`; admin `GET /admin/quote-requests`, `/:id`, `PATCH /:id/status|assign`. `POST /inquiries/chatbot` (creates Inquiry `Chatbot` + linked Lead `slaDueAt=now+1h`, returns the SLA thank-you message); admin `GET /admin/leads`, `/:id`, `POST /admin/leads`, `PATCH /:id`, `DELETE /:id` (incl. `overdueSla` filter).
- **Storefront:** `QuoteRequestModal` + `RequestQuote.jsx` (`/request-quote`, openable from ProductDetail/Cart); `src/api/quotes.js`. `ChatWidget`: add **Name** step, `await createLead(...)` on summary before WhatsApp, show "Thank you. Our sales team will contact you within 1 hour."; `src/api/leads.js`.
- **Admin:** Quote Requests list, Leads list (with `slaDueAt` countdown/overdue badge), status/assign.

**Dependencies:** M5 (Inquiry/Notification/Counter infra).

**Acceptance — done when:**
- A guest submits a quote request (name + mobile required); a `QuoteRequest` is created with a `requestNumber` AND a mirrored Inquiry row, and a New-Quote-Request notification fires.
- Completing the chatbot flow creates a Chatbot Inquiry + a linked Lead with `slaDueAt = now+1h`, and the storefront shows the exact SLA thank-you line.
- Admin sees Leads with an overdue-SLA filter/badge and can assign/progress them; Quote Requests are listable and assignable.

**Effort:** **M**

---

## M8 — Customer Accounts & My Account

**Goal:** Optional customer accounts (local + Google) with guest browsing preserved, server-side wishlist/cart merge on login, and the full My Account area.

**Scope / deliverables:**
- **API:** `POST /auth/register|login|google|refresh|logout`, `GET /auth/me`, forgot/reset/verify; guest cart/wishlist **merge hooks** on register/login. `Wishlist` model + `GET/POST/DELETE /wishlist`, `/toggle`, `/merge`. Addresses (`/addresses` CRUD + default). Self-service `/me/profile`, `/me/password`, `/me/vehicles*`, `/me/dashboard`. Google Authorization-Code flow server-side (verify ID token vs JWKS, account linking rules).
- **Storefront:** `AuthContext` (in-memory access token, refresh via cookie), `src/api/auth.js`; `Login/Register/ForgotPassword` pages; `@react-oauth/google`; `RequireAuth` (account routes only — public stays open). `WishlistContext` proxies server when authed + merges on login; `Inquiry/Cart` merge on login. My Account: `AccountLayout` + Dashboard/Profile/Addresses/Wishlist/Orders/OrderDetail/Inquiries/Vehicles/Quotes; `useAccount` hooks. Navbar account/login affordance + cart icon.

**Dependencies:** M0 (auth core), M5 (inquiries to list), M6 (orders + cart merge).

**Acceptance — done when:**
- A guest registers/logs in (email+password and Google); access token lives in memory, refresh in an httpOnly cookie; a customer token is rejected on admin routes.
- On login, the guest localStorage cart and wishlist merge into the server `Cart`/`Wishlist` (union, qty-summed) and local copies clear.
- My Account shows the customer's orders, inquiries, quote requests, wishlist, saved addresses, and vehicles; profile/password/vehicle edits persist.
- All public browse/search/inquiry/checkout paths still work with no login.

**Effort:** **L**

---

## M9 — Quotations

**Goal:** Staff-produced priced quotations with PDF generation, send via email/WhatsApp, status lifecycle, and convert-to-Order — closing the inquiry/quote-to-sale loop.

**Scope / deliverables:**
- **Model:** `Quotation` (`quotationNumber`, items subdoc with fils unit/line totals, status enum, `validUntil`, `pdfFile`, source links, `createdBy`).
- **API:** `GET /admin/quotations`, `/:id`, `POST` (Draft, compute totals), `PUT` (Draft only), `PATCH /:id/status` (Draft→Sent→Approved/Rejected/Expired; Approved links source→Converted), `POST /:id/send` (render PDF via **pdfmake** → Cloudinary `raw` → status Sent + sentAt + email/WhatsApp dispatch), `POST /:id/convert` (→ Order), `GET /:id/pdf`; public signed-token `GET /quotations/:quotationNumber/public`. Daily expiry sweep on `validUntil`. Inquiry/QuoteRequest `convert` endpoints now produce a Quotation.
- **Admin:** Quotations list, create/edit form (`LineItemsEditor`, pre-fill from Inquiry/QuoteRequest), detail (status timeline, PDF, convertedOrder link); Send/Approve/Reject/Convert actions.
- **Storefront:** customer sees sent quotations under `/account/quotes` (read); public signed-link view.

**Dependencies:** M2 (Cloudinary raw for PDF), M6 (Order convert target), M7 (QuoteRequest/Lead sources).

**Acceptance — done when:**
- Staff create a Draft quotation from a quote request (pre-filled), edit line items (totals auto-compute in fils), and Send — a PDF is generated, stored on `pdfFile`, status → Sent, and the customer is emailed the link.
- Status transitions are guarded (editing a non-Draft → `INVALID_STATE_TRANSITION`); expired quotations auto-flip via the sweep.
- Approving + converting spawns an Order with the quoted items and links `convertedOrder`.
- The customer can view a sent quotation via the signed public link without logging in.

**Effort:** **M**

---

## M10 — CMS: Banners / FAQ / Content / Settings

**Goal:** Make all editable site content staff-managed — banners (reorder/schedule), FAQs, content pages, and the Setting/SiteConfig doc — and retire the hardcoded coming-soon flag.

**Scope / deliverables:**
- **Models/API:** `Banner` (`GET /banners`, admin CRUD + `PATCH /reorder`, image upload), `FAQ` (CRUD + reorder), `ContentPage` (`GET /content/:slug`, admin upsert + publish, version bump), `Setting/SiteConfig` (`GET /settings/public`, `GET/PUT /admin/settings`, logo upload; `features.comingSoon`).
- **Admin:** Banners (grouped by placement, dnd-kit reorder, schedule/hide), FAQ (drag-reorder, toggle), Content editor (Tiptap rich text + SEO + publish), Settings (tabbed: Brand/Contact/Social/ServiceAreas/Defaults/Feature-flags + Warehouses).
- **Storefront:** `useSiteConfig` (with `siteConfig.js` bootstrap fallback), `useBanners`, `useFaqs`, `useContentPage`; Navbar/Footer/Contact/About/Returns/FAQ pages read from API. **Retire `IS_COMING_SOON`**: `App.js` reads `useSiteConfig().features.comingSoon` (env default for first paint, `?preview=true` bypass kept).

**Dependencies:** M2 (image uploads for banners/logos).

**Acceptance — done when:**
- A Marketing Manager uploads/reorders/schedules/hides banners and they reflect on the storefront homepage by placement and date window.
- FAQs and content pages (About/Contact/Terms/Privacy/Returns) are edited in the CRM (Tiptap) and render on the storefront; publish/unpublish works.
- Editing the WhatsApp number/contact/brand in Settings updates the storefront (replacing `siteConfig.js`).
- Toggling `features.comingSoon` in the CRM flips the storefront gate with no redeploy.

**Effort:** **M**

---

## M11 — Dashboard + Reports + Notifications

**Goal:** Give staff operational visibility — the KPI/chart dashboard, the five exportable reports, and full multi-channel (CRM + email, WhatsApp-optional) notifications via persist-then-fan-out workers.

**Scope / deliverables:**
- **Notifications fan-out:** introduce Redis + **BullMQ** (worker service, `WORKER=true`); `NotificationService.dispatch` (persist → enqueue email/WhatsApp); `EmailProvider` (**Resend** primary, SES seam) with React-Email templates (order confirmation, status update, quote send, staff alerts); `WhatsAppProvider` interface (Twilio/Meta, feature-gated — ship CRM+email first). Low-stock digest/debounce. Admin `GET /admin/notifications`, `/unread-count`, `PATCH /:id/read`, `/read-all`, `DELETE`, optional `/stream` (SSE). `NotificationBell` + Notifications center.
- **Dashboard:** `GET /admin/dashboard/stats` + `/charts` (+top-products/top-categories) via aggregation pipelines on the time-series indexes. KPI cards (Total Products/Categories/Orders/Customers/Leads/Quote Requests/Revenue + order-status counts), charts (Sales Overview area, Orders Overview stacked bar, Top Selling bar, Top Categories pie, Customer Growth line), recent-orders/latest-inquiries/low-stock widgets, deep-link KPIs.
- **Reports:** `GET /admin/reports/{sales,orders,products,customers,inquiries}` (+ `format=csv|xlsx|pdf`); exports streamed (exceljs `WorkbookWriter` / fast-csv / pdfmake), heavy ones via BullMQ job + `GET /admin/jobs/:jobId`; every export writes AuditLog. Reports screen (tabbed, parameterized).

**Dependencies:** M4 (low-stock), M6 (orders/revenue), M7 (leads/quote-requests) — needs real data volume to aggregate.

**Acceptance — done when:**
- Creating an order/inquiry/quote-request and crossing low-stock each raise the correct Notification, deliver a staff email via the worker (CRM bell updates immediately, `deliveryStatus` tracks the email), and WhatsApp is cleanly gated off by flag.
- The dashboard renders all required KPI counts (Revenue in AED from fils) and all five charts over a selectable date range; clicking a KPI deep-links to the filtered list.
- Each of the five reports runs with filters and exports to CSV, XLSX, and PDF (large exports via job + polled download); exports are logged.

**Effort:** **L**

---

## M12 — Bulk Import

**Goal:** Let staff create/update products at scale from Excel with a downloadable template, full validation, row-level errors, and upsert by Product ID — without blocking the API.

**Scope / deliverables:**
- **API:** `GET /admin/products/import/template` (exceljs-streamed, exact spec columns + dropdowns for Category/Brand/Condition + fitment-DSL example + Instructions sheet); `POST /import/validate` (dry-run, summary+errors); `POST /import` (parse → per-row Zod → resolve refs by name → upsert by `externalId`→SKU→partNumber+brand → create as `draft`, recompute availability/searchTokens, stock writes `bulk_import` StockMovement → AuditLog). `ImportJob` model + BullMQ worker (batched `bulkWrite`, progress), `GET /admin/products/import/jobs/:id`. Annotated error-report `.xlsx`.
- **Admin:** Bulk Import screen — template download, dropzone, client-side SheetJS preview grid with per-cell validation, summary chips (valid/error/create/update), server-validate, Import with progress bar, downloadable error report.

**Dependencies:** M1 (products/taxonomy), M3 (fitment DSL parse), M4 (stock movements).

**Acceptance — done when:**
- An operator downloads the template (with working dropdowns + example fitment), uploads a populated file, sees a client-side preview with invalid rows flagged, and runs server validation returning a `{total,created,updated,skipped,failed}` summary + per-row errors.
- Importing creates new products (as draft) and updates existing ones keyed on `externalId`, never nulling omitted columns; blank Price → On Request; stock changes append `bulk_import` movements; a `bulk_import` AuditLog is written.
- A large file processes via a background job with a CRM progress bar and yields a downloadable annotated error report; the API stays responsive throughout.

**Effort:** **M**

---

## M13 — RBAC Management UI

**Goal:** Surface staff user management, role/permission-override editing, and the audit-log viewer in the CRM (the enforcement core already exists from M0).

**Scope / deliverables:**
- **API:** `GET/POST/PUT /admin/users`, `PATCH /:id/role|permissions|active`, `POST /:id/reset-password`, `DELETE /:id` (soft); `GET /admin/roles`, `/admin/permissions`. Service guards: last Super Admin cannot be deleted/demoted/deactivated (`409`); cannot edit own role/permissions (`403`); `requireFreshAuth`; AuditLog `role_change`/`user.manage`. Audit-log read endpoint (Super Admin/Viewer).
- **Admin:** Users list, `UserFormDrawer` (create/invite, role, `permissionOverrides` +/- editor), deactivate (Super Admin delete disabled in UI), reset password; Roles page (resolved permission matrix, read-only from static map); Audit Log viewer (filterable).

**Dependencies:** M0 (auth/RBAC core).

**Acceptance — done when:**
- A Super Admin provisions a staff user with a role, applies a `+perm`/`-perm` override, and the user's effective permissions (and visible menu/actions) change accordingly; non-permitted users can't reach `/users`.
- The last Super Admin cannot be deleted, demoted, or deactivated; a user cannot change their own role/permissions.
- Role changes and user mutations appear in the AuditLog; the audit viewer is restricted to Super Admin/Viewer.

**Effort:** **S**

---

## M14 — Scale, Search Upgrade & Hardening

**Goal:** Promote the platform to production scale and security posture — Atlas Search, caching + cursor pagination, full security hardening, the payments seam, and GCC/RTL readiness — without reworking domain code.

**Scope / deliverables:**
- **Search:** `AtlasSearchProvider` behind the existing `SearchService` (compound + fuzzy on name, keyword-exact on `searchTokens`/codes, autocomplete mapping, `$searchMeta` facets, `searchAfter` deep pagination); `SEARCH_DRIVER=atlas` in prod, `mongo-text` in dev; Atlas Search index definition. External-engine seam documented (change-stream indexer) but not built.
- **Caching & perf:** Redis app cache for Setting/category tree/brands/banners/facets (versioned keys, bust-on-write); HTTP `Cache-Control`/SWR on public reads; keyset/cursor pagination on hot catalog + CRM lists; `.lean()`/projections audited; `estimatedDocumentCount` for huge lists.
- **Hardening:** rate-limit on Redis store across instances (auth-strict/public-write/global tiers); CSP whitelisting Cloudinary/Google; env-secret zod-validation in prod from secret manager; AuditLog/StockMovement immutability asserted (no update/delete routes); deny-by-default test asserting every `/admin` route declares a permission gate; Sentry + pino drains; `/healthz` + uptime monitor; Atlas IP allowlist + least-privilege DB user.
- **Payments seam:** `PaymentProvider` interface + `Payment/Transaction` collection + webhook endpoint flipping `paymentStatus`→Paid and advancing the order (Telr/PayTabs/Stripe behind the interface, **not activated** — orders already payment-optional, so this is additive).
- **GCC/RTL readiness:** confirm `currency` carried on all money docs + presentation-only conversion seam; plan `{en,ar}` content shape + Tailwind logical properties adoption in both front-ends (config-flip readiness, no full restyle).

**Dependencies:** M1 (search), M6 (orders → payments), M11 (caching/report load patterns).

**Acceptance — done when:**
- Production search runs on Atlas Search with fuzzy phrase matching, exact (non-fuzzy) part-number resolution, autocomplete, and live facet counts; flipping `SEARCH_DRIVER` back to `mongo-text` works with zero call-site changes; deep pagination uses `searchAfter`.
- Hot reads (Settings/category/banners) are Redis-cached and busted on write; rate-limiting is shared across API instances; p95 catalog/search latency is acceptable at the 50k-product seed.
- A security pass confirms: no secret in any browser bundle, CSP active, every admin route permission-gated (test enforced), ledgers immutable, env validated at boot.
- The `PaymentProvider` interface + webhook compile and a sandbox provider can flip an order to Paid (feature-gated off in prod); money docs carry `currency` end-to-end and the RTL/i18n plan is in place behind a flag.

**Effort:** **L**

---

## First-Week Checklist

A concrete, ordered checklist to land **M0** (Foundations) and de-risk the rest. Treat each `[ ]` as a PR-sized unit.

**Day 1 — Git recovery + safety**
- [ ] `tar` back up the working tree (excluding `node_modules`/`.git`/`build`) outside the repo.
- [ ] Quarantine corrupt git: `mv .git .git.corrupt.bak`.
- [ ] `git init` + `git branch -M main`; add the new recursive `.gitignore` (excludes `node_modules/`, `build/`, `dist/`, `.env*` except `.env.example`, `.turbo/`).
- [ ] `git rm -r --cached build` equivalent (ensure no `build/`/`node_modules/` staged).

**Day 2 — Monorepo skeleton**
- [ ] Create `apps/{api,admin,storefront}` + `packages/shared`; add `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, root `package.json` (`private`, scripts, dev deps), `.nvmrc` (Node 20), ESLint/Prettier.
- [ ] Move CRA: `git mv src public tailwind.config.js postcss.config.js package.json` → `apps/storefront/`; rename package to `@sm/storefront`; delete root `node_modules` + per-app lockfile; add storefront `dev` alias + `@sm/shared` dep.
- [ ] First clean commit; `git remote add origin …`; `git fetch origin`; `git reset --soft origin/main`; commit the monorepo restructure; `git push`. Verify `git fsck --full` clean, then plan to delete the quarantine.

**Day 3 — Shared package + installs green**
- [ ] Build `@sm/shared` (tsup ESM+CJS+d.ts): `enums.ts` (canonical Enums Reference verbatim), `constants.ts` (WHATSAPP_NUMBER `971507855298`, defaults), `ROLE_PERMISSIONS` + permission-key constants.
- [ ] `pnpm install` from root; `pnpm build && pnpm typecheck && pnpm lint` pass; `pnpm --filter @sm/storefront start` serves CRA unchanged and imports a shared enum at runtime.
- [ ] `docker-compose up -d mongo` (Mongo-only).

**Day 4 — API skeleton + Mongo**
- [ ] API: `app.ts`/`server.ts`, zod `config/env.ts` (fail-fast), Mongoose pooled connection, `helmet`/`cors` allowlist/`mongo-sanitize`/json-limit, pino + request-id, global error envelope, `/healthz` + `/health/ready`.
- [ ] Confirm boot connects to Mongo and crashes fast on a missing env var; `.env.example` committed for all three apps.

**Day 5 — Auth + RBAC core + CI**
- [ ] `AdminUser` + `Customer` models (`tokenVersion`, `refreshTokenHash select:false`, `permissionOverrides`); argon2id; JWT access + rotating opaque refresh (reuse-detection); two realms (distinct secrets + `aud`); cookies + bearer dual-read; `authenticate`/`optionalAuth`/`requirePermission`/`requireFreshAuth`/`csrfGuard`/rate-limit middleware.
- [ ] `POST /admin/auth/login|refresh|logout` + `GET /admin/auth/me`; seed script (Super Admin + default Warehouse + Setting/SiteConfig from `siteConfig.js`).
- [ ] GitHub Actions per-app matrix (`install→typecheck→lint→test→build`, `^build` topo) green on a PR.
- [ ] **Verify the M0 acceptance bar:** Super Admin logs in, gets rotating tokens, `/admin/auth/me` returns resolved permissions, a customer-audience token is rejected on `/admin/*`, refresh reuse revokes. Delete `.git.corrupt.bak` + the tar backup once everything is confirmed.

**Stretch (if ahead): begin M1**
- [ ] Define `Product`/`Category`/`Brand`/`Subcategory` models + indexes + `$text` index; scaffold the Vite admin shell (router + AppShell + TanStack Query + axios + Login) so the M1 catalog slice can start immediately.
