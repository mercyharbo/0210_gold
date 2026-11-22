import hashlib
import hmac
import json
import time
from uuid import uuid4

import pytest
from pydantic import ValidationError
from app.core.config import get_settings
from app.core.errors import AppError
from app.main import app
from app.schemas.checkout import QuoteBody
from app.services.bachs_provider import configured, verify_webhook
from app.services.locations import nigeria_locations
from commerce_harness import SHIPPING


def test_nigerian_dataset_is_bundled_and_complete():
    assert len(nigeria_locations()) == 37
    assert "Ikeja" in nigeria_locations()["Lagos"]


@pytest.mark.parametrize("change", [{"quantity": 0}, {"quantity": 1.5}, {"unit_price": 1},
                                    {"quantity": True}, {"karat": "9k"}])
def test_cart_rejects_client_prices_and_invalid_quantities(change):
    with pytest.raises(ValidationError):
        QuoteBody.model_validate({"items": [{"product_id": str(uuid4()), "quantity": 1, **change}], "shipping": SHIPPING})


def test_shipping_requires_valid_state_area_pair():
    with pytest.raises(ValidationError):
        QuoteBody.model_validate({"items": [{"product_id": str(uuid4()), "quantity": 1}],
                                  "shipping": {**SHIPPING, "state": "Osun", "local_area": "Ikeja"}})


def test_sandbox_key_is_mandatory(monkeypatch):
    monkeypatch.setattr(get_settings(), "bachs_api_key", "sk_live_not_allowed")
    monkeypatch.setattr(get_settings(), "bachs_organization_id", "acct_fixture")
    with pytest.raises(AppError) as error:
        configured()
    assert error.value.code == "PAYMENT_ENVIRONMENT_DISABLED"


def test_real_sdk_signature_rotation_raw_body_and_timestamp(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "bachs_api_key", "sk_sandbox_fixture")
    monkeypatch.setattr(settings, "bachs_organization_id", "acct_fixture")
    monkeypatch.setattr(settings, "bachs_webhook_secret", "whsec_fixture")
    raw = json.dumps({"id": "evt_fixture", "type": "checkout.completed", "created_at": "2026-11-13T12:00:00Z",
                      "organization_id": "acct_fixture", "data": {}}).encode()
    timestamp = str(int(time.time()))
    signature = hmac.new(b"whsec_fixture", timestamp.encode() + b"." + raw, hashlib.sha256).hexdigest()
    headers = {"X-Bachs-Signature-V2": f"t={timestamp},v1={'0' * 64},v1={signature}"}
    assert verify_webhook(raw, headers)["id"] == "evt_fixture"
    for body, header in ((raw + b" ", headers), (raw, {"X-Bachs-Signature-V2": f"t=1,v1={signature}"})):
        with pytest.raises(AppError) as error:
            verify_webhook(body, header)
        assert error.value.status_code == 400


def test_openapi_commerce_contract_and_examples():
    schema = app.openapi()
    quote = schema["paths"]["/v1/checkout/quote"]["post"]
    assert quote["requestBody"]["content"]["application/json"]["example"]["shipping"]["country"] == "Nigeria"
    assert quote["security"] == [{"HTTPBearer": []}, {"BackendSession": []}]
    for path in ("/v1/orders", "/v1/orders/{identifier}/payment-attempts"):
        operation = schema["paths"][path]["post"]
        assert any(parameter["name"] == "Idempotency-Key" and parameter["required"] for parameter in operation["parameters"])
        assert "409" in operation["responses"] and "503" in operation["responses"]
    webhook = schema["paths"]["/v1/webhooks/bachs"]["post"]
    assert not webhook.get("security")
    assert webhook["requestBody"]["content"]["application/json"]["schema"]["$ref"].endswith("PaymentEvent")
    assert "PaymentEvent" in schema["components"]["schemas"]
