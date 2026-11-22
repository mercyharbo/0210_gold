import secrets
from datetime import datetime, timedelta

from fastapi import Request, Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.cookies import SESSION_COOKIE, clear_cookie, decrypt, digest, encrypt, now, set_cookie
from app.core.config import get_settings
from app.core.errors import AppError
from app.models.auth_session import AuthSession, OAuthTransaction
from app.models.profile import Profile
from app.schemas.auth import BootstrapBody
from app.services import neon_auth
from app.services.identity import bootstrap_profile


async def cleanup(db: AsyncSession):
    await db.execute(delete(AuthSession).where(AuthSession.expires_at <= now()))
    await db.execute(delete(OAuthTransaction).where(OAuthTransaction.expires_at <= now()))


async def establish(request: Request, response: Response, db: AsyncSession,
                    result: neon_auth.ProviderResult) -> tuple[neon_auth.ProviderIdentity, Profile | None, datetime]:
    user, provider_expiry = neon_auth.identity(result)
    expiry = min(provider_expiry, now() + timedelta(seconds=get_settings().auth_session_max_age))
    if expiry <= now() or not result.cookies.get("__Secure-neon-auth.session_token"):
        raise AppError(code="INVALID_SESSION", message="No valid authentication session was returned.", status_code=401)
    await cleanup(db)
    old = request.cookies.get(SESSION_COOKIE)
    if old:
        await db.execute(delete(AuthSession).where(AuthSession.token_hash == digest(old)))
    raw = secrets.token_urlsafe(32)
    db.add(AuthSession(token_hash=digest(raw), subject=user.id,
                       provider_credentials=encrypt(result.cookies), expires_at=expiry))
    await db.commit()
    profile = await bootstrap_profile(db, user.id, BootstrapBody()) if user.emailVerified else None
    set_cookie(response, SESSION_COOKIE, raw, max(1, int((expiry - now()).total_seconds())))
    return user, profile, expiry


async def resolve(request: Request, db: AsyncSession) -> tuple[AuthSession, neon_auth.ProviderIdentity]:
    cached = getattr(request.state, "backend_auth", None)
    if cached:
        return cached
    raw = request.cookies.get(SESSION_COOKIE)
    record = await db.get(AuthSession, digest(raw)) if raw else None
    if not record or record.expires_at <= now():
        raise AppError(code="UNAUTHENTICATED", message="Sign in to continue.", status_code=401)
    try:
        result = await neon_auth.call("get-session", cookies=decrypt(record.provider_credentials))
        user, provider_expiry = neon_auth.identity(result)
        if user.id != record.subject or provider_expiry <= now():
            raise AppError(code="INVALID_SESSION", message="Your session is invalid or expired.", status_code=401)
    except AppError as exc:
        if exc.status_code in {401, 403}:
            await db.delete(record)
            await db.commit()
        raise
    # Never extend the absolute backend expiry, even when Neon renews its session.
    record.expires_at = min(record.expires_at, provider_expiry)
    record.provider_credentials = encrypt(result.cookies)
    await db.commit()
    request.state.backend_auth = (record, user)
    return record, user


async def logout(request: Request, response: Response, db: AsyncSession) -> bool:
    raw = request.cookies.get(SESSION_COOKIE)
    record = await db.get(AuthSession, digest(raw)) if raw else None
    provider_revoked = True
    if record:
        credentials = decrypt(record.provider_credentials)
        await db.delete(record)
        await db.commit()  # Local logout is effective even if Neon is temporarily offline.
        try:
            await neon_auth.call("sign-out", body={}, cookies=credentials)
        except AppError:
            provider_revoked = False
    clear_cookie(response, SESSION_COOKIE)
    return provider_revoked
