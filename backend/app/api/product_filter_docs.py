"""Integration guidance for the two product-list operations."""
from app.api.catalog_docs import ERRORS

FILTER_DESCRIPTION = """
All filters are optional, single-valued and combined with AND before counting or
pagination. `category` is an exact slug; `q` searches product names literally,
ignoring case. Option filters require membership without duplicating products.
Price bounds are inclusive NGN amounts (not kobo), compared to the same rounded
display price returned in each item. Gold products use their lowest priced
available karat. `gold_karat` filters offered options; it does not change price.
Unavailable prices are excluded only when a price bound is supplied, and sort
last in either price sort direction. Fixed pricing never switches to gold rates.

`in_stock` subtracts held reservations whose expiry is still in the future.
Expired reservations are ignored without writing to the database. Availability
can change before checkout; `stock` in the response remains recorded stock.

Defaults: newest, page 1, page_size 24 (maximum 100). Sorting ties use product ID.
An unknown category/valid but unmatched filter returns an empty page, not 404.
Invalid values/ranges return 422 with `error.fieldErrors`. Unknown query names
are ignored for compatibility. Existing requests without filters are unchanged.

Example: `?category=gold-necklaces&label=featured&sort=newest&page_size=4`.
Example: `?min_price=50000&max_price=200000&gold_karat=18k&in_stock=true`.
"""
PUBLIC_DESCRIPTION = "Public; no login required. Only active products in active categories. " + FILTER_DESCRIPTION + """
Admin-only filters such as `status` and `category_active` are not supported here
and cannot override public visibility. Admin-only sort values return 422.
"""
ADMIN_DESCRIPTION = """Requires a verified admin or super_admin identity through
the HttpOnly backend session cookie or a validated bearer token. Customer access
returns 403; missing/invalid authentication returns 401. Cookie reads require no
CSRF token. Includes unpublished products and inactive categories by default.
""" + FILTER_DESCRIPTION + """
Admin-only filters: `status`, `category_active`, `stock_min`, `stock_max`,
`created_from` and `created_to`. Stock bounds use recorded quantities before
reservations; bounds are inclusive. Creation bounds are inclusive ISO 8601
timestamps with timezone, compared as UTC instants. Omitted bounds are unbounded.
Extra sorts: stock_asc, stock_desc and updated_desc.
Example: `?status=draft&category_active=false&stock_max=5&sort=updated_desc`.
"""

PRODUCT_LIST_RESPONSES = {
    200: {"description": "Filtered products and total matching count.", "content": {"application/json": {"example": {
        "success": True, "status": 200, "message": "Products retrieved successfully.",
        "data": {"items": [], "total": 0, "page": 1, "page_size": 24},
    }}}},
    422: {**ERRORS[422], "content": {"application/json": {"example": {
        "success": False, "status": 422, "error": {"code": "VALIDATION_ERROR",
        "message": "Check the product filters.", "fieldErrors": {
            "max_price": ["Must be greater than or equal to min_price."],
        }},
    }}}},
}
ADMIN_LIST_RESPONSES = {**PRODUCT_LIST_RESPONSES, 401: {**ERRORS[401],
    "description": "A verified backend cookie session or valid bearer identity is required.",
    "content": {"application/json": {"example": {"success": False, "status": 401,
        "error": {"code": "UNAUTHENTICATED", "message": "Sign in to continue."}}}}}}
