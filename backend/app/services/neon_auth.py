"""Fixed Neon Auth REST operations; never proxy arbitrary paths or caller headers."""
from dataclasses import dataclass
from http.cookies import SimpleCookie

import httpx
from pydantic import BaseModel, ConfigDict, ValidationError
from datetime import datetime

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.logging import get_logger

logger = get_logger(__name__)

ALLOWED = {"sign-up/email", "sign-in/email", "sign-out", "get-session", "sign-in/social",
           "email-otp/send-verification-otp", "email-otp/verify-email", "email-otp/reset-password"}
ERRORS = {
    "INVALID_EMAIL_OR_PASSWORD": (401, "INVALID_CREDENTIALS", "Email or password is incorrect."),
    "EMAIL_NOT_VERIFIED": (403, "EMAIL_NOT_VERIFIED", "Verify your email before signing in."),
    "USER_ALREADY_EXISTS": (409, "ACCOUNT_EXISTS", "An account with these details already exists."),
    "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL": (409, "ACCOUNT_EXISTS", "An account with these details already exists."),
    "INVALID_OTP": (400, "INVALID_CODE", "The code is invalid or has already been used."),
    "OTP_EXPIRED": (400, "CODE_EXPIRED", "The code has expired. Request another code."),
    "OTP_HAS_EXPIRED": (400, "CODE_EXPIRED", "The code has expired. Request another code."),
    "TOO_MANY_ATTEMPTS": (429, "AUTH_RATE_LIMITED", "Too many attempts. Try again later."),
    "USER_NOT_FOUND": (400, "INVALID_CODE", "The code or account is invalid."),
}


class ProviderIdentity(BaseModel):
    model_config = ConfigDict(extra="ignore", strict=True)
    id: str
    email: str
    name: str
    emailVerified: bool


class ProviderSession(BaseModel):
    user: ProviderIdentity
    session: dict


@dataclass
class ProviderResult:
    data: dict | None
    cookies: dict[str, str]


def provider_error(status: int, data: object) -> AppError:
    code = data.get("code") if isinstance(data, dict) else None
    if status == 429:
        values = (429, "AUTH_RATE_LIMITED", "Too many attempts. Try again later.")
    elif status >= 500:
        values = (503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable.")
    else:
        values = ERRORS.get(code, (400, "AUTH_REQUEST_REJECTED", "Authentication request was rejected. Check your details."))
    return AppError(status_code=values[0], code=values[1], message=values[2])


async def call(path: str, *, body: dict | None = None, cookies: dict | None = None,
               query: dict | None = None) -> ProviderResult:
    if path not in ALLOWED:
        raise ValueError("Unsupported authentication operation")
    settings = get_settings()
    base = settings.neon_auth_base_url
    if not base:
        raise AppError(code="AUTH_NOT_CONFIGURED", message="Authentication is not configured.", status_code=503)
    headers = {"Origin": settings.auth_frontend_url.rstrip('/'), "x-neon-auth-middleware": "true",
               "x-neon-auth-proxy": "fastapi"}
    if cookies:
        headers["Cookie"] = "; ".join(f"{key}={value}" for key, value in cookies.items())
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20, connect=5), follow_redirects=False) as client:
            response = await client.request("GET" if body is None else "POST", f"{base.rstrip('/')}/{path}",
                                            headers=headers, json=body, params=query)
    except httpx.RequestError as exc:
        logger.warning("Authentication transport unavailable: %s", type(exc).__name__)
        raise AppError(code="AUTH_UNAVAILABLE", message="Authentication is temporarily unavailable.", status_code=503) from exc
    try:
        data = response.json()
    except ValueError:
        data = None
    if not response.is_success:
        if response.status_code >= 500:
            logger.warning("Authentication provider unavailable: HTTP %s", response.status_code)
        raise provider_error(response.status_code, data)
    if not isinstance(data, dict) and not (data is None and path == "get-session"):
        raise AppError(code="AUTH_UNAVAILABLE", message="Invalid authentication service response.", status_code=503)
    jar = dict(cookies or {})
    for raw in response.headers.get_list("set-cookie"):
        parsed = SimpleCookie()
        # Python 3.12's SimpleCookie rejects the entire header for CHIPS' Partitioned flag.
        # Provider cookies remain server-side; we need their values, not browser attributes.
        parsed.load(";".join(part for part in raw.split(";") if part.strip().lower() != "partitioned"))
        for key, morsel in parsed.items():
            if key.startswith("__Secure-neon-auth."):
                if morsel["max-age"] == "0" or not morsel.value:
                    jar.pop(key, None)
                else:
                    jar[key] = morsel.value
    return ProviderResult(data, jar)


def identity(result: ProviderResult) -> tuple[ProviderIdentity, datetime]:
    try:
        parsed = ProviderSession.model_validate(result.data)
        expiry = datetime.fromisoformat(parsed.session["expiresAt"].replace("Z", "+00:00"))
        if not expiry.tzinfo:
            raise ValueError("Missing timezone")
        return parsed.user, expiry
    except (ValidationError, KeyError, TypeError, ValueError, AttributeError) as exc:
        raise AppError(code="INVALID_SESSION", message="Your session is invalid or expired. Sign in again.", status_code=401) from exc
