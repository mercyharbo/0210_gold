import os
import pytest
from commerce_harness import CommerceHarness, fake_checkout
from app.core.config import get_settings
from app.main import app
from app.services import bachs_provider


@pytest.fixture(scope="session")
def commerce_database():
    if os.getenv("RUN_COMMERCE_DB_TESTS") != "1":
        pytest.skip("Set RUN_COMMERCE_DB_TESTS=1 for isolated PostgreSQL commerce verification")
    harness = CommerceHarness()
    try:
        yield harness
    finally:
        harness.close()


@pytest.fixture
def commerce(commerce_database, monkeypatch):
    harness = commerce_database
    harness.activate()
    settings = get_settings()
    monkeypatch.setattr(settings, "bachs_api_key", "sk_sandbox_fixture")
    monkeypatch.setattr(settings, "bachs_organization_id", "acct_fixture")
    monkeypatch.setattr(settings, "bachs_webhook_secret", "whsec_fixture")
    monkeypatch.setattr(bachs_provider, "create_session", fake_checkout)
    try:
        yield harness
    finally:
        app.dependency_overrides.clear()
