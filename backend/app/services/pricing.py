from decimal import Decimal, ROUND_HALF_UP

from app.models.catalog import Product
from app.schemas.catalog import PriceData


def calculate_price(product: Product, rates: dict[str, Decimal], karats: list[str], karat: str | None = None) -> PriceData:
    if product.pricing_type == "price_on_request":
        return PriceData(amount=None, available=False, reason="PRICE_ON_REQUEST")
    if not product.is_gold_karat_priced:
        amount = product.price
    else:
        chosen = karat or next((key for key in karats if key in rates), None)
        if not chosen or chosen not in rates or not product.gold_weight_grams:
            return PriceData(amount=None, available=False, reason="GOLD_RATE_UNAVAILABLE", karat=karat)
        if karat is None:
            chosen = min((key for key in karats if key in rates), key=lambda key: rates[key])
        amount = product.gold_weight_grams * rates[chosen] + product.making_charge
        karat = chosen
    if amount is None:
        return PriceData(amount=None, available=False, reason="PRICE_UNAVAILABLE")
    return PriceData(amount=int(amount.quantize(Decimal("1"), rounding=ROUND_HALF_UP)), available=True, karat=karat)
