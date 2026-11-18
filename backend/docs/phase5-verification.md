# Phase 5 verification — November 18, 2026

## Delivered

- Product-sales-only scope, with personal shopping, sourcing, food orders and
  request-management removed from website routes, actions, navigation, profile
  sections, administrator screens, notifications, settings and marketing copy.
- Customer profile/preferences, owned addresses, wishlist, paid-buyer reviews,
  recipient-owned notifications, order history, customer directory and fulfilment APIs.
- Fixed/gold-rate pricing only for writes. Historical inquiry records survive as
  drafts, and active gold pricing is protected against missing/invalid rate changes.
- Actor IDs remain administrator-only in fulfilment history. Stock alerts and
  payment/review/fulfilment notifications are transactional and deduplicated.
- Persistent product scope and backend-first boundaries updated in `AGENTS.md`.

## Backend evidence

The passing focused commands cover 75 distinct collected tests:

| Checks | Passing result |
| --- | --- |
| Authentication, health, catalog, commerce contracts and initial Phase 5 contracts | 43 passed |
| Phase 5 profiles/preferences/wishlists, address races, reviews and fulfilment | 4 passed |
| Pricing/notification integration plus Phase 4 order/payment/exception regressions | 20 passed |
| Final fulfilment actor privacy, stock-edit alerts and expanded anonymous-access contracts | 16 passed |
| Final wishlist display contract plus expanded contract/example checks | 14 passed |

These runs overlap intentionally where final changes required targeted rechecks;
their counts must not be added together. `pytest --collect-only` over the covered
files reports `75 tests collected`. No paid provider operations were performed.

Reproduction commands from `backend/`:

```powershell
.venv/Scripts/python.exe -m pytest tests/test_auth.py tests/test_health.py tests/test_catalog.py tests/test_commerce_contract.py tests/test_phase5_contract.py
$env:RUN_COMMERCE_DB_TESTS='1'
.venv/Scripts/python.exe -m pytest tests/test_phase5_account.py tests/test_phase5_operations.py tests/test_phase5_pricing_notifications.py tests/test_commerce_orders.py tests/test_commerce_payments.py tests/test_payment_exceptions.py
.venv/Scripts/python.exe -m alembic check
```

Migration `0005_product_sales` was applied only to the existing development
branch. `alembic check` returned `No new upgrade operations detected`.
Compilation passed. A final query confirmed revision `0005_product_sales` and
zero remaining `commerce_test_*` schemas. No test products were seeded publicly.

The restarted API returned 200 for `/docs`, `/redoc` and `/openapi.json`.
Live schema checks confirmed administrative actor history, wishlist price fields,
priced-only product writes and a 401 response for anonymous account access.
Sanitized success examples validate against their actual response models.

## Frontend evidence

- Changed-file ESLint: exit 0.
- TypeScript: exit 0. Removed-route generated Next types were refreshed with
  `next typegen`; frontend OpenAPI types were not generated or edited.
- Final `npm run build`: exit 0, TypeScript completed, 29 static pages generated.
- An earlier successful build was followed by rendered QA fixes for duplicate
  main landmarks, Contact's legacy settings call and a low-contrast CTA. The
  final corrected source was rebuilt; those issues are resolved.
- Handwritten touched feature files are below 200 lines. New shadcn primitives
  reuse the existing `cn` helper without introducing another utility dependency.
- Touched frontend source passed the project typography/neutral-color checks.

Browser plugin was unavailable. Existing Playwright and installed Chrome were
used at `http://localhost:4100` against the production build:

- Mobile 375×812, tablet 768×1024 and desktop 1440×1000.
- About, Contact, FAQ and Shop: 12 successful responsive page checks.
- No horizontal overflow, blank pages, framework error overlays or page errors.
- A separate console audit found the existing missing `/favicon.ico` (404).
  No application JavaScript error was reported; the icon asset is outside this cleanup.
- FAQ keyboard activation and ArrowDown focus movement passed.
- About contact CTA has visible contrasting text; hero image is loaded eagerly.
- Public metadata and visible copy no longer promote the retired businesses.
- Sitemap returned 200 without retired routes.
- `/personal-shopper-request`, `/make-a-request`, `/companies`, `/admin/requests`
  and `/admin/personal-shopper-requests` each returned 404, without auth redirects.

Screenshots and the disposable QA script/report are under ignored `backend/.venv/`.
Mobile/desktop About and mobile FAQ screenshots were visually inspected. The
production report is `phase5-ui-report.json`; no preview website was introduced.

## API readiness and deliberate integration boundary

The backend covers the approved product-selling workflows: managed identity and
roles, catalog/categories/media, pricing/settings, quotes, reservations, Bachs
payments, orders, profiles/addresses/preferences, wishlists, reviews, in-app
notifications, customer lookup and fulfilment. The real matching Bachs sandbox
payment remains documented separately in Phase 4 evidence.

The new Phase 5 APIs are intentionally not wired to the website. Integration
must add explicit proxy paths, regenerate types from FastAPI and replace the
remaining legacy actions with SWR reads and component-owned useApiRequest calls.
Use matching identity/database/storage branch configuration, local_area address
fields and separate fulfilment/payment states. Do not reintroduce request forms
or unsupported legacy payment-status controls.

Customer/admin legacy screens remain gated in the current Neon application;
their new APIs were exercised through backend integration tests rather than
browser account flows. Existing catalog/media interfaces are retained; storage
uploads were not rerun as part of this account-focused phase.

No production deployment, real charge, payout, refund, manual-transfer workflow,
Supabase data migration, remote legacy deletion or paid service was introduced.
Environment files and historical SQL were preserved. Changes remain uncommitted,
including the pre-existing Phase 4 work that this phase extends.
