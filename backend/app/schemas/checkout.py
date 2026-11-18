from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.services.locations import nigeria_locations

Naira = Annotated[Decimal, Field(ge=0, max_digits=18, decimal_places=2,
                               description="NGN decimal amount, e.g. 5000.50; never kobo.")]


class StrictBody(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ShippingBody(StrictBody):
    name: str = Field(min_length=2, max_length=200, description="Recipient's full name.")
    phone: str = Field(pattern=r"^\+?[0-9 ()-]{7,30}$", description="Delivery contact telephone.")
    address: str = Field(min_length=5, max_length=1000, description="Street address; not a saved-address identifier.")
    country: Literal["Nigeria"] = "Nigeria"
    state: str = Field(min_length=1, max_length=100, description="State/FCT from the bundled Nigerian dataset.")
    local_area: str = Field(min_length=1, max_length=100, description="Local government area belonging to that state.")

    @model_validator(mode="after")
    def valid_location(self):
        if self.local_area not in nigeria_locations().get(self.state, []):
            raise ValueError("Choose a valid Nigerian state and local government area.")
        return self


class CartLine(StrictBody):
    product_id: UUID
    quantity: int = Field(ge=1, le=10000, strict=True, description="Positive whole quantity; stock is shared across options.")
    size: str | None = Field(default=None, max_length=60)
    color: str | None = Field(default=None, max_length=60)
    karat: Literal["18k", "22k", "24k"] | None = None


class QuoteBody(StrictBody):
    items: list[CartLine] = Field(min_length=1, max_length=100)
    shipping: ShippingBody

    @model_validator(mode="after")
    def unique_lines(self):
        keys = [(item.product_id, item.size, item.color, item.karat) for item in self.items]
        if len(keys) != len(set(keys)):
            raise ValueError("Merge identical product and option combinations into one line.")
        return self


class LineData(StrictBody):
    product_id: str
    name: str
    slug: str
    quantity: int
    size: str | None
    color: str | None
    karat: str | None
    unit_price: Naira
    line_total: Naira


class QuoteData(StrictBody):
    id: str
    items: list[LineData]
    shipping: ShippingBody
    subtotal: Naira
    delivery: Naira
    total: Naira
    currency: Literal["NGN"] = "NGN"
    expires_at: datetime = Field(description="UTC expiry, five minutes after creation. Quote does not reserve stock.")


class OrderBody(StrictBody):
    quote_id: UUID = Field(description="An unexpired quote owned by the signed-in customer. No prices are accepted.")
