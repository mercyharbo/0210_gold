from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.errors import AppError
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.catalog import ProductData
from app.services.identity import current_profile
from app.api.product_messages import PRODUCT_RESPONSE

ID = "00000000-0000-4000-8000-000000000001"
BODY = {"name": "Contract example", "slug": "contract-example", "category_id": ID,
        "description": "Sanitized payload example", "price": "100.50", "status": "draft", "images": []}


@pytest.mark.asyncio
async def test_product_messages_payloads_and_conflicts(monkeypatch):
    from app.api.routes import admin_products
    async def database():
        yield None
    async def admin():
        return Profile(id="contract-admin", role="admin")
    previous = app.dependency_overrides.copy()
    app.dependency_overrides[get_db_session] = database
    app.dependency_overrides[current_profile] = admin
    result = ProductData.model_validate(PRODUCT_RESPONSE)
    save = AsyncMock(return_value=result)
    monkeypatch.setattr(admin_products, "save", save)
    monkeypatch.setattr(admin_products, "record", AsyncMock(return_value=object()))
    monkeypatch.setattr(admin_products, "output", AsyncMock(return_value=result))
    monkeypatch.setattr(admin_products, "remove", AsyncMock(return_value={"deleted": True}))
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            for method, path, body, status, message in [
                ("GET", f"/v1/admin/products/{ID}", None, 200, "Product retrieved successfully."),
                ("POST", "/v1/admin/products", BODY, 201, "Product created successfully."),
                ("PUT", f"/v1/admin/products/{ID}", BODY, 200, "Product updated successfully."),
                ("DELETE", f"/v1/admin/products/{ID}", None, 200, "Product deleted successfully."),
            ]:
                response = await client.request(method, path, json=body)
                assert response.status_code == status
                assert response.json()["message"] == message
                assert response.json()["success"] is True
            assert save.await_args.args[2].price.as_tuple().exponent == -2
            assert save.await_args.args[3] == ID
            save.side_effect = AppError(code="STOCK_RESERVED", message="Stock cannot be reduced below active order reservations.",
                                       status_code=409, field_errors={"stock": ["Stock is reserved."]})
            response = await client.put(f"/v1/admin/products/{ID}", json=BODY)
            assert response.status_code == 409
            assert response.json()["error"]["fieldErrors"] == {"stock": ["Stock is reserved."]}
            response = await client.post("/v1/admin/products", json={**BODY, "price": "0"})
            assert response.status_code == 422
            assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(previous)


def test_product_openapi_examples_match_response_models_and_messages():
    schema = app.openapi()
    for path, method, status, message in [
        ("/v1/admin/products/{identifier}", "get", "200", "Product retrieved successfully."),
        ("/v1/admin/products", "post", "201", "Product created successfully."),
        ("/v1/admin/products/{identifier}", "put", "200", "Product updated successfully."),
        ("/v1/admin/products/{identifier}", "delete", "200", "Product deleted successfully."),
    ]:
        operation = schema["paths"][path][method]
        example = operation["responses"][status]["content"]["application/json"]["example"]
        assert example["message"] == message
        if method != "delete":
            ProductData.model_validate(example["data"])
        assert operation["security"] == [{"HTTPBearer": []}, {"BackendSession": []}]
