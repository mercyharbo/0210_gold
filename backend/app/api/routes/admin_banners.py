from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.models.catalog import Banner
from app.services.identity import require_admin
from app.schemas.catalog import BannerBody, BannerData, Deleted
from app.schemas.envelope import ApiSuccess
from app.services.catalog import output, record, save, remove

router = APIRouter(prefix="/admin/banners", tags=["admin banners"],
                   dependencies=[Depends(require_admin)], responses=ERRORS)

@router.get("", response_model=ApiSuccess[list[BannerData]], operation_id="listAdminBanners",
            summary="List banners for administration", description="Requires admin or super_admin. Includes unpublished records.")
async def listing(session: AsyncSession = Depends(get_db_session)):
    rows = (await session.scalars(select(Banner).order_by(Banner.created_at.desc()))).all()
    data = [await output(session, "banners", row) for row in rows]
    return ApiSuccess(status=200, data=data)

@router.get("/{identifier}", response_model=ApiSuccess[BannerData], operation_id="getAdminBanner",
            summary="Read a banner for editing", description="Requires administrator. Identifier is a catalog UUID.")
async def detail(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await output(session, "banners", await record(session, "banners", str(identifier))))

@router.post("", status_code=201, response_model=ApiSuccess[BannerData], operation_id="createBanner",
             summary="Create a banner", description="Requires administrator. JSON body; images must reference completed managed uploads. Unique slugs return 409 on conflict.")
async def create(body: BannerBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=201, data=await save(session, "banners", body))

@router.put("/{identifier}", response_model=ApiSuccess[BannerData], operation_id="replaceBanner",
            summary="Replace a banner", description="Requires administrator. Full replacement including ordered images and options. Previous images remain intact if validation or saving fails.")
async def update(identifier: UUID, body: BannerBody, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await save(session, "banners", body, str(identifier)))

@router.delete("/{identifier}", response_model=ApiSuccess[Deleted], operation_id="deleteBanner",
               summary="Delete a banner", description="Requires administrator. Referenced categories return 409. Detached images are retained for cleanup after 24 hours.")
async def destroy(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await remove(session, "banners", str(identifier)))

