from sqlalchemy import select
from app.core.errors import AppError
from app.models.catalog import GoldRate, Product, ProductOption
from app.services.commerce_common import advisory, reject
from app.services.pricing import calculate_price


def validate_prices(product, rates, karats):
    if product.is_gold_karat_priced and any(karat not in rates for karat in karats):
        reject("GOLD_RATE_REQUIRED", "Configure rates for every selectable karat before publication.", 422, "gold_karats")
    selected = karats if product.is_gold_karat_priced else [None]
    prices = [calculate_price(product, rates, karats, karat) for karat in selected]
    if not prices or any(not price.available or price.amount is None or price.amount <= 0 for price in prices):
        reject("PRICE_REQUIRED", "Every option must have a positive calculated NGN purchase price.", 422, "price")
    if product.pricing_type == "starting_from" and len({price.amount for price in prices}) < 2:
        reject("VARIABLE_PRICE_REQUIRED", "Starting from requires different calculated option prices.", 422, "pricing_type")


async def publication(session, body):
    await advisory(session, "catalog:gold-pricing")
    if body.status != "active":
        return
    rates = {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}
    validate_prices(body, rates, body.gold_karats)


async def validate_rate_replacement(session, rates):
    await advisory(session, "catalog:gold-pricing")
    products = (await session.scalars(select(Product).where(Product.status == "active",
        Product.is_gold_karat_priced.is_(True)))).all()
    options = (await session.scalars(select(ProductOption).where(ProductOption.product_id.in_([product.id for product in products]),
        ProductOption.kind == "gold_karats"))).all()
    for product in products:
        try:
            validate_prices(product, rates, [option.value for option in options if option.product_id == product.id])
        except AppError:
            reject("ACTIVE_PRODUCT_RATE_CONFLICT", "These rates would make an active product's pricing invalid. Correct or unpublish the product first.", 409, "rates")
