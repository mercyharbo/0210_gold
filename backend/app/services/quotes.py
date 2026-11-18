from collections import defaultdict
from datetime import timedelta
from decimal import Decimal
from sqlalchemy import select
from app.models.catalog import Category, GoldRate, Product, ProductOption, StoreSettings
from app.models.commerce import Quote
from app.schemas.catalog_settings import SettingsBody
from app.schemas.checkout import QuoteBody, QuoteData
from app.services.commerce_common import now, reject
from app.services.inventory import held_quantity
from app.services.pricing import calculate_price


async def price_cart(session, body: QuoteBody, products=None):
    ids = [str(line.product_id) for line in body.items]
    if products is None:
        products = {row.id: row for row in (await session.scalars(select(Product).where(Product.id.in_(ids)))).all()}
    categories = {row.id: row for row in (await session.scalars(select(Category).where(
        Category.id.in_({row.category_id for row in products.values()})))).all()}
    options = (await session.scalars(select(ProductOption).where(ProductOption.product_id.in_(ids)))).all()
    rates = {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}
    quantities = defaultdict(int)
    lines = []
    for index, line in enumerate(body.items):
        product = products.get(str(line.product_id))
        if not product or product.status != "active" or not categories[product.category_id].is_active:
            reject("PRODUCT_UNAVAILABLE", "This product is no longer available.", 422, f"items.{index}.product_id")
        allowed = {field: [option.value for option in options if option.product_id == product.id and option.kind == field]
                   for field in ("sizes", "colors", "gold_karats")}
        for key, field in (("size", "sizes"), ("color", "colors"), ("karat", "gold_karats")):
            value = getattr(line, key)
            if (allowed[field] and value not in allowed[field]) or (not allowed[field] and value is not None):
                reject("INVALID_OPTION", "Select an available product option.", 422, f"items.{index}.{key}")
        price = calculate_price(product, rates, allowed["gold_karats"], line.karat)
        if not price.available or price.amount is None or price.amount <= 0:
            reject("PRICE_UNAVAILABLE", "This product cannot be purchased at present.", 422, f"items.{index}.product_id")
        quantities[product.id] += line.quantity
        unit = Decimal(price.amount).quantize(Decimal("0.01"))
        lines.append({"product_id": product.id, "name": product.name, "slug": product.slug,
                      "quantity": line.quantity, "size": line.size, "color": line.color, "karat": line.karat,
                      "unit_price": str(unit), "line_total": str(unit * line.quantity)})
    for identifier, quantity in quantities.items():
        if quantity > products[identifier].stock - await held_quantity(session, identifier):
            reject("INSUFFICIENT_STOCK", "Some items no longer have enough stock.")
    row = await session.get(StoreSettings, 1)
    settings = SettingsBody.model_validate(row.values if row else {})
    subtotal = sum((Decimal(line["line_total"]) for line in lines), Decimal(0))
    delivery = settings.local_shipping_fee
    if settings.free_shipping_threshold > 0 and subtotal >= settings.free_shipping_threshold:
        delivery = Decimal(0)
    if subtotal + delivery > Decimal("9999999999999999.99"):
        reject("ORDER_TOTAL_TOO_LARGE", "Reduce the quantities in this order.", 422, "items")
    return {"items": lines, "shipping": body.shipping.model_dump(), "subtotal": format(subtotal, '.2f'),
            "delivery": format(delivery, '.2f'), "total": format(subtotal + delivery, '.2f'), "currency": "NGN"}, quantities


async def create_quote(session, customer_id, body):
    snapshot, _ = await price_cart(session, body)
    quote = Quote(customer_id=customer_id, request=body.model_dump(mode="json"), snapshot=snapshot,
                  expires_at=now() + timedelta(minutes=5))
    session.add(quote)
    await session.commit()
    return QuoteData(id=quote.id, expires_at=quote.expires_at, **snapshot)
