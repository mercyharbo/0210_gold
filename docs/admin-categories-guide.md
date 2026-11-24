# Admin categories

The original admin sidebar/header is active. Categories are integrated; the other
sections deliberately render unavailable content without calling legacy Supabase
workflows. The proxy validates backend administrator access for every admin route;
FastAPI independently authorizes every protected API operation. The layout only
composes the interface and does not repeat the session request.

## Follow a request

1. `useAdminCategories` / `useAdminCategory` in `hooks/use-admin-endpoint.ts` describe
   GET keys and use the shared `useApiRead` / `apiFetcher` transport.
2. `components/admin/categories/category-form.tsx` owns the React Hook Form values
   and visible POST/PUT calls. `categories-client.tsx` owns DELETE and confirmation.
3. `useApiRequest` obtains fresh CSRF and sends cookies automatically. Handlers
   never add authorization headers or call Neon/Supabase directly.
4. The existing allowlisted `/api/**` proxy forwards to FastAPI `/v1/**`.
5. Confirmed writes toast the server message, then revalidate affected category
   and product SWR keys. A refresh failure does not retry the write.

The backend currently permits null category success messages, so these handlers
retain short fallbacks. API field errors remain inline. Existing generated
`CategoryBody` / `CategoryData` contracts are reused; no contract changes are made.

## Images

`category-image.tsx` visibly authorizes POST `/admin/media/uploads`, uploads the raw
file to the returned storage URL (the documented direct-storage exception), then
POSTs `/admin/media/{id}/complete`. Only validated media IDs and alt text are sent
when saving the category. One JPEG/PNG/WebP/AVIF image up to 5 MiB is supported.

Replacement keeps the previous image until upload validation succeeds; no category
record changes before Save. Removing an image detaches it on Save. Detached or
abandoned objects remain eligible for the backend's safe cleanup after 24 hours;
referenced objects are never deleted by the form. Failed uploads attempt managed
media deletion. No arbitrary storage URL or object key is accepted for deletion.

Category routes: GET/POST collection, GET/PUT/DELETE UUID detail. There is no bulk
delete endpoint, so the restored table exposes individual confirmed deletion.
Featured collections require a description and image. Other categories may use
`images: []`. Storefront server reads use no-store and see saved changes on the
next request; mounted catalog SWR reads are revalidated after admin mutations.
