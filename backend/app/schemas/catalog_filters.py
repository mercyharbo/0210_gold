from typing import Literal

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator
from app.core.errors import AppError
from app.schemas.catalog import Karat, Money
from app.schemas.catalog_options import CategoryType, ProductLabel, ProductSize, ProductColor, ProductStatus, ProductPricing

PublicProductSort = Literal["newest", "oldest", "price_asc", "price_desc", "name", "name_desc"]
AdminProductSort = Literal[PublicProductSort, "stock_asc", "stock_desc", "updated_desc"]


def validate_range(lower, upper, field: str, lower_field: str):
    if lower is not None and upper is not None and lower > upper:
        raise AppError(code="VALIDATION_ERROR", message="Check the product filters.", status_code=422,
                       field_errors={field: [f"Must be greater than or equal to {lower_field}."]})


class ProductFilters(BaseModel):
    model_config = ConfigDict(extra="ignore")
    q: str = Field(default="", max_length=100, description="Case-insensitive product-name substring; %, _ and backslashes are literal characters.")
    category: str | None = Field(default=None, max_length=180, description="Exact category slug, for example gold-necklaces.")
    category_type: CategoryType | None = Field(default=None, description="Exact category type.")
    label: ProductLabel | None = Field(default=None, description="Exact merchandising label; omitted includes unlabeled products.")
    min_price: Money | None = Field(default=None, description="Inclusive minimum NGN price, not kobo; compared to the whole-NGN display price. Unavailable prices are excluded.")
    max_price: Money | None = Field(default=None, description="Inclusive maximum displayed price in NGN. Uses the API display price, including gold-rate pricing and rounding.")
    gold_karat: Karat | None = Field(default=None, description="Product must offer this karat. Does not select or change the displayed price.")
    size: ProductSize | None = Field(default=None, description="Product must offer this exact size.")
    color: ProductColor | None = Field(default=None, description="Product must offer this exact color.")
    pricing_type: ProductPricing | None = Field(default=None, description="Supported fixed/starting-from presentation; does not enable gold-rate pricing.")
    is_gold_karat_priced: bool | None = Field(default=None, description="Whether pricing uses weight, manual gold rates and making charge.")
    in_stock: bool | None = Field(default=None, description="True: stock minus unexpired held reservations > 0. False: <= 0. Read-only snapshot; checkout remains authoritative.")
    sort: PublicProductSort = Field(default="newest", description="Name sorts ignore case; unavailable prices sort last. Product ID breaks ties.")
    page: int = Field(default=1, ge=1, description="One-based page after applying all filters.")
    page_size: int = Field(default=24, ge=1, le=100, description="Maximum products per page; total counts all matching products.")

    @model_validator(mode="after")
    def validate_prices(self):
        validate_range(self.min_price, self.max_price, "max_price", "min_price")
        return self


class AdminProductFilters(ProductFilters):
    sort: AdminProductSort = Field(default="newest", description="Includes raw-stock ascending/descending and most recently updated; product ID breaks ties.")
    status: ProductStatus | None = Field(default=None, description="Admin only. Omitted includes draft, active and archived products.")
    category_active: bool | None = Field(default=None, description="Admin only. Filter the parent category's active state.")
    stock_min: int | None = Field(default=None, ge=0, description="Admin only. Inclusive minimum recorded stock, before reservation subtraction.")
    stock_max: int | None = Field(default=None, ge=0, description="Admin only. Inclusive maximum recorded stock, before reservation subtraction.")
    created_from: AwareDatetime | None = Field(default=None, description="Admin only. Inclusive creation timestamp, ISO 8601 with timezone; compared as UTC instants.")
    created_to: AwareDatetime | None = Field(default=None, description="Admin only. Inclusive upper creation timestamp; must be >= created_from.")

    @model_validator(mode="after")
    def validate_admin_ranges(self):
        validate_range(self.stock_min, self.stock_max, "stock_max", "stock_min")
        validate_range(self.created_from, self.created_to, "created_to", "created_from")
        return self
