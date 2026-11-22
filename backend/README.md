# FM LUXE API

This directory contains the standalone FastAPI backend for identity, roles,
catalog management, manual gold pricing, store settings, managed images,
checkout/payments, customer accounts, reviews, notifications and fulfilment.
The migrated storefront uses Neon. Phase 4/5 commerce and account APIs remain
separate from website integration; production deployment remains Phase 6.

## Local setup

1. Create a Python 3.12 virtual environment in `backend/.venv`.
2. Install the project with `python -m pip install -e ".[dev]"` from this directory.
3. Run `neon login` and `neon deploy` from the repository root to pull Neon
   variables into the root `.env.local` (or `.env` when it exists). The backend
   reads these files automatically. A `backend/.env` file can override them.
   Set `BACKEND_URL=http://127.0.0.1:8000` in the root environment file for Next.js.
4. Start the API from the repository root with `pnpm dev:backend` on Windows.
   From this directory with the virtual environment active, use `python -m app`.
   This selects a psycopg-compatible
   event loop on Windows. On Linux hosting, Uvicorn's default loop also works.
5. Start Next.js from the repository root with `pnpm dev`.

The browser-facing health endpoint is `http://localhost:4000/api/health`.
FastAPI documentation is available at `http://localhost:8000/docs` in local
development.

## Database and tests

- Check the migration state with `python -m alembic current`.
- Create future migrations with `python -m alembic revision --autogenerate -m "description"`.
- Run backend tests with `python -m pytest`.

Do not commit `.env`, Neon credentials, or the virtual environment.

## Authentication and development branch

**Backend auth update:** FastAPI now exposes signup, login, verification, password
reset, cookie sessions, logout and Google OAuth. Setup, payloads, Swagger usage,
CSRF and later manual frontend integration are documented in
[docs/authentication.md](docs/authentication.md). Set `AUTH_SESSION_ENCRYPTION_KEY`
and run migration `0006_auth_sessions` before using the new endpoints. The existing
frontend SDK flow below remains unchanged until you integrate these APIs.

The linked `phase2-auth` Neon branch is isolated from production. Its default
expiry is seven days after creation (November 5, 2026); recreate or extend the
development branch before further testing after that date. Production infrastructure
is separate and has not been cut over.

1. Ensure root `.env.local` contains the development branch's `DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_JWKS_URL`.
2. Set `NEON_AUTH_COOKIE_SECRET` to a cryptographically random secret of at
   least 32 characters. Keep it stable across server restarts.
3. Set `INITIAL_ADMIN_EMAIL` to the verified email allowed to bootstrap as
   `super_admin`. Other profiles start as `customer`. An existing profile's
   role is never changed by bootstrap.
4. From `backend`, run `python -m alembic upgrade head` using the active
   virtual environment. Migrations use the direct connection.
5. From the root, run `pnpm dev:backend`, then `pnpm dev:auth` in a second
   terminal. Open `http://localhost:4100/login`.

`pnpm dev:auth` explicitly selects Neon on port 4100. `pnpm dev` uses the
configured/default provider on port 4000. Catalog admin routes use Neon roles;
checkout, cart, legacy account operations and unmigrated admin sections remain
unavailable. No customer data or catalog inventory was migrated.

After signup, request/enter the email verification code at `/verify-email`,
sign in, and initialize the application profile at `/auth/preview/account`.
Admins can then open `/admin/products`. Password recovery uses email OTP
at `/forgot-password` and `/change-password`.

Neon owns password hashing and managed sessions. Next.js uses the official
SDK at `/api/auth/**` because OAuth and cookies require that protocol. App
profile reads use SWR; bootstrap calls `useApiRequest.execute` directly in
the owning component. Next.js derives a bearer token from its managed session
for FastAPI; clients cannot submit a different identity to the proxy.

Public API docs: `/docs`, `/redoc`, `/openapi.json`. Protected operations are
`POST /v1/auth/bootstrap` (JSON body, including `{}`), `GET /v1/auth/me`, and
`GET /v1/admin/auth-check`. Swagger's Authorize control accepts a Neon bearer
JWT from the same branch. Errors use `{success:false,status,error:{code,message,
fieldErrors?}}`; success returns `{success:true,status,data,message}`. JWTs
expire after 15 minutes; signing out ends the browser session but does not
instantly revoke an already-issued bearer JWT. Deleted or unverified identities
are rejected by FastAPI's database identity check.

Google's shared development credentials can be used during testing. Before
production activation, configure your own Google OAuth credentials, register
the Neon provider callback and app trusted origin, and configure a zero-cost
custom SMTP sender. Shared SMTP is for development. Do not activate production
checkout until the commerce features have migrated.

