from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.catalog_docs import ERRORS
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.catalog import Deleted
from app.schemas.envelope import ApiSuccess
from app.schemas.media import CleanupData, MediaData, UploadBody, UploadData
from app.services.identity import require_admin
from app.services.media import begin_upload, cleanup, complete_upload, delete_media

router = APIRouter(prefix="/admin/media", tags=["admin media"], responses=ERRORS)


@router.post("/uploads", status_code=201, response_model=ApiSuccess[UploadData], operation_id="authorizeImageUpload",
             summary="Authorize an image upload", description="Administrator only. Returns a 5-minute presigned PUT URL. Upload the raw file directly with the returned Content-Type header and exact declared byte length. Up to 5 MiB for product/category or 8 MiB for banners; JPEG/PNG/WebP/AVIF only. Completion is required before attaching.")
async def upload(body: UploadBody, admin: Profile = Depends(require_admin), session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=201, data=await begin_upload(session, admin.id, body))


@router.post("/{identifier}/complete", response_model=ApiSuccess[MediaData], operation_id="completeImageUpload",
             dependencies=[Depends(require_admin)], summary="Validate and finalize an upload",
             description="Administrator only. No body. Validates object size, content type and file signature; copies to an immutable public key. Idempotent retries return the existing final image. Invalid files cannot be attached.")
async def complete(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await complete_upload(session, str(identifier)))


@router.delete("/{identifier}", response_model=ApiSuccess[Deleted], operation_id="deleteManagedImage",
               dependencies=[Depends(require_admin)], summary="Delete an unused managed image",
               description="Administrator only. Cannot delete an image still referenced by any catalog record (409). Accepts managed media IDs, never arbitrary URLs or keys.")
async def delete(identifier: UUID, session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await delete_media(session, str(identifier)))


@router.post("/cleanup", response_model=ApiSuccess[CleanupData], operation_id="cleanupUnusedImages",
             dependencies=[Depends(require_admin)], summary="Clean abandoned images",
             description="Administrator only. No body. Deletes at most 100 managed uploads older than 24 hours with no catalog references; safe to repeat. Does not delete referenced images.")
async def clean(session: AsyncSession = Depends(get_db_session)):
    return ApiSuccess(status=200, data=await cleanup(session))
