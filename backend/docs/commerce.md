# Phase 4: sandbox checkout backend

This phase changes FastAPI only. Website integration, frontend proxy rules and
generated frontend contracts follow later. No manual bank-transfer workflow,
real charges, payouts, refunds or deployment is implemented here.

## Development database

The old `phase2-auth` development branch expired on November 5. Phase 4 uses
`phase4-backend` (`br-delicate-bar-b4c6fl1q`), created from the archived production
branch without modifying production. Its pooled/direct database and Neon Auth
variables live in ignored `backend/.env`; root frontend variables are unchanged.
Use identity tokens from this same branch for protected API requests.

From `backend/`, after installing the project dependencies:

```powershell
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m app
```

Swagger is at `http://localhost:8000/docs`. No sample products are inserted into
the application catalog. Create genuine catalog records through the existing
admin API before ordering.

## Bachs configuration

Keep these values in `backend/.env` only:

- `BACHS_API_KEY`: sandbox secret key from Bachs Developer Portal → API keys.
- `BACHS_ORGANIZATION_ID`: your `acct_…` account/organization ID. A signed
  webhook's `organization_id` must match it exactly.
- `BACHS_WEBHOOK_SECRET`: the signing secret of the destination receiving events.
  For a deployed destination, find it in Developer Portal → Webhooks. For local
  forwarding, use the secret printed by that particular CLI session.
- `BACHS_SUCCESS_URL` and `BACHS_CANCEL_URL`: public HTTPS return URLs. Bachs
  rejects localhost URLs. Return URLs do not confirm payment. A reserved public
  example URL is suitable for an API-only sandbox smoke test; replace it with
  actual storefront routes during website integration.

Install the official CLI with `npm install -g @bachs/cli`, authenticate using
`bachs login`, then run:

```powershell
bachs listen --forward-to localhost:8000/v1/webhooks/bachs --events collection.succeeded,collection.failed,collection.underpaid,checkout.expired
```

Copy its `whsec_…` secret into the backend environment and restart FastAPI. The
secret belongs to that forwarding session and changes on the next session.
`bachs trigger collection.succeeded` emits a real signed sandbox sample; it has
no application payment reference, so this backend returns
`503 WEBHOOK_ATTEMPT_NOT_READY` rather than fulfil an unrelated order. Live
destination retries are supported; CLI forwarding itself does not retry.

The official async Python SDK is pinned in `pyproject.toml`. All API traffic uses
its sandbox environment; live keys are rejected. Checkout inherits the account's
`fee_handling` setting (SDK 2.0.0 exposes no per-checkout override). The supplied
sandbox account was verified as `account_pays_fee` through its account API. Retain
this setting; a success event explicitly
reporting customer fee bearing is held for review.

## API flow

All customer operations require a verified Neon JWT and application profile.
Swagger's Authorize button accepts the bearer token. Customer order access is
owner-only; `/v1/admin/**` requires `admin` or `super_admin` in PostgreSQL.

1. `POST /v1/checkout/quote`: send product IDs, quantities, configured options
   and a Nigerian shipping address. Prices and delivery are calculated on the
   server. Quote validity is five minutes. Use the bundled state's local-area
   labels exactly; these options are local government areas, not universally cities.
2. `POST /v1/orders`: send only `quote_id` and an `Idempotency-Key` header.
   Totals and inventory are checked again. Changed quotes return `409`; request
   and accept a new quote. An order reserves product-level stock for 30 minutes.
3. `POST /v1/orders/{id}/payment-attempts`: no body; send an idempotency key.
   Returns the Bachs hosted URL for the exact NGN order total. Reuse that key for
   retries, particularly `503 PAYMENT_OUTCOME_UNKNOWN`; the same provider payload
   and key recover uncertain responses. Another key cannot bypass an open attempt.
4. `GET /v1/orders/{id}`: inspect current status and payment attempts.
   `POST /v1/orders/{id}/cancel` releases an unpaid reservation once. Paid orders
   and payment exceptions cannot be cancelled by customers through this endpoint.

Idempotency keys contain 8–128 letters, digits, underscores, periods, colons or
hyphens. Order keys are scoped to the customer; attempt keys to the order. An
order key reused with another quote returns `409 IDEMPOTENCY_CONFLICT`. Replays
return the existing operation even after its original quote expires. A used
quote cannot create another order with a different key.

Money is returned as decimal strings in NGN major units, never kobo integers.
Catalog pricing rounds half up to whole naira; checkout serializes two decimal
places and sums with Decimal arithmetic. Delivery uses the configured uniform
Nigerian fee and free-shipping threshold; there is no Osogbo exception. A zero
threshold disables free shipping. Missing rates, request-only prices, invalid
options and unavailable products cannot be checked out.

Expired holds are excluded from availability immediately, without a scheduler.
Reads and writes release expired reservations opportunistically. Inventory is
deducted only when verified payment consumes a live reservation, once. Product
edits cannot reduce stock below live holds or delete a reserved product. Deleted
products do not remove historical item snapshots.

## Webhooks and administrator review

`POST /v1/webhooks/bachs` receives raw JSON directly in FastAPI, not through
Next.js. Maximum body size is 256 KiB. The official SDK verifies V2 HMAC signatures
and their 300-second tolerance before parsing; rotated signatures and legacy
timestamp/signature headers are supported. No JWT is required on this endpoint.

Merchant, sandbox environment, checkout, reference, amount, currency and charge
are validated. Event IDs/body hashes and unique charge IDs prevent duplicate
effects. Browser redirects and `checkout.completed` alone cannot mark a
positive-value order paid. Delayed failures cannot reverse confirmed success.

Underpayments, amount/currency/reference mismatches, duplicate charges and money
arriving after stock release become `payment_review` with a reason and audit.
There is no arbitrary mark-paid API:

- `GET /v1/admin/orders`: newest first, optional status, `page`, `page_size` ≤100.
- `GET /v1/admin/orders/{id}`: customer contact, immutable items and payment audit.
- `POST /v1/admin/payment-attempts/{id}/reconcile`: server-side Bachs lookup of
  the known checkout. Confirms provider evidence, retains late-payment review
  when stock was released, and records the administrator actor.

Responses retain `{success,status,data,message}` or
`{success:false,status,error:{code,message,fieldErrors?}}`. Swagger documents
payloads, examples, headers, permissions, failures and response models.

## Verification

```powershell
.venv/Scripts/python.exe -m pytest
$env:RUN_COMMERCE_DB_TESTS='1'
.venv/Scripts/python.exe -m pytest tests/test_commerce_orders.py tests/test_commerce_payments.py
.venv/Scripts/python.exe -m pytest tests/test_payment_exceptions.py
$env:RUN_BACHS_SANDBOX_TESTS='1'
.venv/Scripts/python.exe -m pytest tests/test_bachs_live.py -s
.venv/Scripts/python.exe -m alembic check
```

Database tests create a randomly named `commerce_test_*` schema on the configured
development database, create only temporary fixtures there, then drop that schema.
They do not seed or clean public application tables. Unit tests cover JWT
boundaries, pricing, request schemas and real SDK signature validation. Database
tests exercise concurrent reservations, idempotency, stock effects and signed
payment-event handling. Provider transport is mocked in those regression tests;
actual sandbox session creation and CLI delivery are separate smoke checks.

Official references: [checkout](https://docs.bachs.io/guides/checkout/checkout-sessions),
[local forwarding](https://docs.bachs.io/developer-portal/local-testing), and
[webhook verification](https://docs.bachs.io/guides/webhooks/overview).
