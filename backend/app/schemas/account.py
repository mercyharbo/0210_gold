from datetime import datetime
from typing import Generic, Literal, TypeVar
from uuid import UUID
from pydantic import Field, model_validator
from app.schemas.auth import ProfileData
from app.schemas.checkout import StrictBody
from app.schemas.catalog import PriceData
from app.services.locations import nigeria_locations

T = TypeVar("T")


class Page(StrictBody, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class ProfilePatch(StrictBody):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, pattern=r"^\+?[0-9 ()-]{7,30}$")


class PreferencesBody(StrictBody):
    category_ids: list[UUID] = Field(default_factory=list, max_length=100,
        description="Complete replacement of category preferences; duplicates are rejected.")

    @model_validator(mode="after")
    def unique(self):
        if len(self.category_ids) != len(set(self.category_ids)):
            raise ValueError("Category IDs must be unique.")
        return self


class AddressBody(StrictBody):
    label: str | None = Field(None, max_length=100)
    recipient_name: str = Field(min_length=2, max_length=200)
    phone: str = Field(pattern=r"^\+?[0-9 ()-]{7,30}$")
    address_line_1: str = Field(min_length=5, max_length=1000)
    address_line_2: str | None = Field(None, max_length=1000)
    country: Literal["Nigeria"] = "Nigeria"
    state: str = Field(min_length=1, max_length=100)
    local_area: str = Field(min_length=1, max_length=100, description="Local government area, distinct from locality.")
    locality: str | None = Field(None, max_length=150)
    postal_code: str | None = Field(None, max_length=20)
    delivery_notes: str | None = Field(None, max_length=1000)

    @model_validator(mode="after")
    def location(self):
        if self.local_area not in nigeria_locations().get(self.state, []):
            raise ValueError("Choose a valid Nigerian state and local government area.")
        return self


class AddressCreate(AddressBody):
    is_default: bool = False


class AddressPatch(StrictBody):
    label: str | None = Field(None, max_length=100)
    recipient_name: str | None = Field(None, min_length=2, max_length=200)
    phone: str | None = Field(None, pattern=r"^\+?[0-9 ()-]{7,30}$")
    address_line_1: str | None = Field(None, min_length=5, max_length=1000)
    address_line_2: str | None = Field(None, max_length=1000)
    state: str | None = Field(None, max_length=100)
    local_area: str | None = Field(None, max_length=100)
    locality: str | None = Field(None, max_length=150)
    postal_code: str | None = Field(None, max_length=20)
    delivery_notes: str | None = Field(None, max_length=1000)


class AddressData(AddressBody):
    id: str
    is_default: bool
    created_at: datetime


class WishlistData(StrictBody):
    product_id: str
    name: str
    slug: str
    display_price: PriceData
    image_url: str | None
    image_alt: str | None
    available: bool = Field(description="False when product or category is inactive or its price is unavailable.")
    created_at: datetime


class CustomerData(StrictBody):
    profile: ProfileData
    order_count: int
    paid_order_count: int
    paid_total: str = Field(description="Sum of currently paid orders in NGN, two decimal places.")
