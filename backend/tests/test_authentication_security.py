import asyncio
from datetime import timedelta
from urllib.parse import parse_qs, urlsplit

import pytest
from httpx import ASGITransport, AsyncClient

from app.auth import cookies
from app.core.errors import AppError
from app.main import app
from app.models.auth_session import AuthSession, OAuthTransaction
from app.services import auth_credentials, neon_auth
from test_authentication_contract import auth_client, auth_settings, csrf_headers
from test_authentication_db import auth_db, login


@pytest.mark.asyncio
@pytest.mark.parametrize("endpoint", ["email-verification/confirm", "password-reset/confirm"])
async def test_expired_and_replayed_codes_are_rejected(auth_client, monkeypatch, endpoint):
    async def provider(*args, **kwargs):
        raise neon_auth.provider_error(400, {"code": "OTP_HAS_EXPIRED"})
    monkeypatch.setattr(neon_auth, "call", provider)
    payload = {"email": "customer@example.com", "code": "012345"}
    if endpoint.startswith("password"):
        payload["password"] = "New-secret-password-42"
    response = await auth_client.post("/v1/auth/" + endpoint, json=payload, headers=await csrf_headers(auth_client))
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "CODE_EXPIRED"


def test_secure_cookie_policy_and_csrf_integrity(auth_settings):
    from starlette.requests import Request
    from starlette.responses import Response
    auth_settings.app_env = "production"
    response = Response()
    cookies.set_cookie(response, cookies.SESSION_COOKIE, "opaque", 60)
    assert "Secure" in response.headers["set-cookie"]
    assert "Domain=" not in response.headers["set-cookie"]
    request = Request({"type": "http", "headers": [(b"cookie", b"fmluxe_csrf=forged"), (b"x-csrf-token", b"forged")]})
    with pytest.raises(AppError) as error:
        cookies.validate_csrf(request)
    assert error.value.status_code == 403


def test_google_accepts_only_provider_bootstrap_or_google(auth_settings):
    from app.auth.oauth import valid_authorization_url
    assert valid_authorization_url("https://provider.invalid/auth/sign-in/social/init?token=example")
    assert valid_authorization_url("https://accounts.google.com/o/oauth2/v2/auth?example=1")
    assert not valid_authorization_url("https://evil.invalid/auth/sign-in/social/init?token=example")
    assert not valid_authorization_url("https://provider.invalid/arbitrary-endpoint")
    assert not valid_authorization_url("https://provider.invalid@evil.invalid/auth/sign-in/social/init")


def test_logout_revokes_local_session_during_provider_outage(auth_db, monkeypatch):
    harness, state = auth_db
    original = neon_auth.call

    async def provider(path, **kwargs):
        if path == "sign-out":
            raise AppError(code="AUTH_UNAVAILABLE", message="Unavailable", status_code=503)
        return await original(path, **kwargs)
    monkeypatch.setattr(neon_auth, "call", provider)

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await login(client)
            token_hash = cookies.digest(client.cookies[cookies.SESSION_COOKIE])
            result = await client.post("/v1/auth/logout", headers=await csrf_headers(client))
            assert result.json()["data"] == {"logged_out": True, "provider_revoked": False}
            async with harness.factory() as db:
                assert await db.get(AuthSession, token_hash) is None
    harness.run(scenario())


def test_reset_revokes_all_backend_sessions(auth_db, monkeypatch):
    harness, state = auth_db

    async def subject(db, email):
        return harness.customer.id
    monkeypatch.setattr(auth_credentials, "subject_for_email", subject)

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as a:
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as b:
                await login(a)
                await login(b)
                result = await a.post("/v1/auth/password-reset/confirm", headers=await csrf_headers(a),
                    json={"email": "checkout@example.invalid", "code": "012345", "password": "New-secret-password-42"})
                assert result.status_code == 200
                assert (await a.get("/v1/auth/session")).status_code == 401
                assert (await b.get("/v1/auth/session")).status_code == 401
    harness.run(scenario())


@pytest.mark.parametrize("failure", ["missing_binding", "expired", "cancelled"])
def test_google_transaction_failures(auth_db, failure):
    harness, state = auth_db

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            assert (await client.post("/v1/auth/google/start", headers=await csrf_headers(client))).status_code == 200
            callback_state = parse_qs(urlsplit(state["callback"]).query)["state"][0]
            if failure == "missing_binding":
                client.cookies.clear()
            if failure == "expired":
                async with harness.factory() as db:
                    record = await db.get(OAuthTransaction, cookies.digest(client.cookies[cookies.OAUTH_COOKIE]))
                    record.expires_at = cookies.now() - timedelta(seconds=1)
                    await db.commit()
            params = {"state": callback_state, "neon_auth_session_verifier": "verifier"}
            if failure == "cancelled":
                params = {"state": callback_state, "error": "private-provider-message"}
            result = await client.get("/v1/auth/google/callback", params=params)
            assert result.status_code == 400
            assert "private-provider-message" not in result.text
    harness.run(scenario())


def test_google_callbacks_claim_transaction_once_concurrently(auth_db):
    harness, state = auth_db

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await client.post("/v1/auth/google/start", headers=await csrf_headers(client))
            callback_state = parse_qs(urlsplit(state["callback"]).query)["state"][0]
            params = {"state": callback_state, "neon_auth_session_verifier": "verifier"}
            results = await asyncio.gather(*(client.get("/v1/auth/google/callback", params=params) for _ in range(2)))
            assert sorted(response.status_code for response in results) == [303, 400]
    harness.run(scenario())