## Phase 3 catalog and media

Phase 4 backend setup and Bachs sandbox instructions are in
[docs/commerce.md](docs/commerce.md). The old Phase 2 development branch expired;
follow that document for the current backend branch.
Phase 5 product-sales APIs and their integration boundary are documented in
[docs/phase5.md](docs/phase5.md).

- Run `python -m alembic upgrade head` before starting the backend.
- `neon.ts` declares the `catalog-images` public-read bucket. Run `neon config
  plan --branch phase2-auth` before `neon deploy --branch phase2-auth`. Apply
  only to the intended development branch; no paid service is declared.
- The CLI pulls `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
  `AWS_ENDPOINT_URL_S3`, and `AWS_REGION` into root `.env.local`. FastAPI reads
  them directly. Never prefix credentials with `NEXT_PUBLIC_` or log signed URLs.
- Configure bucket CORS for the exact frontend origins, with PUT/GET/HEAD,
  Content-Type allowed and ETag exposed. Local origins are
  `http://localhost:4000` and `http://localhost:4100`. Add the actual hosting
  origin during Phase 6. Credentials stay in FastAPI; only the storage hostname
  is used by the Next.js image configuration.
- Public `/v1/catalog/products`, `/categories`, `/banners`, `/settings`, and
  `/gold-rates` require no token. Products support `q`, category slug,
  `sort=newest|name|price_asc|price_desc`, `page`, and `page_size` (1–100).
- `/v1/catalog/products/{slug}` returns ordered media and computed display
  pricing; its `/price?karat=18k` endpoint previews a selected karat. Draft,
  archived, and inactive-category products return 404 publicly.
- `/v1/admin/products`, `/categories`, and `/banners` support GET/POST,
  with GET/PUT/DELETE on `/{uuid}`. PUT is a complete replacement. All admin
  operations require a verified Neon JWT and database-owned admin role.
- `/v1/admin/settings` and `/gold-rates` accept PUT. Rates are positive NGN
  per gram; omitted karats become unavailable. Fixed prices are exact configured
  prices. Gold-rate prices are weight × rate + making charge. Decimal arithmetic
  rounds half up to whole naira. Price-on-request and missing rates return null
  amounts with explicit reason codes, never made-up fallback rates.
- Upload flow: POST `/v1/admin/media/uploads` with kind, MIME type and byte
  length; PUT raw bytes to the returned five-minute URL; POST
  `/v1/admin/media/{uuid}/complete`; then save `{media_id,alt}` in the catalog
  record's ordered images array. No file bytes pass through Next.js.
- Product images: maximum 8, each 5 MiB; category: 1 × 5 MiB; banner: 1 ×
  8 MiB. JPEG, PNG, WebP and AVIF only. Completion validates declared size,
  MIME and file signature, then copies to a fresh immutable public key.
- DELETE `/v1/admin/media/{uuid}` rejects referenced images with 409. POST
  `/v1/admin/media/cleanup` deletes up to 100 unreferenced images older than
  24 hours. Run from Settings → Media cleanup; referenced media is preserved.
- Swagger includes payload/response models, sanitized examples, status codes,
  authentication, and field errors. Run `pnpm api:types` with FastAPI on port
  8000 whenever contracts change; generated types live in `types/api-schema.d.ts`.
- Nigerian state/FCT and local government options use the bundled dataset;
  external country/location services and GoldAPI synchronization are removed.

## Verification and rollback

`python -m pytest` runs isolated unit/contract/permissions tests. The optional
`RUN_NEON_CATALOG_TESTS=1 python -m pytest tests/test_catalog_live.py -s` checks
real database and storage integration using temporary records, then removes them.
It refuses databases outside the configured development branch host.

`node scripts/test-catalog-browser.mjs` from the root performs opt-in browser QA.
Provide PLAYWRIGHT_MODULE_PATH/PLAYWRIGHT_EXECUTABLE when using an existing
Playwright runtime, plus NEON_NODE and NEON_CLI_JS for temporary account cleanup.
The fixture helper only accepts generated `.invalid` addresses on the development
branch. It is test tooling and is never an API or production authentication bypass.

Keep the previous release and its environment configuration for rollback. Setting
AUTH_PROVIDER=supabase restores legacy authentication only; it does not restore
the previous catalog pages. Roll back the release and environment together rather
than mixing legacy commerce with Neon product IDs. Never downgrade a database
containing live catalog records as part of an application rollback.
