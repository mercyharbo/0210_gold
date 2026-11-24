from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.services.identity import require_admin
from app.schemas.catalog import ProductBody, ProductData, Deleted, ProductPage
from app.schemas.envelope import ApiSuccess
from app.services.catalog import output, record, save, remove
from app.services.catalog_page import product_page
from app.schemas.catalog_filters import AdminProductFilters
from app.api.product_filter_docs import ADMIN_DESCRIPTION, ADMIN_LIST_RESPONSES
from app.api.product_messages import product_success

router = APIRouter(prefix="/admin/products", tags=["admin products"],
                   dependencies=[Depends(require_admin)], responses=ERRORS)

@router.get("", response_model=ApiSuccess[ProductPage], operation_id="listAdminProducts",
            summary="List products for administration", description=ADMIN_DESCRIPTION, responses=ADMIN_LIST_RESPONSES)
async def listing(filters: Annotated[AdminProductFilters, Query()], session: AsyncSession = Depends(get_db_session)):
    data = await product_page(session, public=False, filters=filters)
    return ApiSuccess(status=200, message="Products retrieved successfully.", data=data)

@router.get("/{identifier}", response_model=ApiSuccess[ProductData], operation_id="getAdminProduct",
            summary="Read a product for editing", description="Requires administrator. Identifier is a catalog UUID.",
            responses=product_success("Product retrieved successfully."))
async def get_product(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, message="Product retrieved successfully.", data=await output(session, "products", await record(session, "products", str(identifier))))

@router.post("", status_code=201, response_model=ApiSuccess[ProductData], operation_id="createProduct",
             summary="Create a product", description="Requires administrator. JSON fixed or starting_from pricing only; inquiry-only writes are rejected. Starting from requires multiple gold options. Publication requires positive calculated prices and rates for every selectable karat. Images must reference completed managed uploads. Unique slugs return 409 on conflict.",
             responses=product_success("Product created successfully.", 201))
async def create_product(body: ProductBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=201, message="Product created successfully.", data=await save(session, "products", body))

@router.put("/{identifier}", response_model=ApiSuccess[ProductData], operation_id="replaceProduct",
            summary="Replace a product", description="Requires administrator. Full replacement including ordered images and options. Inquiry-only legacy drafts must be corrected to supported pricing before saving. Publication validates every option's price and gold rate. Stock cannot fall below active reservations (409). Previous images remain intact if validation or saving fails.",
            responses=product_success("Product updated successfully."))
async def update_product(identifier: UUID, body: ProductBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, message="Product updated successfully.", data=await save(session, "products", body, str(identifier)))

@router.delete("/{identifier}", response_model=ApiSuccess[Deleted], operation_id="deleteProduct",
               summary="Delete a product", description="Requires administrator. Active stock reservations return 409. Historical order snapshots are preserved. Detached images are retained for safe cleanup after 24 hours.",
               responses=product_success("Product deleted successfully.", deleted=True))
async def delete_product(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, message="Product deleted successfully.", data=await remove(session, "products", str(identifier)))

