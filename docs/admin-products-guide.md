# Admin product integration

The list follows the current category table. Create/edit use the category form's
layout, theme, shared shadcn controls and header Save/Cancel actions. The category
UI is preserved; its dropzone and slug helper are shared without changing behavior.

## Trace a request

- `hooks/use-admin-endpoint.ts`: `useAdminProducts(query)` and `useAdminProduct(id)`
  describe same-origin GET requests through the existing `useApiRead` / `apiFetcher`.
- `stores/admin-products-ui.ts`: only filters and pagination. No server records,
  credentials or request state; logout calls its explicit reset. Search waits 300ms.
- `components/admin/products/product-form.tsx`: `handleCreateProduct` and
  `handleUpdateProduct` visibly call POST/PUT with `productPayload(values)`.
- `products-client.tsx`: `handleDeleteProducts` calls DELETE after `ConfirmDialog`.
- `useApiRequest` adds fresh CSRF and cookies. The existing allowlisted Next.js
  proxy forwards to FastAPI, which independently enforces administrator permissions.

Routes: `/admin/products`, `/admin/products/new`, `/admin/products/{id}`. The older
`/{id}/edit` route redirects to the single editor. Initial reads show plain loading
text. IDs remain opaque in the UI; FastAPI/proxy still enforce their current contract.

Core filters: product name, category slug, status, label, availability and sort.
All search/filtering/pagination is server-side, with 24 rows per page. API advanced
filters remain available without adding their controls here. Recorded stock is
shown in the table; the availability filter accounts for unexpired reservations.

## Forms and media

React Hook Form owns all inputs; Zod validates supported values. New products are
drafts, with automatic name-derived slugs until manually overridden. Existing
slugs remain unchanged. A product label is a single nullable value: selecting
Featured makes an active product eligible for the homepage featured reads.

Calculation method (`is_gold_karat_priced`) is distinct from price presentation
(`pricing_type`). Configured prices stay fixed when karat options are selected.
Gold-rate prices are calculated only by FastAPI. Starting from requires gold-rate
pricing and multiple karats. Price on request is unavailable for writes; legacy
drafts require an explicit supported pricing choice. Publication requires an active
category, valid purchase price/rates and an image. Stock reservation conflicts
remain backend-owned and appear as inline errors.

`product-images.tsx` owns upload authorization, raw presigned PUT, completion and
failed-upload cleanup. This PUT is the documented direct-storage exception.
Up to 8 JPEG/PNG/WebP/AVIF files, 5 MiB each, upload sequentially. Only completed
media IDs and alt text enter the product payload; image URL/position are not sent.
The first ordered image is primary. Replacement preserves the original until
completion succeeds. Removal detaches on Save; abandoned/detached uploads remain
eligible for safe backend cleanup after 24 hours. Cancel does not delete shared or
saved media. Failed batches retain earlier completed draft images for correction.

Server success messages: Product retrieved/created/updated/deleted successfully.
General API feedback uses server messages in toasts; field errors remain inline.
Write success is handled before cache refresh. A refresh failure warns without
repeating POST/PUT/DELETE. Product cache invalidation covers admin lists/details,
public products and the homepage's filtered product keys.

No browser/UI tests, real catalog fixtures, paid service, deployment, migration or
unrelated admin integration is part of this update.
