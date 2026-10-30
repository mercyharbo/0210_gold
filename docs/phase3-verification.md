# Phase 3 verification — October 30, 2026

The application defaults to Neon authentication and the FastAPI catalog. The
development database and public-read catalog bucket are on `phase2-auth`;
production hosting and production infrastructure have not been deployed.
The catalog remains empty after test-fixture cleanup. No Supabase data was copied.

## Passing checks

- Backend unit/contract/permissions suite: 27 passed.
- Real Neon catalog integration: passed. Covered CRUD, publication visibility,
  filtering/pagination, fixed and gold-rate previews, missing rates, conflicts,
  direct uploads, public reads, replacement, deletion, and fixture cleanup.
- Real settings integration: passed. Covered persistence, safe public fields,
  negative amount rejection, unsupported payment settings rejection, and cleanup.
- Alembic check: no new upgrade operations detected; migration head is `0003`.
- Browser QA: passed at 390, 768, and 1440 pixels. Covered storefront reads,
  anonymous admin denial, authenticated category/product creation, first-invalid
  focus, direct browser upload, publication, fixed-karat prices, metadata,
  image rendering, and admin layouts. Temporary auth identities were deleted.
- TypeScript, focused lint for migrated code, and production build: passed.
- Live `/openapi.json`: catalog request and response examples verified.
- Local Nigerian country/state/local-area endpoints: verified without external APIs.
- Git whitespace check: passed. Credentials and test artifacts remain ignored.

The Browser plugin was unavailable; QA used the existing Playwright runtime.

## Existing repository lint findings

Full-repository ESLint still reports **43 errors and 25 warnings in unchanged
legacy files**. These cover unmigrated account, checkout, review, cart, and admin
code, including explicit `any`, unused imports, and existing hook patterns.
They were not suppressed or changed as part of this catalog migration.

## Review locally

Run `pnpm dev:backend` and `pnpm dev` from the root for ports 8000 and 4000.
`pnpm dev:auth` remains available on 4100. Open `/shop`, `/categories`,
`/admin/products`, `/admin/categories`, `/admin/hero-banners`, and `/admin/settings`.
FastAPI documentation is at `http://localhost:8000/docs`.

Checkout, cart, full account operations and unmigrated admin routes are gated.
The development branch's original expiry is November 5, 2026; maintain the branch
before that date if development continues. See `backend/README.md` for credentials,
storage CORS, upload contracts, test commands and release/environment rollback.
