# Catalog product filters

`GET /v1/catalog/products` is public and always restricts results to active products
in active categories. `GET /v1/admin/products` requires a verified admin/super_admin
cookie session or bearer identity and includes unpublished records by default.
Cookie GET requests do not require CSRF. Browser calls use `/api/catalog/products`
or `/api/admin/products` through the existing allowlisted Next.js proxy.

Every filter is optional and single-valued. Supplied filters combine with AND.
Omitted filters retain existing behavior; unknown query names are ignored.

| Filter | Meaning |
| --- | --- |
| `q` | Case-insensitive name substring, up to 100 characters; SQL wildcard characters are literal |
| `category` | Exact category slug, up to 180 characters |
| `category_type` | Existing catalog category enum, such as `Gold` |
| `label` | `featured`, `new in` or `best seller` |
| `min_price`, `max_price` | Inclusive nonnegative NGN bounds, not kobo; up to 2 decimal places |
| `gold_karat` | Product offers `18k`, `22k` or `24k` |
| `size`, `color` | Product offers the exact existing catalog enum value |
| `pricing_type` | `fixed` or `starting_from`; does not enable gold-rate pricing |
| `is_gold_karat_priced` | `true` or `false`, filter the pricing calculation method |
| `in_stock` | `true`: recorded stock minus unexpired held reservations is positive; `false`: zero or negative |
| `status` (admin) | `draft`, `active` or `archived` |
| `category_active` (admin) | Parent category active state |
| `stock_min`, `stock_max` (admin) | Inclusive nonnegative whole recorded-stock bounds, before reservations |
| `created_from`, `created_to` (admin) | Inclusive ISO 8601 timestamps with timezone, compared as UTC instants |

Price filters and price sorting use the returned `display_price.amount`, rounded
half up to whole NGN. Gold-rate products use their lowest-priced available karat,
weight and making charge. A karat membership filter does not select that karat's
price; use the existing product price-preview endpoint for a specific selection.
Fixed-price products remain fixed. Missing/unavailable prices do not match a price
range and sort last in either price direction. `stock` remains recorded stock in
the response; `in_stock` is a read-only availability snapshot, never a reservation.

Public sort values: `newest` (default), `oldest`, `name`, `name_desc`, `price_asc`,
`price_desc`. Admin also supports `stock_asc`, `stock_desc`, `updated_desc`.
Name sorting ignores case. All ties use product ID ascending.

Pagination: `page=1`, `page_size=24` by default, maximum page size 100. Filtering
occurs before both total count and pagination. Option joins never duplicate rows.
An unmatched filter returns an empty page rather than 404. Invalid enum values,
negative values, invalid pagination or inverted ranges return 422 and field errors.
Public requests cannot override visibility with admin-only parameters.

```text
/v1/catalog/products?category=gold-necklaces&label=featured&sort=newest&page=1&page_size=4
/v1/catalog/products?category_type=Gold&gold_karat=18k&min_price=50000&max_price=200000&in_stock=true
/v1/admin/products?status=draft&stock_max=5&sort=updated_desc
/v1/admin/products?created_from=2026-11-01T00%3A00%3A00Z&created_to=2026-11-30T23%3A59%3A59Z
```

Success retains `{success, status, message, data: {items, total, page, page_size}}`
with message `Products retrieved successfully.` Errors retain
`{success: false, status, error: {code, message, fieldErrors}}`.
Inverted ranges use `VALIDATION_ERROR`, message `Check the product filters.` and
field errors on `max_price`, `stock_max` or `created_to`. Ordinary invalid query
values use the existing validation envelope with keys such as `query.gold_karat`.
Swagger documents all fields, supported enum values, examples and permissions.

The homepage uses 8 newest arrivals, the first 2 featured collections, 4 newest
featured necklaces from `gold-necklaces`, the next 2 collections, 4 newest featured
products across all categories, then the existing editorial section. Collection
order uses `featured_sort_order`, preserving public API order for ties. Empty
collection blocks are omitted. Products may appear in more than one section.
No admin/customer filter controls are introduced by this update.
