from app.api.catalog_examples import PRODUCT, ID, IMAGE

PRODUCT_RESPONSE = {
    **PRODUCT, "id": ID, "created_at": "2026-11-24T12:00:00Z", "updated_at": "2026-11-24T12:00:00Z",
    "images": [{**IMAGE, "url": "https://storage.example.com/catalog-images/product/image.png", "position": 0}],
    "category": {"name": "Gold jewellery", "slug": "gold-jewellery"},
    "display_price": {"amount": 120000, "currency": "NGN", "available": True, "reason": None, "karat": None},
}


def product_success(message: str, status=200, *, deleted=False):
    return {status: {"description": message, "content": {"application/json": {"example": {
        "success": True, "status": status, "message": message,
        "data": {"deleted": True} if deleted else PRODUCT_RESPONSE,
    }}}}}
