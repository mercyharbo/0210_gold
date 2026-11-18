"""Opt-in real sandbox transport, no payment or UI and no public-table fixtures."""
import os
from uuid import uuid4

import pytest
from app.core.config import get_settings
from app.main import app
from app.models.profile import Profile
from app.services import bachs_provider

pytestmark = pytest.mark.skipif(os.getenv("RUN_BACHS_SANDBOX_TESTS") != "1",
    reason="Opt-in real Bachs sandbox smoke test")


def test_real_sandbox_session_from_order_api(commerce_database, monkeypatch):
    harness = commerce_database
    settings = get_settings()
    assert settings.bachs_api_key and settings.bachs_api_key.startswith('sk_sandbox_')
    monkeypatch.setattr(settings, 'bachs_success_url', 'https://example.com/success')
    monkeypatch.setattr(settings, 'bachs_cancel_url', 'https://example.com/cancel')
    # Bachs rejects .invalid domains even in sandbox; example.com cannot reach a customer inbox.
    harness.customer.email = f'sandbox-qa-{uuid4().hex}@example.com'
    harness.edit(Profile, harness.customer.id, email=harness.customer.email)
    harness.activate()
    try:
        order = harness.order(harness.product(price='100'))
        path = f"orders/{order['id']}/payment-attempts"
        key = str(uuid4())
        attempt = harness.call('POST', path, key=key)['data']
        assert attempt['checkout_id'] and attempt['checkout_url'].startswith('https://')
        assert harness.call('POST', path, key=key)['data']['id'] == attempt['id']
        provider = harness.run(bachs_provider.retrieve_session(attempt['checkout_id']))
        assert provider['checkout_id'] == attempt['checkout_id']
        assert provider['reference'] == attempt['id']
        assert provider['currency'] == 'NGN'
        assert str(provider['amount']) == order['total']
        print('Real sandbox: API order, Bachs session, verified lookup and idempotent replay passed')
        harness.call('POST', f"orders/{order['id']}/cancel")
    finally:
        app.dependency_overrides.clear()
