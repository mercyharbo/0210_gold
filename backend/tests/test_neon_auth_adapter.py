from datetime import timedelta

import httpx
import pytest

from app.auth.cookies import now
from app.core.errors import AppError
from app.services import neon_auth
from test_authentication_contract import auth_settings


@pytest.mark.asyncio
async def test_neon_wire_protocol_and_separate_cookie_headers(auth_settings, monkeypatch):
    original = httpx.AsyncClient

    def handler(request):
        assert request.method == "GET"
        assert request.url.path == "/auth/get-session"
        assert request.url.params["neon_auth_session_verifier"] == "single-use-verifier"
        assert request.headers["x-neon-auth-middleware"] == "true"
        assert request.headers["x-neon-auth-proxy"] == "fastapi"
        assert request.headers["origin"] == "http://test"
        assert request.headers["cookie"] == "__Secure-neon-auth.session_challenge=challenge"
        return httpx.Response(200, json={"user": {"id": "subject", "email": "ada@example.com", "name": "Ada", "emailVerified": True},
            "session": {"expiresAt": (now() + timedelta(hours=1)).isoformat()}}, headers=[
            ("set-cookie", "__Secure-neon-auth.session_token=opaque-session; Path=/; HttpOnly; Secure; Partitioned"),
            ("set-cookie", "__Secure-neon-auth.session_challenge=; Max-Age=0; Path=/"),
            ("set-cookie", "unrelated=ignored; Path=/")])

    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs))
    result = await neon_auth.call("get-session", cookies={"__Secure-neon-auth.session_challenge": "challenge"},
                                 query={"neon_auth_session_verifier": "single-use-verifier"})
    assert result.cookies == {"__Secure-neon-auth.session_token": "opaque-session"}
    assert neon_auth.identity(result)[0].id == "subject"


@pytest.mark.asyncio
@pytest.mark.parametrize("status,body,code", [
    (401, {"code": "INVALID_EMAIL_OR_PASSWORD"}, "INVALID_CREDENTIALS"),
    (400, {"code": "OTP_HAS_EXPIRED"}, "CODE_EXPIRED"),
    (400, {"code": "INVALID_OTP"}, "INVALID_CODE"),
    (429, {"message": "sensitive upstream detail"}, "AUTH_RATE_LIMITED"),
    (503, {"message": "sensitive upstream detail"}, "AUTH_UNAVAILABLE"),
    (200, ["unexpected"], "AUTH_UNAVAILABLE"),
])
async def test_provider_failures_are_safe(auth_settings, monkeypatch, status, body, code):
    original = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original(
        transport=httpx.MockTransport(lambda request: httpx.Response(status, json=body)), **kwargs))
    with pytest.raises(AppError) as error:
        await neon_auth.call("sign-in/email", body={"email": "ada@example.com", "password": "private"})
    assert error.value.code == code
    assert "sensitive" not in error.value.message


@pytest.mark.asyncio
async def test_provider_timeout_maps_to_unavailable(auth_settings, monkeypatch):
    original = httpx.AsyncClient

    def handler(request):
        raise httpx.ReadTimeout("private provider URL", request=request)
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs))
    with pytest.raises(AppError) as error:
        await neon_auth.call("get-session")
    assert error.value.status_code == 503
    assert "private" not in error.value.message


@pytest.mark.parametrize("data", [None, {}, {"user": {}, "session": {}},
    {"user": {"id": "subject", "email": "ada@example.com", "name": "Ada", "emailVerified": "false"}, "session": {}}])
def test_invalid_provider_session_cannot_authenticate(data):
    with pytest.raises(AppError):
        neon_auth.identity(neon_auth.ProviderResult(data, {}))


@pytest.mark.asyncio
async def test_native_neon_uuid_is_normalized_to_application_subject():
    from uuid import UUID
    from app.services.auth_credentials import subject_for_email

    class Database:
        async def scalar(self, statement, parameters):
            return UUID("00000000-0000-4000-8000-000000000001")
    assert await subject_for_email(Database(), "ada@example.com") == "00000000-0000-4000-8000-000000000001"
