"""Opt-in tests use the existing disposable PostgreSQL schema harness."""
import secrets
from datetime import timedelta

import pytest
from cryptography.fernet import Fernet
from httpx import ASGITransport, AsyncClient

from app.auth import cookies
from app.auth.cookies import now
from app.core.config import get_settings
from app.db import session as database
from app.db.session import get_db_session
from app.main import app
from app.models.auth_session import AuthSession, OAuthTransaction
from app.services import identity, neon_auth
from test_authentication_contract import csrf_headers


@pytest.fixture
def auth_db(commerce_database, monkeypatch):
    harness = commerce_database
    settings = get_settings()
    monkeypatch.setattr(settings, "auth_session_encryption_key", Fernet.generate_key().decode())
    monkeypatch.setattr(settings, "auth_frontend_url", "http://test")
    monkeypatch.setattr(settings, "auth_public_api_url", "http://test")
    monkeypatch.setattr(settings, "auth_success_path", "/")
    monkeypatch.setattr(settings, "app_env", "test")
    monkeypatch.setattr(database, "get_session_factory", lambda: harness.factory)
    user = {"id": harness.customer.id, "email": harness.customer.email, "name": "QA", "emailVerified": True}
    state = {"valid": True, "subject": user["id"], "calls": []}

    async def provider(path, *, body=None, cookies=None, query=None):
        state["calls"].append((path, body, query))
        if path == "sign-in/email" and body["password"] != "Example-secret-42":
            raise neon_auth.provider_error(401, {"code": "INVALID_EMAIL_OR_PASSWORD"})
        if path == "sign-in/social":
            state["callback"] = body["callbackURL"]
            return neon_auth.ProviderResult({"url": "https://accounts.google.com/o/oauth2/v2/auth?fixture=1"},
                {"__Secure-neon-auth.session_challenge": "fixture-challenge"})
        if path == "get-session" and not state["valid"]:
            return neon_auth.ProviderResult(None, {})
        return neon_auth.ProviderResult({"user": {**user, "id": state["subject"]},
            "session": {"expiresAt": (now() + timedelta(hours=1)).isoformat()}},
            {"__Secure-neon-auth.session_token": "provider-secret"})

    async def verified(db, subject):
        return {"id": subject, "email": user["email"], "name": "QA", "emailVerified": True}

    async def db_dependency():
        async with harness.factory() as db:
            yield db
    monkeypatch.setattr(neon_auth, "call", provider)
    monkeypatch.setattr(identity, "verified_identity", verified)
    app.dependency_overrides[get_db_session] = db_dependency
    try:
        yield harness, state
    finally:
        app.dependency_overrides.clear()


async def login(client):
    response = await client.post("/v1/auth/login", headers=await csrf_headers(client),
        json={"email": "checkout@example.invalid", "password": "Example-secret-42"})
    assert response.status_code == 200, response.text
    return response


def test_login_restore_permissions_logout_and_rotation(auth_db):
    harness, state = auth_db

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            first = await login(client)
            raw = client.cookies[cookies.SESSION_COOKIE]
            assert "HttpOnly" in first.headers["set-cookie"] and "SameSite=lax" in first.headers["set-cookie"]
            restored = (await client.get("/v1/auth/session")).json()["data"]
            assert restored["profile"]["role"] == "customer"
            assert restored["expires_at"] == first.json()["data"]["expires_at"]
            assert (await client.get("/v1/auth/me")).status_code == 200
            assert (await client.get("/v1/admin/auth-check")).status_code == 403
            assert (await client.get("/v1/auth/me", headers={"Authorization": "Bearer invalid"})).status_code == 401
            assert (await client.get("/v1/auth/session", headers={"Authorization": "Bearer invalid"})).status_code == 401
            assert (await client.post("/v1/auth/bootstrap", json={})).status_code == 403
            assert (await client.post("/v1/auth/bootstrap", json={}, headers=await csrf_headers(client))).status_code == 200
            await login(client)
            assert client.cookies[cookies.SESSION_COOKIE] != raw
            async with harness.factory() as db:
                assert await db.get(AuthSession, cookies.digest(raw)) is None
                current = await db.get(AuthSession, cookies.digest(client.cookies[cookies.SESSION_COOKIE]))
                assert "provider-secret" not in current.provider_credentials
            response = await client.post("/v1/auth/logout", headers=await csrf_headers(client))
            assert response.json()["data"]["logged_out"]
            assert (await client.get("/v1/auth/session")).status_code == 401
            assert (await client.get("/v1/auth/me")).status_code == 401
    harness.run(scenario())


@pytest.mark.parametrize("reason", ["expired", "provider_revoked", "wrong_subject"])
def test_invalid_sessions_fail_closed(auth_db, reason):
    harness, state = auth_db

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            await login(client)
            if reason == "expired":
                async with harness.factory() as db:
                    record = await db.get(AuthSession, cookies.digest(client.cookies[cookies.SESSION_COOKIE]))
                    record.expires_at = cookies.now() - timedelta(seconds=1)
                    await db.commit()
            elif reason == "provider_revoked":
                state["valid"] = False
            else:
                state["subject"] = "another-customer"
            assert (await client.get("/v1/auth/session")).status_code == 401
    harness.run(scenario())


def test_google_exchange_binding_and_callback_replay(auth_db):
    from urllib.parse import parse_qs, urlsplit
    harness, state = auth_db

    async def scenario():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=False) as client:
            start = await client.post("/v1/auth/google/start", headers=await csrf_headers(client))
            assert start.status_code == 200, start.text
            binding = client.cookies[cookies.OAUTH_COOKIE]
            callback_state = parse_qs(urlsplit(state["callback"]).query)["state"][0]
            path = "/v1/auth/google/callback"
            assert (await client.get(path, params={"state": secrets.token_urlsafe(32), "neon_auth_session_verifier": "verifier"})).status_code == 400
            params = {"state": callback_state, "neon_auth_session_verifier": "verifier"}
            response = await client.get(path, params=params)
            assert response.status_code == 303, response.text
            assert response.headers["location"] == "http://test/"
            assert state["calls"][-1][2] == {"neon_auth_session_verifier": "verifier"}
            client.cookies.set(cookies.OAUTH_COOKIE, binding)
            assert (await client.get(path, params=params)).status_code == 400
            assert (await client.get("/v1/auth/session")).status_code == 200
    harness.run(scenario())
