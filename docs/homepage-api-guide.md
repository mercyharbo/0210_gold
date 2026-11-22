# Homepage API example

The homepage renders initial catalog content on the server. SWR then owns the
browser cache. The storefront layout composes its header and footer directly.

## Follow a read

1. `lib/catalog/home.ts` loads banners, categories and the eight newest products
   through the existing server-only catalog helper. Failed reads remain undefined
   so they cannot be mistaken for an empty catalog.
2. Sections receive their initial result directly and call focused read hooks
   from `hooks/use-home-endpoint.ts`.
3. Hooks reuse `useCatalogRead` and `apiFetcher`. Browser requests use explicit
   `/api/catalog/**` keys forwarded through the allowlisted proxy to FastAPI.
4. SWR owns data, loading, errors and refresh. Sections retain stale content on
   refresh errors and call their own `mutate` for targeted retries.

The product query is `sort=newest&page=1&page_size=8` on server and client.
FastAPI owns prices and visibility. Server data never goes into Zustand.

## State and future writes

`stores/storefront-navigation.ts` holds shared menu controls and a reset action.
It resets on route changes. Hero scrolling stays in the DOM.

Newsletter opens from the footer and once per browser session after eight seconds.
Its controls are disabled until its API exists. Future newsletter mutations
must call `useApiRequest` directly inside the owning form, keeping `execute`,
method, endpoint and payload visible there. Use React Hook Form for validation,
preserve failed input and show backend field errors inline.

## Approved visual reference

The user has permission to reproduce Meere. Match its General Sans font, #e10600
announcement strip, 24px desktop gutters, 54px desktop navigation, 34px desktop
section headings and 28px mobile headings. The desktop hero uses a 9.737vw display
size, with 32px on mobile. Sticky hero content inside a taller photograph creates
the reference's scroll effect. Navigation labels roll on hover; the announcement
strip moves continuously. Reduced motion disables these transitions.

Reference: https://meere.framer.website/. General Sans weights 400, 500 and 600
are served locally from the same public Fontshare files used by the reference.
FM LUXE imagery/content, Nigerian shopping context and genuine catalog states
replace the template's example content. Lookbook remains excluded.

## Local verification

Start FastAPI with `pnpm dev:backend` and Next.js with `pnpm dev`. Configure the
server-only `BACKEND_URL` to point to FastAPI. Empty catalog results are valid.
Check `/`, `/api/catalog/products?sort=newest&page=1&page_size=8` and backend `/docs`.
