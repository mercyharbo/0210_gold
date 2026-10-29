from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from httpx import ASGITransport, AsyncClient

from app.auth import tokens
from app.core.config import get_settings
from app.core.errors import AppError
from app.main import app
from app.models.profile import Profile
from app.services.identity import current_profile, require_admin


@pytest.fixture
def signing(monkeypatch):
    key = Ed25519PrivateKey.generate()
    settings = get_settings()
    monkeypatch.setattr(settings, "neon_auth_base_url", "https://auth.test/auth")
    monkeypatch.setattr(settings, "neon_auth_jwks_url", "https://auth.test/auth/jwks")
    monkeypatch.setattr(tokens, "jwks_client", lambda _: SimpleNamespace(
        get_signing_key_from_jwt=lambda _: SimpleNamespace(key=key.public_key()),
    ))
    return key


def token(key, **overrides):
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": "test-user", "iss": "https://auth.test", "aud": "https://auth.test", "iat": now,
                       "exp": now + timedelta(minutes=15), **overrides}, key, algorithm="EdDSA")


def test_valid_branch_token(signing):
    assert tokens.verify_token(token(signing))["sub"] == "test-user"


@pytest.mark.parametrize("overrides", [{"iss": "https://another-branch"}, {"aud": "https://another-branch"}, {"exp": 1}])
def test_wrong_branch_and_expired_tokens_rejected(signing, overrides):
    with pytest.raises(AppError) as error:
        tokens.verify_token(token(signing, **overrides))
    assert error.value.status_code == 401


def test_tampered_signature_rejected(signing):
    with pytest.raises(AppError):
        tokens.verify_token(token(Ed25519PrivateKey.generate()))


@pytest.mark.asyncio
async def test_protected_routes_require_identity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for path in ["/v1/auth/me", "/v1/admin/auth-check"]:
            response = await client.get(path)
            assert response.status_code == 401
            assert response.json()["error"]["code"] == "UNAUTHENTICATED"


@pytest.mark.asyncio
async def test_customer_role_cannot_access_admin_api():
    async def customer():
        return Profile(id="customer", email="customer@example.invalid", name="Customer", role="customer")
    app.dependency_overrides[current_profile] = customer
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/v1/admin/auth-check")
            assert response.status_code == 403
            assert response.json()["error"]["code"] == "FORBIDDEN"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_role_is_allowed():
    profile = Profile(role="super_admin")
    assert await require_admin(profile) is profile


def test_bootstrap_cannot_accept_role_or_email():
    from pydantic import ValidationError
    from app.schemas.auth import BootstrapBody
    with pytest.raises(ValidationError):
        BootstrapBody.model_validate({"role": "super_admin", "email": "admin@example.invalid"})


def test_openapi_documents_identity_contract():
    schema = app.openapi()
    bootstrap = schema["paths"]["/v1/auth/bootstrap"]["post"]
    assert bootstrap["security"] == [{"HTTPBearer": []}]
    assert "requestBody" in bootstrap
    for code in ["200", "401", "403", "422", "500", "503"]:
        assert code in bootstrap["responses"]
    assert "409" in schema["paths"]["/v1/auth/me"]["get"]["responses"]
