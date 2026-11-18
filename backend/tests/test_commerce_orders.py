import asyncio
from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import select
from app.models.catalog import Product
from app.models.commerce import Order, OrderItem, Quote, Reservation
from app.services.commerce_common import now


def test_authoritative_prices_and_uniform_delivery(commerce):
    quote = commerce.quote()
    assert quote["subtotal"] == "100000.00"
    assert quote["delivery"] == "5000.50"
    assert quote["total"] == "105000.50"
    assert commerce.quote(quantity=2)["delivery"] == "0.00"
    assert commerce.quote(shipping={"name": "QA", "phone": "08012345678", "address": "12 Example Road",
        "state": "Osun", "local_area": "Osogbo"})["delivery"] == "5000.50"


def test_quote_expiry_and_changed_price(commerce):
    product = commerce.product()
    quote = commerce.quote(product)
    commerce.edit(Product, product, price=Decimal("120000"))
    response = commerce.call("POST", "orders", {"quote_id": quote["id"]}, status=409, key=str(uuid4()))
    assert response["error"]["code"] == "QUOTE_CHANGED"
    quote = commerce.quote(product)
    commerce.edit(Quote, quote["id"], expires_at=now() - timedelta(seconds=1))
    assert commerce.call("POST", "orders", {"quote_id": quote["id"]}, status=409, key=str(uuid4()))["error"]["code"] == "QUOTE_EXPIRED"


def test_order_idempotency_and_ownership(commerce):
    quote = commerce.quote()
    key = str(uuid4())
    original = commerce.call("POST", "orders", {"quote_id": quote["id"]}, status=201, key=key)["data"]
    commerce.edit(Quote, quote["id"], expires_at=now() - timedelta(days=1))
    assert commerce.call("POST", "orders", {"quote_id": quote["id"]}, status=201, key=key)["data"]["id"] == original["id"]
    other_quote = commerce.quote()
    assert commerce.call("POST", "orders", {"quote_id": other_quote["id"]}, status=409, key=key)["error"]["code"] == "IDEMPOTENCY_CONFLICT"
    commerce.activate(commerce.other)
    commerce.call("GET", f"orders/{original['id']}", status=404)
    commerce.call("POST", f"orders/{original['id']}/cancel", status=404)
    commerce.call("GET", "admin/orders", status=403)


def test_last_item_cannot_be_reserved_twice(commerce):
    product = commerce.product(stock=1)
    quotes = [commerce.quote(product), commerce.quote(product)]
    async def compete():
        return await asyncio.gather(*(commerce.request("POST", "orders", {"quote_id": quote["id"]},
            {"Idempotency-Key": str(uuid4())}) for quote in quotes))
    results = commerce.run(compete())
    assert sorted(response.status_code for response in results) == [201, 409]
    assert commerce.value(Product, product, "stock") == 1


def test_cancel_and_expiry_release_stock_once(commerce):
    product = commerce.product(stock=1)
    order = commerce.order(product)
    commerce.call("POST", f"orders/{order['id']}/cancel")
    commerce.call("POST", f"orders/{order['id']}/cancel")
    assert commerce.value(Product, product, "stock") == 1
    next_order = commerce.order(product)
    expired = now() - timedelta(seconds=1)
    commerce.edit(Order, next_order["id"], expires_at=expired)
    async def expire():
        async with commerce.factory() as session:
            reservation = await session.scalar(select(Reservation).where(Reservation.order_id == next_order["id"]))
            reservation.expires_at = expired
            await session.commit()
    commerce.run(expire())
    assert commerce.quote(product)
    assert commerce.call("GET", f"orders/{next_order['id']}")["data"]["status"] == "expired"


def test_catalog_stock_guard_and_historical_snapshots(commerce):
    product = commerce.product(stock=1)
    order = commerce.order(product)
    commerce.activate(commerce.admin)
    commerce.call("DELETE", f"admin/products/{product}", status=409)
    body = {"name": "QA", "slug": "qa-change", "description": "QA", "category_id": commerce.category.id,
            "price": "100000", "stock": 0, "status": "active", "images": [{"media_id": str(uuid4()), "alt": "QA"}]}
    assert commerce.call("PUT", f"admin/products/{product}", body, status=409)["error"]["code"] == "STOCK_RESERVED"
    commerce.activate()
    commerce.call("POST", f"orders/{order['id']}/cancel")
    commerce.activate(commerce.admin)
    commerce.call("DELETE", f"admin/products/{product}")
    data = commerce.call("GET", f"admin/orders/{order['id']}")["data"]
    assert data["items"][0]["name"] == "QA pendant" and data["items"][0]["unit_price"] == "100000.00"
