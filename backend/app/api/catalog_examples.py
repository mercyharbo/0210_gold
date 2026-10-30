"""Sanitized examples; these are documentation, never seeded inventory."""
from copy import deepcopy

ID = "00000000-0000-4000-8000-000000000001"
IMAGE = {"media_id": ID, "alt": "Gold pendant on a neutral background"}
CATEGORY = {"name": "Gold jewellery", "slug": "gold-jewellery", "category_type": "Gold", "images": []}
PRODUCT = {"name": "Gold pendant", "slug": "gold-pendant", "category_id": ID, "description": "A polished gold pendant.",
           "pricing_type": "fixed", "price": "120000.00", "stock": 3, "status": "active", "images": [IMAGE],
           "sizes": ["one size"], "colors": ["gold"], "gold_karats": ["18k"], "is_gold_karat_priced": False}
BANNER = {"title": "Considered details", "description": "Explore our latest collection.", "route": "/shop", "images": [IMAGE]}


def add_catalog_examples(schema):
    for path, methods in schema["paths"].items():
        if not path.startswith(("/v1/catalog/", "/v1/admin/")):
            continue
        kind = next((key for key in ("products", "categories", "banners") if f"/{key}" in path), None)
        for method, operation in methods.items():
            if not isinstance(operation, dict) or "responses" not in operation:
                continue
            example = deepcopy({"products": PRODUCT, "categories": CATEGORY, "banners": BANNER}.get(kind, {}))
            if "requestBody" in operation:
                if path.endswith("/settings"):
                    example = {"store_name": "FM LUXE", "primary_currency": "NGN", "local_shipping_fee": "5000.00"}
                elif path.endswith("/gold-rates"):
                    example = {"rates": {"18k": "133700.00", "22k": "163400.00", "24k": "178300.00"}}
                elif path.endswith("/uploads"):
                    example = {"kind": "product", "content_type": "image/png", "size": 102400}
                operation["requestBody"]["content"]["application/json"]["example"] = example
            if kind and method != "delete":
                data = deepcopy(example)
                data.update(id=ID, created_at="2026-10-30T12:00:00Z", updated_at="2026-10-30T12:00:00Z")
                data["images"] = [IMAGE | {"url": "https://storage.example.com/catalog-images/product/image.png", "position": 0}]
                if kind == "products":
                    data.update(category={"name": "Gold jewellery", "slug": "gold-jewellery"},
                                display_price={"amount": 120000, "currency": "NGN", "available": True, "reason": None, "karat": None})
                if path.endswith("/price"):
                    data = data["display_price"]
                elif path.endswith(f"/{kind}") and method == "get":
                    data = {"items": [data], "total": 1, "page": 1, "page_size": 24} if kind == "products" else [data]
                status = "201" if method == "post" else "200"
                operation["responses"][status]["content"]["application/json"]["example"] = {
                    "success": True, "status": int(status), "data": data, "message": None}
    return schema
