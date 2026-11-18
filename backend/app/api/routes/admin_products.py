from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.models.catalog import Product
from app.services.identity import require_admin
from app.schemas.catalog import ProductBody, ProductData, Deleted, ProductPage
from app.schemas.envelope import ApiSuccess
from app.services.catalog import output, record, save, remove
from app.services.catalog_page import product_page

router = APIRouter(prefix="/admin/products", tags=["admin products"],
                   dependencies=[Depends(require_admin)], responses=ERRORS)

@router.get("", response_model=ApiSuccess[ProductPage], operation_id="listAdminProducts",
            summary="List products for administration", description="Requires admin or super_admin. Includes unpublished records.")
async def listing(session: AsyncSession = Depends(get_db_session), page: int = Query(1, ge=1), page_size: int = Query(24, ge=1, le=100), q: str = Query('', max_length=100)):
    data = await product_page(session, public=False, page=page, page_size=page_size, q=q)
    return ApiSuccess(status=200, data=data)

@router.get("/{identifier}", response_model=ApiSuccess[ProductData], operation_id="getAdminProduct",
            summary="Read a product for editing", description="Requires administrator. Identifier is a catalog UUID.")
async def detail(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await output(session, "products", await record(session, "products", str(identifier))))

@router.post("", status_code=201, response_model=ApiSuccess[ProductData], operation_id="createProduct",
             summary="Create a product", description="Requires administrator. JSON fixed or starting_from pricing only; inquiry-only writes are rejected. Starting from requires multiple gold options. Publication requires positive calculated prices and rates for every selectable karat. Images must reference completed managed uploads. Unique slugs return 409 on conflict.")
async def create(body: ProductBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=201, data=await save(session, "products", body))

@router.put("/{identifier}", response_model=ApiSuccess[ProductData], operation_id="replaceProduct",
            summary="Replace a product", description="Requires administrator. Full replacement including ordered images and options. Inquiry-only legacy drafts must be corrected to supported pricing before saving. Publication validates every option's price and gold rate. Stock cannot fall below active reservations (409). Previous images remain intact if validation or saving fails.")
async def update(identifier: UUID, body: ProductBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await save(session, "products", body, str(identifier)))

@router.delete("/{identifier}", response_model=ApiSuccess[Deleted], operation_id="deleteProduct",
               summary="Delete a product", description="Requires administrator. Referenced categories return 409. Detached images are retained for cleanup after 24 hours.")
async def destroy(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await remove(session, "products", str(identifier)))

