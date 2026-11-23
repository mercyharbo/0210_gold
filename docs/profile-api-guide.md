# Customer profile integration

- `useAccountProfile` reads `/api/account/profile` with SWR. The storefront header and profile share this key; neither stores customer records in Zustand.
- `CustomerProfile` owns the tab layout and renders `Loading...` until its initial read completes. Each tab's content is a component; there is no shared form provider.
- Desktop tabs and the mobile Account section Select control the same selected view. Auth/profile use the scoped Meere styles in `components/auth/account.css`, with General Sans, gray inputs and black/red controls. Newsletter remains accessible from the footer without automatically opening on account pages.
- `ProfileInformationCard` owns the React Hook Form inputs and calls `execute('patch', '/account/profile', payload)` directly. The shared request hook obtains CSRF and sends cookies automatically.
- Only changed `first_name`, `last_name` and `phone` fields are sent. Cleared optional fields are `null`. Email and identity name are not editable; roles are not displayed.
- PATCH returns the saved profile and `message: "Profile updated successfully."`. The form toasts server success/general errors, keeps failed edits and focuses the first invalid field. Validation remains inline.
- After a successful write, the form resets from the saved response and calls `await mutate()` to refresh the shared profile/header GET. There is no manual cache-envelope update. A failed refresh must never report that the save failed or trigger another PATCH; the GET error remains visible separately.
- `proxy.ts` validates the backend session before `/profile` renders. Missing or expired sessions redirect to login; an unavailable session service returns 503. Components do not implement route guards. FastAPI independently protects GET/PATCH, including if a session expires while the page is open; read/write failures display server messages.
- Orders, addresses, preferences, reviews and wishlist remain unavailable. The retired Supabase profile actions and unused forms have been removed; the legacy product wishlist control is disabled.
- The `(index)` layout now uses only `components/storefront/header.tsx`, preserving the Meere navigation. Its account menu uses the same profile read and backend logout control.

For local development, run `npm run dev:backend` and `npm run dev:auth` from separate project-root terminals, then open `http://localhost:4100/profile`.
