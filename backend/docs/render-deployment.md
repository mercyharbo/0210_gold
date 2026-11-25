# Render deployment and production origins

The frontend is `https://zero210-gold.vercel.app`; FastAPI is
`https://zero210-gold.onrender.com`. Browser application requests stay on the
frontend's `/api/**` proxy. `BACKEND_URL` is server-only in the frontend host.

## Correct production login configuration

In Render, open the existing backend service, select **Environment**, and set:

```dotenv
APP_ENV=production
CORS_ORIGINS=https://zero210-gold.vercel.app,http://localhost:4000,http://localhost:4100
AUTH_FRONTEND_URL=https://zero210-gold.vercel.app
AUTH_PUBLIC_API_URL=https://zero210-gold.vercel.app/api
AUTH_SUCCESS_PATH=/login
```

Save and redeploy the backend. These are exact origins: do not add a trailing
slash, `/login`, or `/api` to `CORS_ORIGINS` or `AUTH_FRONTEND_URL`. Only
`AUTH_PUBLIC_API_URL` includes `/api`. Existing localhost entries allow local
frontend development against this backend; other preview domains remain rejected.

Keep existing database, Neon Auth, storage, encryption and sandbox payment
credentials unchanged. Keep the Free instance and existing startup command:

```bash
python -m alembic upgrade head && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --no-access-log
```

Secure cookies and CSRF validation remain enabled. Do not resolve origin failures
by adding wildcards, disabling CSRF, or setting `APP_ENV=development` on Render.

## Callback ownership

Google's provider callback stays on Neon. The application callback is
`https://zero210-gold.vercel.app/api/v1/auth/google/callback`, forwarded to FastAPI.
The start cookie and callback must use the same browser-facing frontend host.
After success, `/login` reads the backend session and redirects according to role.
If Neon requires a trusted application origin, register the exact frontend origin.
Do not change the Google provider callback to the Render service URL.

## Verify without credentials

- `GET https://zero210-gold.onrender.com/v1/health` must report database connected.
- `GET /v1/auth/csrf` on Render with `Origin: https://zero210-gold.vercel.app`
  and `Sec-Fetch-Site: same-origin` must return 200. Do not print its token/cookie.
- The same request through `https://zero210-gold.vercel.app/api/auth/csrf` must
  return 200. An unapproved origin such as `https://untrusted.example` must return
  403 with `CSRF_REJECTED`.
- Confirm email/password login manually on the website. A successful CSRF request
  proves origin configuration, not successful credentials or Google consent.

The public health and CSRF checks require no account or catalog changes.

## Featured sections are content selection

Homepage featured products require `label=featured`. Featured necklaces also
require the category slug `gold-necklaces`. A successful response with zero items
means no public products match those filters; it is not a connection failure.

Use the existing administrator product editor to choose the intended Featured
products after login is working. The current model has one label, so Featured
replaces New in. Do not remove the filters, insert fallback products, or alter
records automatically to populate these sections.

## Pending catalog navigation

The shop and New Arrivals use the same product-grid/pagination skeleton for
route loading and pending filter/sort/page navigation. Confirmed products stay
visible during ordinary SWR background refreshes. This gives immediate feedback;
it does not change hosting startup latency, API timeouts or retry behavior.
