from decimal import Decimal
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from app.main import app
from app.models.catalog import Product
from app.models.profile import Profile
from app.schemas.catalog import BannerBody, ProductBody
from app.services.identity import current_profile
from app.services.pricing import calculate_price
from app.services.storage import is_image


def product(**changes):
    values = dict(pricing_type="fixed", price=Decimal("100.50"), making_charge=Decimal("50"),
                  gold_weight_grams=Decimal("2.125"), is_gold_karat_priced=False)
    return Product(**(values | changes))


def test_fixed_price_ignores_gold_selection_and_making_charge():
    result = calculate_price(product(), {"18k": Decimal(999999)}, ["18k"], "18k")
    assert result.amount == 101


@pytest.mark.parametrize("karat,rate", [("18k", "100.10"), ("22k", "200.20"), ("24k", "300.30")])
def test_gold_price_decimal_rounding(karat, rate):
    item = product(is_gold_karat_priced=True)
    expected = int((Decimal("2.125") * Decimal(rate) + Decimal(50)).quantize(Decimal(1), rounding="ROUND_HALF_UP"))
    assert calculate_price(item, {karat: Decimal(rate)}, [karat], karat).amount == expected


def test_gold_missing_rates_and_minimum_display_price():
    item = product(is_gold_karat_priced=True)
    assert calculate_price(item, {}, ["18k"]).reason == "GOLD_RATE_UNAVAILABLE"
    result = calculate_price(item, {"18k": Decimal(100), "24k": Decimal(200)}, ["24k", "18k"])
    assert result.karat == "18k"
    assert calculate_price(product(pricing_type="price_on_request"), {}, []).amount is None


@pytest.mark.parametrize("changes", [{"stock": -1}, {"price": "0"}, {"colors": ["made-up"]},
    {"sizes": ["s", "s"]}, {"status": "active"}, {"is_gold_karat_priced": True}])
def test_product_input_constraints(changes):
    values = dict(name="Test", slug="test", category_id=str(uuid4()), price="100", description="Test description")
    with pytest.raises(ValidationError):
        ProductBody.model_validate(values | changes)


def test_banner_only_allows_internal_routes():
    for route in ("//evil.example", "https://evil.example", "/\\evil.example"):
        with pytest.raises(ValidationError):
            BannerBody.model_validate(dict(title="Test", description="Test", route=route, images=[]))


def test_image_signature_rejects_spoofed_content_types():
    assert is_image(b"\x89PNG\r\n\x1a\n", "image/png")
    assert not is_image(b"<script>alert(1)</script>", "image/png")
    assert not is_image(b"\xff\xd8\xff", "image/webp")


@pytest.mark.asyncio
async def test_catalog_admin_rejects_customers_and_anonymous_users():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for endpoint in ("products", "categories", "banners"):
            assert (await client.get(f"/v1/admin/{endpoint}")).status_code == 401
        async def customer():
            return Profile(id="customer", role="customer")
        app.dependency_overrides[current_profile] = customer
        try:
            for endpoint in ("products", "categories", "banners"):
                assert (await client.get(f"/v1/admin/{endpoint}")).status_code == 403
            assert (await client.post("/v1/admin/media/cleanup")).status_code == 403
        finally:
            app.dependency_overrides.clear()


def test_openapi_catalog_has_explicit_contracts():
    schema = app.openapi()
    for path, methods in schema["paths"].items():
        if "/catalog/" not in path and "/admin/" not in path:
            continue
        for method, operation in methods.items():
            assert operation["operationId"]
            assert "503" in operation["responses"]
            if path.startswith("/v1/admin/"):
                assert operation["security"] == [{"HTTPBearer": []}]
            if method == "put" or path.endswith("/uploads"):
                assert "requestBody" in operation
