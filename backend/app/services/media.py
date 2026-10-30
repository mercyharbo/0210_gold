from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.media import Media, MediaLink
from app.schemas.media import UploadBody
from app.services.catalog import fail
from app.services.storage import is_image, public_url, storage_call


def pending_key(media: Media):
    return f"pending/{media.object_key}"


async def begin_upload(session: AsyncSession, owner_id: str, body: UploadBody):
    limit = (8 if body.kind == "banner" else 5) * 1024 * 1024
    if body.size > limit:
        fail("IMAGE_TOO_LARGE", f"Choose an image smaller than {limit // 1024 // 1024} MB.", field="size")
    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif"}[body.content_type]
    media = Media(id=str(uuid4()), object_key=f"{body.kind}/{uuid4()}.{extension}", kind=body.kind,
                  owner_id=owner_id, size=body.size, content_type=body.content_type, complete=False)
    params = {"Bucket": get_settings().catalog_bucket, "Key": pending_key(media),
              "ContentType": body.content_type, "ContentLength": body.size}
    url = await storage_call("generate_presigned_url", ClientMethod="put_object", Params=params, ExpiresIn=300)
    session.add(media)
    await session.commit()
    return {"media_id": media.id, "upload_url": url, "headers": {"Content-Type": body.content_type}, "expires_in": 300}


async def complete_upload(session: AsyncSession, identifier: str):
    media = await session.scalar(select(Media).where(Media.id == identifier).with_for_update())
    if not media:
        fail("NOT_FOUND", "Upload was not found.", 404)
    bucket = get_settings().catalog_bucket
    if not media.complete:
        head = await storage_call("head_object", Bucket=bucket, Key=pending_key(media))
        if head["ContentLength"] != media.size or head.get("ContentType") != media.content_type:
            fail("INVALID_IMAGE", "Uploaded file does not match its declared size or type.", field="file")
        response = await storage_call("get_object", Bucket=bucket, Key=pending_key(media), Range="bytes=0-31")
        header = response["Body"].read(32)
        response["Body"].close()
        if not is_image(header, media.content_type):
            fail("INVALID_IMAGE", "The file is not a supported image.", field="file")
        # Copy to an immutable final key. Replaying the temporary PUT cannot alter a published image.
        await storage_call("copy_object", Bucket=bucket, Key=media.object_key,
                           CopySource={"Bucket": bucket, "Key": pending_key(media)},
                           CopySourceIfMatch=head["ETag"], MetadataDirective="REPLACE", ContentType=media.content_type,
                           CacheControl="public, max-age=31536000, immutable")
        media.complete = True
        await session.commit()
        await storage_call("delete_object", Bucket=bucket, Key=pending_key(media))
    return {"media_id": media.id, "url": public_url(media.object_key)}


async def delete_media(session: AsyncSession, identifier: str):
    media = await session.scalar(select(Media).where(Media.id == identifier).with_for_update())
    if not media:
        fail("NOT_FOUND", "Image was not found.", 404)
    if await session.scalar(select(exists().where(MediaLink.media_id == identifier))):
        fail("MEDIA_IN_USE", "Remove this image from its catalog record before deleting it.", 409)
    for key in (media.object_key, pending_key(media)):
        await storage_call("delete_object", Bucket=get_settings().catalog_bucket, Key=key)
    await session.delete(media)
    await session.commit()
    return {"deleted": True}


async def cleanup(session: AsyncSession):
    cutoff = datetime.now(timezone.utc) - timedelta(days=1)
    rows = (await session.scalars(select(Media.id).where(Media.created_at < cutoff,
        ~exists().where(MediaLink.media_id == Media.id)).limit(100))).all()
    deleted = 0
    for identifier in rows:
        await delete_media(session, identifier)
        deleted += 1
    return {"deleted": deleted}
