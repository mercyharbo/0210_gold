from typing import Literal
from pydantic import Field
from app.schemas.catalog import CatalogBody


class UploadBody(CatalogBody):
    kind: Literal["product", "category", "banner"]
    content_type: Literal["image/jpeg", "image/png", "image/webp", "image/avif"]
    size: int = Field(gt=0, le=8 * 1024 * 1024, description="Exact file length in bytes; product/category maximum is 5 MiB.")


class UploadData(CatalogBody):
    media_id: str
    upload_url: str = Field(description="Presigned PUT URL, valid for 5 minutes. Never persist or log this URL.")
    headers: dict[str, str]
    expires_in: int = 300


class MediaData(CatalogBody):
    media_id: str
    url: str


class CleanupData(CatalogBody):
    deleted: int
