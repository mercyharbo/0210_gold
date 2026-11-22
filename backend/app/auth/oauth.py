import secrets
from datetime import timedelta
from urllib.parse import urlencode, urlsplit

from fastapi import Request, Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.cookies import OAUTH_COOKIE, clear_cookie, decrypt, digest, encrypt, now, set_cookie
from app.auth.sessions import cleanup, establish
from app.core.config import get_settings
from app.core.errors import AppError
from app.models.auth_session import OAuthTransaction
from app.services import neon_auth


def frontend_destination() -> str:
    settings = get_settings()
    path = settings.auth_success_path
    if not path.startswith("/") or path.startswith("//") or "\\" in path or "?" in path or "#" in path:
        raise AppError(code="AUTH_NOT_CONFIGURED", message="Invalid authentication return path.", status_code=503)
    return settings.auth_frontend_url.rstrip("/") + path


def valid_authorization_url(url: object) -> bool:
    if not isinstance(url, str):
        return False
    parsed = urlsplit(url)
    if parsed.scheme != "https" or parsed.username or parsed.password or parsed.fragment:
        return False
    if parsed.netloc == "accounts.google.com" and parsed.path.startswith("/o/oauth2/"):
        return True
    provider = urlsplit(get_settings().neon_auth_base_url or "")
    # Neon first sets its own state cookies in the browser, then redirects to Google.
    return parsed.netloc == provider.netloc and parsed.path == provider.path.rstrip("/") + "/sign-in/social/init"


async def start(request: Request, response: Response, db: AsyncSession) -> str:
    settings = get_settings()
    frontend_destination()
    binding, state = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
    callback = settings.auth_public_api_url.rstrip("/") + settings.api_v1_prefix + "/auth/google/callback"
    callback += "?" + urlencode({"state": state})
    result = await neon_auth.call("sign-in/social", body={"provider": "google", "callbackURL": callback,
                                                          "errorCallbackURL": callback, "disableRedirect": True})
    url = (result.data or {}).get("url")
    if not valid_authorization_url(url):
        raise AppError(code="AUTH_UNAVAILABLE", message="Google authentication is unavailable.", status_code=503)
    challenges = {"__Secure-neon-auth.session_challenge", "__Secure-neon-auth.session_challange"}
    if not challenges.intersection(result.cookies):
        raise AppError(code="AUTH_UNAVAILABLE", message="Google session challenge was not returned.", status_code=503)
    await cleanup(db)
    old = request.cookies.get(OAUTH_COOKIE)
    if old:
        await db.execute(delete(OAuthTransaction).where(OAuthTransaction.token_hash == digest(old)))
    db.add(OAuthTransaction(token_hash=digest(binding), state_hash=digest(state),
                           provider_credentials=encrypt(result.cookies), expires_at=now() + timedelta(minutes=10)))
    await db.commit()
    set_cookie(response, OAUTH_COOKIE, binding, 600)
    return url


async def complete(request: Request, response: Response, db: AsyncSession, state: str,
                   verifier: str | None, error: str | None):
    raw = request.cookies.get(OAUTH_COOKIE, "")
    # DELETE RETURNING claims the transaction atomically; even failed callbacks cannot replay it.
    record = (await db.execute(delete(OAuthTransaction).where(
        OAuthTransaction.token_hash == digest(raw), OAuthTransaction.state_hash == digest(state),
        OAuthTransaction.expires_at > now()).returning(OAuthTransaction))).scalar_one_or_none()
    await db.commit()
    if not raw or not record:
        raise AppError(code="INVALID_OAUTH_STATE", message="Google login expired or was already used. Start again.", status_code=400)
    if error or not verifier:
        raise AppError(code="GOOGLE_LOGIN_FAILED", message="Google sign-in was cancelled or could not be completed.", status_code=400)
    result = await neon_auth.call("get-session", cookies=decrypt(record.provider_credentials),
                                  query={"neon_auth_session_verifier": verifier})
    user, _ = neon_auth.identity(result)
    if not user.emailVerified:
        raise AppError(code="EMAIL_NOT_VERIFIED", message="Verify your email before continuing.", status_code=403)
    await establish(request, response, db, result)
    clear_cookie(response, OAUTH_COOKIE)
