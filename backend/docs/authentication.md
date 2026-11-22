# FastAPI authentication integration

This API is ready for manual website integration separately. No Next.js auth forms,
proxy rules, middleware or generated types are changed by this backend update.
Neon still owns passwords, OAuth identities, email codes and provider sessions.
FastAPI owns the browser-facing endpoints and encrypted backend session records.

## Setup

From `backend/`, install with `python -m pip install -e ".[dev]"` and run
`python -m alembic upgrade head` against the intended development database.
Keep the existing Neon auth URLs and `INITIAL_ADMIN_EMAIL`. Set these server-only values:

| Variable | Meaning |
| --- | --- |
| `AUTH_SESSION_ENCRYPTION_KEY` | Fernet key. Generate with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`. Keep stable and private. |
| `AUTH_PUBLIC_API_URL` | Public API mount before `/v1`, default `http://localhost:8000`. Google returns here. |
| `AUTH_FRONTEND_URL` | Exact application origin, default `http://localhost:4000`. Must be trusted by Neon. |
| `AUTH_SUCCESS_PATH` | Fixed local path after Google success, default `/`. No query, fragment or external URL. |
| `AUTH_SESSION_MAX_AGE` | Absolute session cap in seconds, default 604800 (7 days), range 60–2592000. Never exceeds provider expiry. |
| `CORS_ORIGINS` | Comma-separated exact allowed origins, including the frontend and local Swagger origin when applicable. |

Start with `python -m app`. Swagger: `http://localhost:8000/docs`; schemas:
`/openapi.json`; alternative documentation: `/redoc`.
No additional paid service or application email provider is needed for development.
Neon's existing email code delivery and provider limits still apply.

## Contract and cookies

All JSON requests use `application/json`. Success:

```json
{"success":true,"status":200,"data":{"accepted":true,"next_action":"sign_in"},"message":null}
```

Failures use the HTTP status and existing envelope:

```json
{"success":false,"status":422,"error":{"code":"VALIDATION_ERROR","message":"The request contains invalid fields.","fieldErrors":{"email":["Enter a valid email address."]}}}
```

`400`: invalid/expired/used code, OAuth state or rejected request; `401`: invalid
credentials/session; `403`: email verification, CSRF or permissions; `409`: existing
account; `422`: field validation; `429`: provider rate limit; `503`: provider,
database or encryption configuration unavailable. Provider messages are sanitized.
Do not automatically retry password/code submissions or email requests.

The browser receives `fmluxe_session`, an opaque random identifier. Its SHA-256
hash is stored in PostgreSQL; provider credentials are encrypted using Fernet.
Cookies are host-only, HttpOnly, Path=/, SameSite=Lax and Secure outside
`APP_ENV=development` or `test`. JavaScript never reads the session cookie.
All auth and cookie-authenticated responses are `Cache-Control: no-store`.

Before **every auth POST**, including login/signup, obtain `GET /v1/auth/csrf`.
Keep its `fmluxe_csrf` cookie and send `data.csrf_token` as `X-CSRF-Token`.
This also applies to cookie-authenticated mutations on existing account, catalog,
commerce and admin endpoints. Bearer-only clients do not need CSRF on those
existing endpoints. An explicit invalid Authorization header never falls back to
a valid cookie. Keep CSRF tokens in memory, not persistent storage.

CSRF tokens last one hour, are bound to the current session and become invalid
after login/logout changes it. Obtain another token after either operation.
Trusted Origin headers are checked; curl clients may omit Origin but still need
the CSRF cookie and header. A cross-site browser fetch is rejected.

## Email/password flow

1. Fetch CSRF, then `POST /v1/auth/signup` with `name`, `email`, `password`.
   Password length: 8–128; name: 1–255 after trimming. Extra fields such as `role`
   are rejected. Signup does not establish a backend session.
2. `POST /v1/auth/email-verification/request` with `email`; do not assume signup
   automatically sends a code under the branch's current configuration.
   Code requests return the same accepted response for unknown accounts.
3. `POST /v1/auth/email-verification/confirm` with `email`, `code` as a string.
   Preserve leading zeros. Verification does not automatically sign in.
4. `POST /v1/auth/login` with `email`, `password`. Requires a verified email.
   Retain the returned session cookie. Response data contains `identity`,
   `profile` (including database-owned role) and UTC ISO-8601 `expires_at`.
5. Fetch a fresh CSRF token before later mutations. Use `GET /v1/auth/session`
   to restore session/profile on reload. Signed-out/expired sessions return 401.
   Provider validation occurs on cookie-authenticated requests; outages fail closed.
6. `POST /v1/auth/logout` needs no body. Local session is revoked and cookie cleared,
   even when `provider_revoked=false` means provider logout could not be confirmed.
   Subsequent session reads return 401. Logout can be repeated with fresh CSRF.

Profiles initialize idempotently after verified authentication. Existing roles are
never overwritten. Only the verified server-configured initial administrator email
can bootstrap as super_admin; customers cannot submit a role. Admin and customer
login use the same endpoint. Existing `/v1/auth/bootstrap`, `/v1/auth/me` and
`/v1/admin/auth-check` also accept backend cookies, alongside existing Neon JWTs.
Already-issued bearer JWTs can remain valid until expiry after cookie logout.

## Password reset

`POST /v1/auth/password-reset/request` accepts `email` and always gives a generic
accepted response for existing/unknown accounts. `POST /v1/auth/password-reset/confirm`
accepts `email`, `code`, `password` (new password, 8–128 characters). Neon validates
expiry and code reuse. After success, backend sessions for that identity are
revoked; explicitly log in with the new password. Roles do not change.
If a database failure follows a successful provider reset, the password may already
have changed: try login with the new password before requesting another code.

## Google flow

