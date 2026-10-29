import asyncio
from functools import lru_cache
from urllib.parse import urlsplit

import jwt
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import AppError

bearer = HTTPBearer(auto_error=False, description="Neon Auth EdDSA access token (15-minute lifetime).")


@lru_cache
def jwks_client(url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(url, cache_keys=True, lifespan=300, timeout=10)


def verify_token(token: str) -> dict:
    settings = get_settings()
    if not settings.neon_auth_jwks_url or not settings.neon_auth_base_url:
        raise AppError(code="AUTH_NOT_CONFIGURED", message="Authentication is not configured.", status_code=503)
    try:
        auth_url = urlsplit(settings.neon_auth_base_url)
        # Managed Neon JWTs use the branch auth origin, not /<database>/auth.
        issuer = f"{auth_url.scheme}://{auth_url.netloc}"
        key = jwks_client(settings.neon_auth_jwks_url).get_signing_key_from_jwt(token)
        return jwt.decode(
            token, key.key, algorithms=["EdDSA"],
            issuer=issuer, audience=issuer,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
    except jwt.PyJWKClientConnectionError as exc:
        raise AppError(code="AUTH_UNAVAILABLE", message="Authentication is temporarily unavailable.", status_code=503) from exc
    except jwt.PyJWTError as exc:
        raise AppError(code="INVALID_TOKEN", message="Your session is invalid or expired. Sign in again.", status_code=401) from exc


async def require_subject(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer),
) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise AppError(code="UNAUTHENTICATED", message="Sign in to continue.", status_code=401)
    claims = await asyncio.to_thread(verify_token, credentials.credentials)
    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject:
        raise AppError(code="INVALID_TOKEN", message="The session has no valid identity.", status_code=401)
    return subject
