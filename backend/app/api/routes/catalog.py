from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.models.catalog import Banner, Category, Product, ProductOption
from app.schemas.catalog import BannerData, CategoryData, Karat, PriceData, ProductData, ProductPage
from app.schemas.envelope import ApiSuccess
from app.services.catalog import fail, output, rates
from app.services.catalog_page import product_page
from app.services.pricing import calculate_price
from app.schemas.catalog_filters import ProductFilters
from app.api.product_filter_docs import PUBLIC_DESCRIPTION, PRODUCT_LIST_RESPONSES

router = APIRouter(prefix="/catalog", tags=["catalog"], responses=ERRORS)


@router.get("/products", response_model=ApiSuccess[ProductPage], operation_id="listPublicProducts",
            summary="Search published products", description=PUBLIC_DESCRIPTION, responses=PRODUCT_LIST_RESPONSES)
async def products(filters: Annotated[ProductFilters, Query()], session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, message="Products retrieved successfully.",
                      data=await product_page(session, filters=filters))


async def public_product(session: AsyncSession, slug: str):
    item = await session.scalar(select(Product).join(Category).where(
        Product.slug == slug, Product.status == "active", Category.is_active.is_(True)))
    if not item:
        fail("NOT_FOUND", "Product was not found.", 404)
    return item


@router.get("/products/{slug}", response_model=ApiSuccess[ProductData], operation_id="getPublicProduct",
            summary="Read a published product by slug", description="Public. Includes ordered images, selectable options and backend-calculated display price.")
async def product(slug: str, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await output(session, "products", await public_product(session, slug)))


@router.get("/products/{slug}/price", response_model=ApiSuccess[PriceData], operation_id="previewProductPrice",
            summary="Calculate a selected-option price", description="Public read. NGN, decimal arithmetic rounded half up to whole naira. Fixed prices ignore karat pricing; no inventory reservation or checkout occurs.")
async def price(slug: str, karat: Karat | None = None, session: AsyncSession = Depends(get_db_session)):
    item = await public_product(session, slug)
    karats = list((await session.scalars(select(ProductOption.value).where(
        ProductOption.product_id == item.id, ProductOption.kind == "gold_karats"))).all())
    if karat and karat not in karats:
        fail("INVALID_OPTION", "Choose an available karat.", field="karat")
    return ApiSuccess(status=200, data=calculate_price(item, await rates(session), karats, karat))


@router.get("/categories", response_model=ApiSuccess[list[CategoryData]], operation_id="listPublicCategories",
            summary="Read active categories", description="Public. Ordered by sort order then name. Includes featured-card configuration.")
async def categories(session: AsyncSession = Depends(get_db_session)):
    rows = (await session.scalars(select(Category).where(Category.is_active.is_(True)).order_by(Category.sort_order, Category.name))).all()
    return ApiSuccess(status=200, data=[await output(session, "categories", row) for row in rows])


@router.get("/banners", response_model=ApiSuccess[list[BannerData]], operation_id="listPublicBanners",
            summary="Read active hero banners", description="Public. Ordered by sort order and creation date; routes are internal website paths.")
async def banners(session: AsyncSession = Depends(get_db_session)):
    rows = (await session.scalars(select(Banner).where(Banner.is_active.is_(True)).order_by(Banner.sort_order, Banner.created_at))).all()
    return ApiSuccess(status=200, data=[await output(session, "banners", row) for row in rows])
