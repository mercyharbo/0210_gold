# Phase 5 — product sales backend

FM LUXE sells its own gold jewellery. The catalog remains suitable for fashion
products later, without introducing another business or service workflow.
Personal shopping, sourcing, food orders and request-management APIs are removed
from the project scope. Historical Supabase SQL and remote data were preserved.

## Startup and database

Use the existing Python environment and ignored `backend/.env`. No additional
service, subscription, scheduler or environment secret is required.

```powershell
pnpm dev:backend
```

Alternatively, from `backend/`:

```powershell
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m app
```

Migration `0005_product_sales` extends revision `0004`. It creates addresses,
wishlists, reviews, notifications and fulfilment history, and adds fulfilment
fields to orders. It preserves inquiry-only products as drafts and converts
non-gold Starting from records to fixed pricing. Existing active gold products
with missing/invalid rates or no valid price variation become drafts for correction.
Downgrade does not reactivate products or reconstruct earlier publication states.

The current development branch is `phase4-backend`. Use a verified Neon JWT from
that same branch in Swagger's Authorize control; an identity from another branch
is not interchangeable. Roles and profiles remain owned by the existing identity
service. No users or catalog records are copied from Supabase.

## Contract conventions

Swagger `/docs`, ReDoc `/redoc` and `/openapi.json` document explicit request and
response models, examples, permissions, status codes and inline field errors.
Customer operations require verified identity and an initialized profile.
Administrative operations require a database-owned admin or super_admin role.
Public approved-review reads require no token.

Success remains `{success:true,status,data,message}`. Failure remains
`{success:false,status,error:{code,message,fieldErrors?}}`. Private lists use
page 1, page_size 24 (maximum 100), stable creation-time/ID ordering. Timestamps
are UTC ISO 8601. Order money remains two-decimal NGN strings; catalog display
prices remain whole NGN rounded half up.

## Customer account

- `GET/PATCH /v1/account/profile`: read profile or partially update first_name,
  last_name and phone. Null clears optional contact fields. Identity email,
  role and verification cannot be supplied by a customer.
- `GET/PUT /v1/account/category-preferences`: complete replacement with up to
  100 unique active category UUIDs. An empty list clears preferences.
- `GET/POST /v1/account/addresses`: list or create Nigerian addresses. POST
  returns 201. State/FCT and local_area use the bundled local government dataset;
  optional locality is a separate field. First address is automatically default.
- `PATCH/DELETE /v1/account/addresses/{id}`: owner-only edit/delete; required
  fields cannot be cleared. Deleting default selects the oldest remaining address.
- `PUT /v1/account/addresses/{id}/default`: no body, idempotent. Profile-row
  locking and a partial unique index enforce one default under concurrent writes.
- `GET /v1/orders`: paginated owned history and optional status filter. Existing
  owned detail/cancel/payment endpoints retain their behavior. Address/profile
  edits never modify order shipping or item snapshots.

## Wishlists and purchased-product reviews

- `GET /v1/account/wishlist`: saved product name/slug, availability, calculated
  display_price and first image/alt. Image fields are null when none exists.
- `PUT/DELETE /v1/account/wishlist/{product_id}`: no body, idempotent membership.
  `changed` is 1 only when a row changes. Saving requires a public product;
  unavailable saved products remain visible, while deleted products cascade out.
- `GET /v1/account/reviews`: owned reviews, including pending/rejected status.
- `PUT /v1/account/reviews/{product_id}`: rating 1–5 and comment 1–2,000
  characters. Requires a paid order containing that product; otherwise 403.
  One review per customer/product. New/changed content becomes pending; an
  identical retry preserves moderation state. Concurrent edits/moderation lock
  the review row so changed content cannot inherit an earlier approval.
- `DELETE /v1/account/reviews/{product_id}`: idempotent owner-scoped removal.
- `GET /v1/catalog/products/{slug}/reviews`: approved reviews only, with given
  names, rating_count and two-decimal average_rating (null when no ratings).
  Customer identity IDs, emails and moderation notes are never public.
- `GET /v1/admin/reviews`: optional pending/approved/rejected filter.
- `PATCH /v1/admin/reviews/{id}`: approved/rejected status and optional private
  moderation_note. Records moderator and notifies the customer without the note.
- `POST /v1/admin/reviews/bulk-moderate`: same decision plus 1–100 unique
  review_ids. Validates the complete batch before writes; missing IDs fail atomically.

## Notifications and administration

- Customer and admin namespaces each expose `GET /notifications`,
  `PATCH /notifications/{id}` with `{is_read:true}`, and `POST /notifications/read-all`
  with no body. GET accepts unread_only and pagination.
- Every notification belongs to a recipient and audience. One administrator's
  read state does not affect another's. Repeated reads are harmless; another
  recipient's ID returns 404.
- Producers run in the originating transaction and deduplicate event/recipient
  pairs. Customers receive payment, fulfilment and review-decision notices.
  Administrators receive pending reviews, payment exceptions and zero-stock alerts
  from successful payments or administrator stock edits. No email/SMS delivery.
- `GET /v1/admin/customers`: customer-role directory, paginated and searchable
  using q across names, email and phone. Search wildcard characters are literal.
- `GET /v1/admin/customers/{id}`: read-only profile, order counts and paid NGN
  total. Identity IDs are opaque strings. There are no password/role/suspension APIs.
- `GET /v1/admin/orders?customer_id={id}` filters existing order administration
  for customer-detail screens. Existing status/pagination behavior is preserved.

## Fulfilment and product pricing

- `POST /v1/admin/orders/{id}/fulfilment-transitions`: processing, shipped,
  then delivered, one forward step at a time. Shipped requires carrier and
  tracking_reference. Other transitions reject tracking fields.
- `POST /v1/admin/orders/bulk-fulfilment-transitions`: same payload plus 1–100
  unique order_ids. All-or-nothing validation, stable row-lock ordering.
- Only currently paid orders can move forward. Identical repeats add no history
  or notification; different tracking on a shipping replay returns 409. Backward
  or skipped states also return 409. Unpaid cancellation remains Phase 4 behavior.
- Responses include fulfilment status, carrier/tracking and timestamped history.
  Actor IDs appear only in administrative history. No status action marks payments
  paid, refunds money or changes stock.
- Product writes accept fixed/starting_from only. Starting from requires multiple
  gold options with different positive calculated prices. Every published gold
  option requires a configured rate; shared transaction locks serialize product
  publication against rate replacement. Rate changes that invalidate an active
  product return 409. Correct/unpublish it first. Historical inquiry drafts remain
  readable for correction; they cannot be saved or republished as inquiry products.

## Website integration boundary

Service pages, forms, profile/admin sections, navigation and marketing copy were
removed now. Retired URLs return 404 rather than authentication redirects.
About/Contact/FAQ retain product information and order support. Contact reuses the
already-integrated catalog settings source; unset contact information is not invented.

The new account/admin APIs are not connected to the website. Proxy expansion,
frontend OpenAPI generation, SWR read hooks, component-owned useApiRequest calls,
Zustand UI controls and shadcn forms belong to the later integration stage.
Legacy profile and notification components retain their existing server-action
transport until that stage. Do not expose them against mixed identity branches.
