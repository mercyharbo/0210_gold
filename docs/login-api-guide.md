# Login request example

The UI, React Hook Form setup, validation and both mutation handlers are directly
in `app/(auth)/login/page.tsx`. There is no separate login form component.

## Follow one password request

1. React Hook Form validates email/password using the page's Zod schema.
2. The page calls `passwordRequest.execute('post', '/auth/login', values)`.
   The method, path and payload remain visible in its submit handler.
3. `useApiRequest` obtains fresh CSRF through the focused SWR auth read and attaches
   `X-CSRF-Token` automatically. Concurrent protocol reads share one promise; each
   mutation still owns its own loading/errors. Features do not repeat header setup.
4. The existing transport prefixes `/api` and includes cookies automatically.
5. The allowlisted Next.js handler forwards the request to FastAPI `/v1/auth/login`.
   No Neon client, SQL call or Supabase action runs in the login page.
6. FastAPI validates credentials, initializes the profile and returns an HttpOnly
   session cookie. Next.js preserves every `Set-Cookie` header separately.
7. The page validates the returned role, resets UI selections and calls
   `window.location.replace`: admin/super_admin → `/admin/categories`; customer → `/`.
   This single full navigation starts with the new cookie and fresh in-memory SWR
   caches. Do not await SWR cleanup or call `router.refresh()` on the login page.

`proxy.ts` independently checks `/login` sessions with FastAPI. An authenticated
visitor is redirected by role. Invalid cookies allow the login UI to render;
service failures show a safe message. Admin layouts and FastAPI still validate
permissions: a browser cookie or client-side redirect never grants admin access.

## Errors and ownership

- Field values and validation stay in React Hook Form. Field errors render using
  shadcn `FieldError`, with the first invalid input focused.
- Each `useApiRequest` owns its own POST lifecycle. Both login buttons are disabled
  while either flow runs; a local submission lock also prevents rapid duplicates.
- Failed requests preserve the entered values. After success, inputs remain locked
  and the button shows “Redirecting...” until the new document loads.
- Credentials, codes and tokens are never saved in Zustand or localStorage.
- Genuine local UI state, such as password visibility, remains local.

## Google and local setup

Use **http://localhost:4100**, consistently rather than mixing it with 127.0.0.1.
Start FastAPI with `npm run dev:backend` and Next.js with `npm run dev:auth`.
In the server-only backend environment:

```dotenv
AUTH_FRONTEND_URL=http://localhost:4100
AUTH_PUBLIC_API_URL=http://localhost:4100/api
AUTH_SUCCESS_PATH=/login
```

Google's button visibly calls `/auth/google/start` in the page; the shared hook
handles CSRF. The browser visits the returned authorization URL. Google returns through
Neon to `/api/v1/auth/google/callback`, which is explicitly proxied to FastAPI.
FastAPI sets the session and returns to `/login`; Next.js proxy selects the role's
destination. Callback failures redirect to a fixed safe login error, without
forwarding verifier values or provider messages. Google's provider callback remains
the configured Neon callback, not the Next.js callback.

Sign-out in the existing admin control uses `/auth/logout` with fresh CSRF, clears
private caches/UI state and returns to login.

## What remains for manual integration

Signup keeps its existing design but cannot submit. Verification and recovery keep
their previous implementation until their separate integration. The shared
credentials form was removed completely.

Existing and future `useApiRequest` mutations receive CSRF automatically. Follow
the page's visible method/path/payload pattern; do not hide feature writes in SWR
hooks or stores. No catalog forms were rewritten as part of login.

The generated `types/api-schema.d.ts` comes from FastAPI OpenAPI. Small aliases in
`types/authentication.ts` reference those schemas; do not hand-edit generated types.
Proxy/session regression checks: `node --test scripts/test-login-proxy.mjs`.
