from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.schemas.catalog import CatalogBody, Karat, Money


class SettingsBody(CatalogBody):
    store_name: str = Field(default="FM LUXE", min_length=1, max_length=200)
    support_email: str = Field(default="", max_length=320, pattern=r"^$|^[^\s@]+@[^\s@]+\.[^\s@]+$")
    support_phone: str = Field(default="", max_length=40)
    store_address: str = Field(default="", max_length=1000)
    business_hours: str = Field(default="", max_length=300)
    primary_currency: str = Field(default="NGN", pattern="^NGN$")
    gbp_rate: Money = Decimal(0)
    usd_rate: Money = Decimal(0)
    local_shipping_fee: Money = Decimal(0)
    uk_shipping_rate_per_kg: Money = Decimal(0)
    free_shipping_threshold: Money = Decimal(0)


class RateBody(CatalogBody):
    rates: dict[Karat, Money] = Field(description="Positive NGN per gram. Send all configured karats; omitted rates are removed.")


class RateData(CatalogBody):
    karat: Karat
    rate: Money
    updated_at: datetime
