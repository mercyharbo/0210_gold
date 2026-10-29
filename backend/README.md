# FM LUXE API

This directory contains the standalone FastAPI backend. Health, Neon identity,
application profiles, and role checks are implemented. The normal storefront
keeps Supabase authentication while the Neon preview is tested independently.

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

## Phase 2 authentication preview

The linked `phase2-auth` Neon branch is isolated from production. Its default
expiry is seven days after creation (November 5, 2026); recreate or extend the
development branch before further testing after that date. Production login
still defaults to `AUTH_PROVIDER=supabase`.

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

`pnpm dev:auth` selects Neon only for that process. `pnpm dev` continues to use
the configured/default provider. In Neon mode, shopping profile, checkout, and
admin routes redirect to the auth preview. Legacy writes fail closed rather
than mixing Supabase and Neon identities. No customer data was migrated.

After signup, request/enter the email verification code at `/verify-email`,
sign in, and initialize the application profile at `/auth/preview/account`.
Admins can then open `/auth/preview/admin`. Password recovery uses email OTP
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
Neon login until the dependent commerce features have migrated.
