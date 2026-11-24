from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError
from app.core.errors import AppError
from app.db.session import get_db_session
from app.main import app
from app.models.profile import Profile
from app.schemas.catalog_filters import AdminProductFilters, ProductFilters
from app.services.identity import current_profile


@pytest.mark.parametrize("values", [
    {"page": 0}, {"page_size": 101}, {"min_price": -1}, {"min_price": "NaN"},
    {"label": "unknown"}, {"gold_karat": "14k"}, {"color": "purple"},
    {"size": "invalid"}, {"category_type": "Food"}, {"sort": "stock_asc"},
    {"is_gold_karat_priced": "maybe"}, {"pricing_type": "price_on_request"},
])
def test_invalid_public_filters(values):
    with pytest.raises(ValidationError):
        ProductFilters.model_validate(values)


@pytest.mark.parametrize("values,field", [
    ({"min_price": 200, "max_price": 100}, "max_price"),
    ({"stock_min": 5, "stock_max": 1}, "stock_max"),
    ({"created_from": "2026-11-24T00:00:00Z", "created_to": "2026-11-23T00:00:00Z"}, "created_to"),
])
def test_ranges_have_actionable_field_errors(values, field):
    with pytest.raises(AppError) as failure:
        AdminProductFilters.model_validate(values)
    assert failure.value.status_code == 422
    assert field in failure.value.field_errors


def test_filter_defaults_and_timezone_validation():
    defaults = ProductFilters()
    assert (defaults.sort, defaults.page, defaults.page_size) == ("newest", 1, 24)
    assert ProductFilters(min_price="100.50").min_price == Decimal("100.50")
    assert not hasattr(ProductFilters(status="draft"), "status")
    with pytest.raises(ValidationError):
        AdminProductFilters(created_from="2026-11-24T00:00:00")


@pytest.mark.asyncio
async def test_query_models_envelopes_and_actual_validation(monkeypatch):
    from app.api.routes import catalog, admin_products
    captured = []
    async def listing(session, *, public=True, filters):
        captured.append((public, filters))
        return {"items": [], "total": 0, "page": filters.page, "page_size": filters.page_size}
    async def database():
        yield None
    async def administrator():
        return Profile(id="filter-fixture", role="admin")
    previous = app.dependency_overrides.copy()
    app.dependency_overrides[get_db_session] = database
    app.dependency_overrides[current_profile] = administrator
    monkeypatch.setattr(catalog, "product_page", listing)
    monkeypatch.setattr(admin_products, "product_page", listing)
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/v1/catalog/products", params={"label": "featured", "category": "gold-necklaces", "page_size": 4, "status": "draft"})
            assert response.status_code == 200
            assert response.json()["message"] == "Products retrieved successfully."
            assert response.json()["data"]["page_size"] == 4
            assert captured[-1][0] and captured[-1][1].label == "featured"
            assert not hasattr(captured[-1][1], "status")
            response = await client.get("/v1/admin/products?status=draft&category_active=false&stock_max=5&sort=updated_desc")
            assert response.status_code == 200
            assert captured[-1][0] is False
            assert captured[-1][1].category_active is False
            for query, field in [("min_price=10&max_price=1", "max_price"), ("gold_karat=14k", "query.gold_karat"), ("page_size=101", "query.page_size")]:
                response = await client.get("/v1/catalog/products?" + query)
                assert response.status_code == 422
                assert field in response.json()["error"]["fieldErrors"]
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


def test_openapi_exposes_public_and_admin_filter_contracts():
    schema = app.openapi()
    public = schema["paths"]["/v1/catalog/products"]["get"]
    admin = schema["paths"]["/v1/admin/products"]["get"]
    public_names = {param["name"] for param in public["parameters"]}
    admin_names = {param["name"] for param in admin["parameters"]}
    assert {"label", "min_price", "max_price", "gold_karat", "in_stock"} <= public_names
    assert {"status", "category_active", "stock_min", "stock_max", "created_from", "created_to"} <= admin_names - public_names
    for operation in (public, admin):
        assert operation["responses"]["200"]["content"]["application/json"]["example"]["message"] == "Products retrieved successfully."
        assert operation["responses"]["422"]["content"]["application/json"]["example"]["error"]["fieldErrors"]
    assert admin["security"] == [{"HTTPBearer": []}, {"BackendSession": []}]