1. Fetch CSRF and `POST /v1/auth/google/start` with no body. It sets a separate
   HttpOnly `fmluxe_oauth` cookie and returns `authorization_url`, `expires_in=600`.
2. Navigate the browser to that URL. Neon may first set its provider-side OAuth state
   cookies and redirect to Google. Do not AJAX-fetch it or use a test website.
3. Google returns to **Neon's** configured provider callback:
   `NEON_AUTH_BASE_URL/callback/google`. Neon then navigates to the API's
   `AUTH_PUBLIC_API_URL/v1/auth/google/callback?state=...&neon_auth_session_verifier=...`.
4. FastAPI checks the browser binding, atomically consumes the single-use transaction,
   exchanges the Neon verifier with the saved challenge cookie, establishes its
   session and sends `303 Location: AUTH_FRONTEND_URL + AUTH_SUCCESS_PATH`.
5. The website reads `/v1/auth/session`. Cancellation, expired/replayed state and
   invalid verification return safe JSON errors; start a new flow after failure.

Register the callback origin in Neon trusted domains. The Google provider callback
remains Neon's URL, not the FastAPI callback. The start request and final callback
must use the **same browser-facing host**, so the binding cookie reaches the callback.
For future same-origin proxy integration, `AUTH_PUBLIC_API_URL=https://store.example/api`
produces `/api/v1/auth/google/callback`; explicitly proxy that path to the matching
FastAPI `/v1/auth/google/callback`. Do not send the browser directly to Render while
the start cookie is set on Netlify. Production still requires your own Google OAuth
configuration, and is outside this update.

Never log callback query strings. Application Uvicorn access logging strips queries;
configure hosting/proxy access logs similarly. Callback responses use
`Referrer-Policy: no-referrer` and contain no tokens in redirects to the frontend.

## API-only examples (PowerShell)

Use a temporary cookie jar. Run these from `backend/`; replace the example email and
password privately. Never commit the cookie jar or paste its contents into chat.

```powershell
$api = 'http://localhost:8000/v1'
$jar = Join-Path $env:TEMP 'fmluxe-auth-cookies.txt'
$csrf = (curl.exe -s -c $jar "$api/auth/csrf" | ConvertFrom-Json).data.csrf_token
curl.exe -s -b $jar -c $jar -H "X-CSRF-Token: $csrf" -H 'Content-Type: application/json' --data-raw '{"email":"customer@example.com","password":"Your-private-password"}' "$api/auth/login"
curl.exe -s -b $jar "$api/auth/session"
$csrf = (curl.exe -s -b $jar -c $jar "$api/auth/csrf" | ConvertFrom-Json).data.csrf_token
curl.exe -s -b $jar -c $jar -H "X-CSRF-Token: $csrf" -X POST "$api/auth/logout"
Remove-Item -LiteralPath $jar
```

Swagger can retain cookies when opened on the API host. Execute `/auth/csrf`, copy
its returned token into the auth operation's `x-csrf-token` header field, then log in.
Swagger's Authorize control remains available for bearer testing; leave it empty
when testing cookie login to avoid its Authorization header taking precedence.

## Later frontend integration checklist

The Next.js proxy must explicitly allow the new paths/methods, forward Cookie,
Origin and X-CSRF-Token, and preserve **each** Set-Cookie header separately.
Do not comma-join Set-Cookie or inject the old SDK's Authorization header for cookie
requests. Preserve no-store, Location and relevant response statuses. Trust only
configured proxy origins, never arbitrary Host/X-Forwarded headers.

Use the existing `useApiRequest` directly in each owning form; SWR may read session
data. Google start also uses that form's mutation handler before browser navigation.
Do not store passwords, codes, tokens or sessions in Zustand/localStorage. Clear
user-scoped SWR caches and UI stores after logout/account changes. Updating frontend
auth guards, removing the frontend SDK and regenerating types belongs to that later
integration, not this backend change.

## Verification

`python -m pytest tests/test_auth.py tests/test_authentication_contract.py tests/test_neon_auth_adapter.py`
runs provider-mocked contracts and failures. Set `RUN_COMMERCE_DB_TESTS=1` and run
`python -m pytest tests/test_authentication_db.py` for isolated PostgreSQL sessions,
roles, cookie rotation, expiry, revocation and OAuth replay tests. Disposable schemas
are dropped after tests. Real inbox delivery and Google consent must be reported
separately from mocked-provider results.

For a fresh QA alias, `python tests/auth_live_probe.py customer+unique-qa@gmail.com`
runs real APIs and prompts privately for email codes. Passwords stay in memory.
This development-only probe creates a QA identity; never supply a customer address.

## Verified checkpoint — 2026-11-22

- Migration `0006_auth_sessions` applied to the available development database.
- Final focused auth, catalog, commerce and account contract/security checks:
  **75 passed**. Cookie/bearer Swagger assertions were updated for both schemes.
- The broader regression run found three obsolete documentation assertions;
  after correction, `python -m pytest --lf -q -o addopts=` returned **3 passed**.
- Disposable PostgreSQL tests verified cookie rotation, absolute expiry, provider
  revocation, customer/admin boundaries, reset revocation and concurrent OAuth replay.
- Real FastAPI → Neon: signup 200, verification 200, used verification code 400,
  reset confirmation 200, used reset code 400, login 200, session/profile 200,
  customer admin check 403, logout 200 and session after logout 401.
- Real Google start returned 200 with an authorization URL and binding cookie.
  Google consent and the final real callback remain unverified; mocked-provider
  tests cover verifier exchange, state binding, expiry, cancellation and replay.
- Live testing found and corrected Python 3.12 parsing of Neon's `Partitioned`
  cookies and native UUID conversion for session revocation. Provider outages
  remain documented 503 responses; writes are never automatically retried.
