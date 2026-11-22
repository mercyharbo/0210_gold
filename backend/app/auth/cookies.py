import hashlib
import json
import secrets
from datetime import datetime, timezone

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Request, Response

from app.core.config import get_settings
from app.core.errors import AppError

SESSION_COOKIE = "fmluxe_session"
CSRF_COOKIE = "fmluxe_csrf"
OAUTH_COOKIE = "fmluxe_oauth"


def now() -> datetime:
    return datetime.now(timezone.utc)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def cipher() -> Fernet:
    try:
        return Fernet((get_settings().auth_session_encryption_key or "").encode())
    except (ValueError, TypeError) as exc:
        raise AppError(code="AUTH_NOT_CONFIGURED", message="Session encryption is not configured.", status_code=503) from exc


def encrypt(values: dict) -> str:
    return cipher().encrypt(json.dumps(values).encode()).decode()


def decrypt(value: str, *, ttl: int | None = None) -> dict:
    try:
        data = json.loads(cipher().decrypt(value.encode(), ttl=ttl))
        if isinstance(data, dict):
            return data
    except (InvalidToken, ValueError, UnicodeError):
        pass
    raise AppError(code="INVALID_SESSION", message="Your session is invalid or expired. Sign in again.", status_code=401)


def set_cookie(response: Response, name: str, value: str, max_age: int):
    response.set_cookie(name, value, max_age=max_age, httponly=True,
                        secure=get_settings().auth_secure_cookies, samesite="lax", path="/")
    response.headers["Cache-Control"] = "no-store"


def clear_cookie(response: Response, name: str):
    response.delete_cookie(name, path="/", secure=get_settings().auth_secure_cookies,
                           httponly=True, samesite="lax")


def validate_origin(request: Request):
    origin = request.headers.get("origin")
    allowed = {*get_settings().cors_origin_list, get_settings().auth_frontend_url.rstrip('/'),
               get_settings().auth_public_api_url.rstrip('/')}
    if (origin and origin not in allowed) or request.headers.get("sec-fetch-site") == "cross-site":
        raise AppError(code="CSRF_REJECTED", message="This request origin is not allowed.", status_code=403)


def csrf_token(request: Request, response: Response) -> str:
    validate_origin(request)
    token = encrypt({"nonce": secrets.token_urlsafe(32), "binding": digest(request.cookies.get(SESSION_COOKIE, ""))})
    set_cookie(response, CSRF_COOKIE, token, 3600)
    return token


def validate_csrf(request: Request):
    validate_origin(request)
    cookie = request.cookies.get(CSRF_COOKIE, "")
    header = request.headers.get("x-csrf-token", "")
    if cookie and header and secrets.compare_digest(cookie, header):
        try:
            payload = decrypt(cookie, ttl=3600)
            if payload.get("binding") == digest(request.cookies.get(SESSION_COOKIE, "")):
                return
        except AppError as exc:
            if exc.status_code == 503:
                raise
    raise AppError(code="CSRF_REJECTED", message="Fetch a CSRF token and send it with this request.", status_code=403)
