import logging
import pytest
from cryptography.fernet import Fernet
from httpx import ASGITransport, AsyncClient

from app.auth.cookies import SESSION_COOKIE, decrypt, encrypt
from app.core.config import get_settings
from app.core.errors import AppError
from app.core.logging import RedactAuthQuery
from app.main import app
from app.services import neon_auth


@pytest.fixture
def auth_settings(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "auth_session_encryption_key", Fernet.generate_key().decode())
    monkeypatch.setattr(settings, "auth_frontend_url", "http://test")
    monkeypatch.setattr(settings, "auth_public_api_url", "http://test")
    monkeypatch.setattr(settings, "app_env", "test")
    monkeypatch.setattr(settings, "neon_auth_base_url", "https://provider.invalid/auth")
    return settings


@pytest.fixture
async def auth_client(auth_settings):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


async def csrf_headers(client):
    response = await client.get("/v1/auth/csrf")
    assert response.status_code == 200
    return {"X-CSRF-Token": response.json()["data"]["csrf_token"], "Origin": "http://test"}


@pytest.mark.asyncio
async def test_csrf_is_bound_to_cookie_and_session(auth_client, monkeypatch):
    async def provider(path, **kwargs):
        return neon_auth.ProviderResult({"success": True}, {})
    monkeypatch.setattr(neon_auth, "call", provider)
    path = "/v1/auth/password-reset/request"
    body = {"email": "customer@example.com"}
    assert (await auth_client.post(path, json=body)).status_code == 403
    headers = await csrf_headers(auth_client)
    response = await auth_client.post(path, json=body, headers=headers)
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert (await auth_client.post(path, json=body, headers={**headers, "Origin": "https://evil.invalid"})).status_code == 403
    auth_client.cookies.set(SESSION_COOKIE, "changed-session")
    assert (await auth_client.post(path, json=body, headers=headers)).status_code == 403


@pytest.mark.asyncio
async def test_payload_errors_are_inline_without_password_echo(auth_client):
    headers = await csrf_headers(auth_client)
    response = await auth_client.post("/v1/auth/signup", headers=headers,
        json={"name": " ", "email": "bad-email", "password": "secret", "role": "super_admin"})
    assert response.status_code == 422
    fields = response.json()["error"]["fieldErrors"]
    assert {"name", "email", "password", "role"} <= fields.keys()
    assert '"secret"' not in response.text


@pytest.mark.asyncio
@pytest.mark.parametrize("endpoint,payload,provider_path,provider_body", [
    ("signup", {"name": "Ada", "email": "ada@example.com", "password": "Example-secret-42"},
     "sign-up/email", {"name": "Ada", "email": "ada@example.com", "password": "Example-secret-42"}),
    ("email-verification/confirm", {"email": "ada@example.com", "code": "012345"},
     "email-otp/verify-email", {"email": "ada@example.com", "otp": "012345"}),
])
async def test_public_auth_contract(auth_client, monkeypatch, endpoint, payload, provider_path, provider_body):
    async def provider(path, **kwargs):
        assert path == provider_path and kwargs["body"] == provider_body
        return neon_auth.ProviderResult({"success": True}, {})
    monkeypatch.setattr(neon_auth, "call", provider)
    response = await auth_client.post(f"/v1/auth/{endpoint}", json=payload, headers=await csrf_headers(auth_client))
    assert response.status_code == 200
    assert response.json()["data"]["accepted"] is True
    assert SESSION_COOKIE not in response.cookies


@pytest.mark.asyncio
@pytest.mark.parametrize("code,status", [("INVALID_CODE", 200), ("AUTH_RATE_LIMITED", 429), ("AUTH_UNAVAILABLE", 503)])
async def test_reset_request_privacy_and_provider_failures(auth_client, monkeypatch, code, status):
    async def provider(*args, **kwargs):
        raise AppError(code=code, message="Safe provider failure", status_code=status if status != 200 else 400)
    monkeypatch.setattr(neon_auth, "call", provider)
    response = await auth_client.post("/v1/auth/password-reset/request", json={"email": "unknown@example.com"},
                                      headers=await csrf_headers(auth_client))
    assert response.status_code == status


def test_provider_error_sanitization_and_encrypted_storage(auth_settings):
    error = neon_auth.provider_error(500, {"message": "password=secret", "code": "internal"})
    assert "secret" not in error.message and error.status_code == 503
    assert neon_auth.provider_error(400, {"code": "INVALID_OTP"}).code == "INVALID_CODE"
    ciphertext = encrypt({"__Secure-neon-auth.session_token": "secret"})
    assert "secret" not in ciphertext
    assert decrypt(ciphertext)["__Secure-neon-auth.session_token"] == "secret"


def test_oauth_access_logs_redact_queries():
    record = logging.LogRecord("uvicorn.access", logging.INFO, "", 1, "%s %s %s %s %s",
        ("client", "GET", "/v1/auth/google/callback?neon_auth_session_verifier=secret", "1.1", 303), None)
    RedactAuthQuery().filter(record)
    assert "secret" not in record.getMessage()


def test_swagger_describes_auth_contract_and_security():
    schema = app.openapi()
    for suffix in ["csrf", "signup", "login", "email-verification/request", "email-verification/confirm",
                   "password-reset/request", "password-reset/confirm", "session", "logout", "google/start"]:
        operation = next(iter(schema["paths"][f"/v1/auth/{suffix}"].values()))
        assert operation["operationId"] and operation["description"]
        for status in ["400", "401", "403", "422", "429", "503"]:
            assert status in operation["responses"]
    login = schema["paths"]["/v1/auth/login"]["post"]
    assert any(p["name"] == "x-csrf-token" for p in login["parameters"])
    assert schema["components"]["securitySchemes"]["BackendSession"]["in"] == "cookie"
    assert "303" in schema["paths"]["/v1/auth/google/callback"]["get"]["responses"]
