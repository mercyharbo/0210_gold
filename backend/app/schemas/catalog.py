from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

Money = Annotated[Decimal, Field(ge=0, max_digits=16, decimal_places=2, description="NGN amount, not kobo.")]
Karat = Literal["18k", "22k", "24k"]
Slug = Annotated[str, Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)]


class CatalogBody(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ImageInput(CatalogBody):
    media_id: UUID = Field(description="ID of a completed managed upload.")
    alt: str = Field(min_length=1, max_length=300, description="Accessible image description.")


class CategoryBody(CatalogBody):
    name: str = Field(min_length=1, max_length=150)
    slug: Slug
    category_type: Literal["Fashion", "Gold", "Accessories", "Bags", "Footwear", "Modest Wear"]
    description: str | None = Field(default=None, max_length=5000)
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = Field(default=0, ge=0)
    featured_sort_order: int = Field(default=0, ge=0)
    images: list[ImageInput] = Field(default_factory=list, max_length=1)

    @model_validator(mode="after")
    def featured(self):
        if self.is_featured and (not self.description or not self.images):
            raise ValueError("Featured categories require a description and image.")
        return self


class ProductBody(CatalogBody):
    name: str = Field(min_length=1, max_length=200)
    slug: Slug
    category_id: UUID
    pricing_type: Literal["fixed", "starting_from", "price_on_request"] = "fixed"
    price: Money | None = None
    stock: int = Field(default=0, ge=0)
    status: Literal["draft", "active", "archived"] = "draft"
    description: str = Field(min_length=1, max_length=20000)
    label: Literal["best seller", "new in", "featured"] | None = None
    details: list[Annotated[str, Field(max_length=500)]] = Field(default_factory=list, max_length=30)
    sizes: list[Literal["one size", "xs", "s", "m", "l", "xl", "xxl", "37", "38", "39", "40", "41", "42"]] = Field(default_factory=list)
    colors: list[Literal["gold", "black", "cream", "ivory", "white", "brown", "neutral", "sage", "blush", "rose", "taupe", "lavender", "slate"]] = Field(default_factory=list)
    gold_karats: list[Karat] = Field(default_factory=list, max_length=3)
    gold_weight_grams: Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=3)] | None = None
    making_charge: Money = Decimal(0)
    note: str | None = Field(default=None, max_length=5000)
    is_gold_karat_priced: bool = False
    images: list[ImageInput] = Field(default_factory=list, max_length=8)

    @model_validator(mode="after")
    def pricing(self):
        if self.pricing_type != "price_on_request":
            if self.is_gold_karat_priced and (not self.gold_weight_grams or not self.gold_karats):
                raise ValueError("Gold pricing requires weight and at least one karat.")
            if not self.is_gold_karat_priced and (self.price is None or self.price <= 0):
                raise ValueError("Fixed and starting prices must be above zero.")
        if self.status == "active" and not self.images:
            raise ValueError("Active products require at least one image.")
        for values in (self.sizes, self.colors, self.gold_karats):
            if len(values) != len(set(values)):
                raise ValueError("Selectable options must not contain duplicates.")
        return self


class BannerBody(CatalogBody):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    route: str = Field(pattern=r"^/([a-zA-Z0-9?][a-zA-Z0-9/?=&_%#.-]*)?$", max_length=300)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0)
    images: list[ImageInput] = Field(min_length=1, max_length=1)


class ImageData(BaseModel):
    media_id: str
    url: str
    alt: str
    position: int


class CategoryData(CategoryBody):
    images: list[ImageData]
    id: str
    created_at: datetime
    updated_at: datetime


class PriceData(BaseModel):
    amount: int | None = Field(description="Whole NGN, rounded half up; null when on request or rates unavailable.")
    currency: Literal["NGN"] = "NGN"
    available: bool
    reason: str | None = None
    karat: Karat | None = None


class ProductData(ProductBody):
    images: list[ImageData]
    id: str
    created_at: datetime
    updated_at: datetime
    category: dict[str, str]
    display_price: PriceData


class BannerData(BannerBody):
    images: list[ImageData]
    id: str
    created_at: datetime
    updated_at: datetime


class ProductPage(BaseModel):
    items: list[ProductData]
    total: int
    page: int
    page_size: int


class Deleted(BaseModel):
    deleted: bool = True
