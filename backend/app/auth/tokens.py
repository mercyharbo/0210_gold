import asyncio
from functools import lru_cache
from urllib.parse import urlsplit

import jwt
from fastapi import Request, Security
from fastapi.security import APIKeyCookie, HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import AppError

bearer = HTTPBearer(auto_error=False, description="Neon Auth EdDSA access token (15-minute lifetime).")
session_cookie = APIKeyCookie(name="fmluxe_session", auto_error=False, scheme_name="BackendSession",
    description="HttpOnly cookie set by POST /v1/auth/login or Google callback. Cookie mutations also require X-CSRF-Token.")


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
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Security(bearer),
    cookie: str | None = Security(session_cookie),
) -> str:
    # An explicitly supplied Authorization header takes precedence, including malformed headers.
    if request.headers.get("authorization") is None and cookie:
        from app.auth.cookies import validate_csrf
        from app.auth.sessions import resolve
        from app.db.session import get_session_factory
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            validate_csrf(request)
        async with get_session_factory()() as db:
            record, _ = await resolve(request, db)
            return record.subject
    if not credentials or credentials.scheme.lower() != "bearer":
        raise AppError(code="UNAUTHENTICATED", message="Sign in to continue.", status_code=401)
    claims = await asyncio.to_thread(verify_token, credentials.credentials)
    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject:
        raise AppError(code="INVALID_TOKEN", message="The session has no valid identity.", status_code=401)
    return subject
