# Shared client GET reads

All client-side GET hooks use `useApiRead` from `hooks/use-api-read.ts`. It returns
SWR's existing result with the API envelope intact, so callers continue to read
`data?.data`, `error`, `isLoading`, `isValidating` and `mutate`.

```ts
export function useAccountProfile() {
  return useApiRead<AccountProfile>('/api/account/profile', {
    schema: accountProfileSchema,
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  })
}
```

`useApiRead(key, options?)` accepts a string or null key, optional `initialData`,
optional response-data `schema`, and SWR configuration. Null disables fetching.
It uses only `apiFetcher` from `lib/api/client.ts`; that fetcher uses the existing
transport, includes cookies, preserves server errors, and optionally validates
response data. Invalid schema data returns a sanitized `INVALID_API_RESPONSE`.
Do not write another fetcher or hide feature-specific mutations in these hooks.

Admin checks and admin catalog endpoints live in `hooks/use-admin-endpoint.ts`.
Public catalog, home, account, identity and auth reads remain in their focused
files. Admin settings/rates screens intentionally consume public catalog resources;
they keep the same public URLs and cache keys. `/api/account/profile` and
`/api/identity/me` stay distinct. CSRF is fetched on demand, never on mount.

Location hooks derive their existing countries/states/cities arrays from the shared
envelope. Home hooks pass `initialData` for the existing server-rendered fallback.
Feature retry/revalidation settings are explicit and unchanged. API mutations and
feedback stay directly in their owning forms through `useApiRequest`.

Checks: `node --test scripts/test-api-read.mjs scripts/test-login-proxy.mjs scripts/test-profile-proxy.mjs scripts/test-toast-store.mjs`.
