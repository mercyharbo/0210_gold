import asyncio
from functools import lru_cache
from urllib.parse import quote

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import get_settings
from app.core.errors import AppError


def unavailable():
    return AppError(code="STORAGE_UNAVAILABLE", message="Image storage is currently unavailable.", status_code=503)


@lru_cache
def storage_client():
    settings = get_settings()
    if not all((settings.aws_endpoint_url_s3, settings.aws_access_key_id, settings.aws_secret_access_key)):
        raise unavailable()
    return boto3.client("s3", endpoint_url=settings.aws_endpoint_url_s3, region_name=settings.aws_region,
                        aws_access_key_id=settings.aws_access_key_id, aws_secret_access_key=settings.aws_secret_access_key,
                        config=Config(signature_version="s3v4", s3={"addressing_style": "path"},
                                      connect_timeout=10, read_timeout=20, retries={"max_attempts": 2}))


async def storage_call(method: str, **kwargs):
    try:
        return await asyncio.to_thread(getattr(storage_client(), method), **kwargs)
    except (BotoCoreError, ClientError):
        raise unavailable() from None


def public_url(key: str) -> str:
    settings = get_settings()
    return f"{(settings.aws_endpoint_url_s3 or '').rstrip('/')}/{settings.catalog_bucket}/{quote(key, safe='/')}"


def is_image(header: bytes, content_type: str) -> bool:
    return {
        "image/jpeg": header.startswith(b"\xff\xd8\xff"),
        "image/png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
        "image/avif": header[4:8] == b"ftyp" and (b"avif" in header[8:32] or b"avis" in header[8:32]),
    }.get(content_type, False)
