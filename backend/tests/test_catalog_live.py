"""Opt-in integration against the isolated development branch. Fixtures are removed in finally."""
import asyncio
import base64
import os
import logging
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import delete, select

from app.core.config import get_settings
from app.core.event_loop import new_event_loop
from app.db.session import get_engine, get_session_factory
from app.main import app
from app.models.catalog import Banner, Category, GoldRate, Product, StoreSettings
from app.models.media import Media
from app.models.profile import Profile
from app.services.identity import require_admin
from app.services.storage import storage_call

pytestmark = pytest.mark.skipif(os.getenv("RUN_NEON_CATALOG_TESTS") != "1", reason="Opt-in Neon integration test")
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=")


def test_live_catalog():
    asyncio.run(run_catalog(), loop_factory=new_event_loop)


async def run_catalog():
    logging.getLogger('httpx').setLevel(logging.WARNING)
    settings = get_settings()
    assert "ep-summer-shadow-b4c3cmqi" in (settings.database_url or ""), "Development branch only"
    factory = get_session_factory()
    prefix = f"phase3-qa-{uuid4().hex}"
    media_ids, category_ids, product_ids, banner_ids = [], [], [], []
    async with factory() as session:
        admin = await session.scalar(select(Profile).where(Profile.email == settings.initial_admin_email))
        assert admin and admin.role == "super_admin"
        previous_rates = {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}
    async def admin_identity():
        return admin
    app.dependency_overrides[require_admin] = admin_identity
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        async def request(method, path, body=None, expected=200):
            response = await client.request(method, f"/v1/{path}", json=body)
            assert response.status_code == expected, (path, response.status_code, response.json())
            return response.json().get("data")

        async def upload(kind):
            auth = await request("POST", "admin/media/uploads", {"kind": kind, "content_type": "image/png", "size": len(PNG)}, 201)
            media_ids.append(auth["media_id"])
            async with httpx.AsyncClient(timeout=30) as storage:
                response = await storage.put(auth["upload_url"], headers=auth["headers"], content=PNG)
                assert response.status_code == 200, ("storage upload", response.status_code)
            completed = await request("POST", f"admin/media/{auth['media_id']}/complete")
            await request("POST", f"admin/media/{auth['media_id']}/complete")
            async with httpx.AsyncClient(timeout=30) as storage:
                image = await storage.get(completed["url"])
                assert image.status_code == 200 and image.content == PNG
            return {"media_id": auth["media_id"], "alt": "Temporary QA image"}

        try:
            category = await request("POST", "admin/categories", {"name": prefix, "slug": prefix, "category_type": "Gold"}, 201)
            category_ids.append(category["id"])
            await request("POST", "admin/categories", {"name": prefix, "slug": prefix, "category_type": "Gold"}, 409)
            image = await upload("product")
            body = {"name": prefix, "slug": prefix, "category_id": category["id"], "description": "Temporary integration fixture",
                    "price": "100.50", "stock": 2, "status": "draft", "images": [image], "gold_karats": ["18k", "22k", "24k"]}
            product = await request("POST", "admin/products", body, 201)
            product_ids.append(product["id"])
            await request("GET", f"catalog/products/{prefix}", expected=404)
            body["status"] = "active"
            product = await request("PUT", f"admin/products/{product['id']}", body)
            assert product["display_price"]["amount"] == 101
            price = await request("GET", f"catalog/products/{prefix}/price?karat=24k")
            assert price["amount"] == 101
            page = await request("GET", f"catalog/products?q={prefix}&sort=price_asc&page_size=1")
            assert page["total"] == 1 and page["items"][0]["id"] == product["id"]
            await request("DELETE", f"admin/categories/{category['id']}", expected=409)
            await request("DELETE", f"admin/media/{image['media_id']}", expected=409)
            body.update(is_gold_karat_priced=True, gold_weight_grams="2.125", making_charge="50")
            await request("PUT", "admin/gold-rates", {"rates": {"18k": "100.10", "22k": "200.20", "24k": "300.30"}})
            await request("PUT", f"admin/products/{product['id']}", body)
            assert (await request("GET", f"catalog/products/{prefix}/price?karat=18k"))["amount"] == 263
            await request("PUT", "admin/gold-rates", {"rates": {}})
            assert (await request("GET", f"catalog/products/{prefix}"))["display_price"]["reason"] == "GOLD_RATE_UNAVAILABLE"
            replacement = await upload("product")
            body["images"] = [replacement, image]
            await request("PUT", f"admin/products/{product['id']}", body)
            body["images"] = [image]
            await request("PUT", f"admin/products/{product['id']}", body)
            await request("DELETE", f"admin/media/{replacement['media_id']}")
            media_ids.remove(replacement["media_id"])
            body["images"] = [{"media_id": str(uuid4()), "alt": "Invalid"}]
            await request("PUT", f"admin/products/{product['id']}", body, 422)
            assert len((await request("GET", f"catalog/products/{prefix}"))["images"]) == 1
            banner_image = await upload("banner")
            banner = await request("POST", "admin/banners", {"title": prefix, "description": "Temporary QA", "route": "/shop", "images": [banner_image]}, 201)
            banner_ids.append(banner["id"])
            assert any(row["id"] == banner["id"] for row in await request("GET", "catalog/banners"))
            print("PASS: real catalog CRUD, visibility, filtering, price previews, conflicts, uploads, public reads, replacement and deletion")
        finally:
            app.dependency_overrides.clear()
            async with factory() as session:
                for model, identifiers in ((Banner, banner_ids), (Product, product_ids), (Category, category_ids)):
                    await session.execute(delete(model).where(model.id.in_(identifiers)))
                await session.execute(delete(GoldRate))
                session.add_all(GoldRate(karat=key, rate=value) for key, value in previous_rates.items())
                await session.commit()
                for identifier in media_ids:
                    media = await session.get(Media, identifier)
                    if media:
                        for key in (media.object_key, f"pending/{media.object_key}"):
                            await storage_call("delete_object", Bucket=settings.catalog_bucket, Key=key)
                        await session.delete(media)
                await session.commit()
            await get_engine().dispose()


def test_live_settings():
    asyncio.run(run_settings(), loop_factory=new_event_loop)


async def run_settings():
    assert "ep-summer-shadow-b4c3cmqi" in (get_settings().database_url or ""), "Development branch only"
    factory = get_session_factory()
    async with factory() as session:
        row = await session.get(StoreSettings, 1)
        previous = dict(row.values) if row else None
    async def admin_identity():
        return Profile(id="settings-fixture", role="admin")
    app.dependency_overrides[require_admin] = admin_identity
    try:
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            response = await client.put("/v1/admin/settings", json={"store_name": "Temporary settings QA", "local_shipping_fee": "5000.50"})
            assert response.status_code == 200
            read = (await client.get("/v1/catalog/settings")).json()["data"]
            assert read["store_name"] == "Temporary settings QA" and read["local_shipping_fee"] == "5000.50"
            assert "paystack_mode" not in read and "mfa_required" not in read
            assert (await client.put("/v1/admin/settings", json={"local_shipping_fee": -1})).status_code == 422
            assert (await client.put("/v1/admin/settings", json={"paystack_mode": "live"})).status_code == 422
            print("PASS: real settings persistence, safe public response and invalid-field rejection")
    finally:
        app.dependency_overrides.clear()
        async with factory() as session:
            await session.execute(delete(StoreSettings).where(StoreSettings.id == 1))
            if previous is not None:
                session.add(StoreSettings(id=1, values=previous))
            await session.commit()
        await get_engine().dispose()
