"""Real PostgreSQL tests in a disposable schema, never public application tables."""
import asyncio
from datetime import timedelta
from decimal import Decimal
from uuid import uuid4

from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.config import get_settings
from app.core.event_loop import new_event_loop
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.models.catalog import Category, Product, StoreSettings
from app.models.profile import Profile
from app.services.commerce_common import now
from app.services.identity import current_profile

SHIPPING = {"name": "Checkout QA", "phone": "+2348012345678", "address": "12 Example Street",
            "state": "Lagos", "local_area": "Ikeja"}


class CommerceHarness:
    def __init__(self):
        self.runner = asyncio.Runner(loop_factory=new_event_loop)
        self.schema = f"commerce_test_{uuid4().hex}"
        self.customer = Profile(id=f"qa-{uuid4()}", email="checkout@example.invalid", name="Checkout QA", role="customer")
        self.other = Profile(id=f"qa-{uuid4()}", email="other@example.invalid", name="Other QA", role="customer")
        self.admin = Profile(id=f"qa-{uuid4()}", email="admin@example.invalid", name="Admin QA", role="admin")
        self.run(self.start())

    def run(self, coroutine):
        return self.runner.run(coroutine)

    async def start(self):
        settings = get_settings()
        assert settings.app_env != "production"
        assert "neon.tech" in (settings.sqlalchemy_migration_url or "")
        self.root_engine = create_async_engine(settings.sqlalchemy_migration_url, connect_args={"connect_timeout": 10})
        self.engine = self.root_engine.execution_options(schema_translate_map={None: self.schema})
        async with self.root_engine.begin() as connection:
            await connection.execute(text(f'CREATE SCHEMA "{self.schema}"'))
        async with self.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        self.factory = async_sessionmaker(self.engine, expire_on_commit=False)
        async with self.factory() as session:
            self.category = Category(name="QA category", slug=f"qa-{uuid4()}", category_type="Gold")
            session.add_all([self.customer, self.other, self.admin, self.category,
                StoreSettings(id=1, values={"local_shipping_fee": "5000.50", "free_shipping_threshold": "200000"})])
            await session.commit()

    def activate(self, actor=None):
        async def database():
            async with self.factory() as session:
                yield session
        async def identity():
            return actor or self.customer
        app.dependency_overrides[get_db_session] = database
        app.dependency_overrides[current_profile] = identity

    async def request(self, method, path, body=None, headers=None, raw=None):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            return await client.request(method, f"/v1/{path}", json=body if raw is None else None,
                                        content=raw, headers=headers)

    def call(self, method, path, body=None, *, status=200, key=None, headers=None, raw=None):
        headers = dict(headers or {})
        if key:
            headers["Idempotency-Key"] = key
        response = self.run(self.request(method, path, body, headers, raw))
        assert response.status_code == status, (path, response.status_code, response.json())
        return response.json()

    def product(self, price="100000", stock=10, **changes):
        async def create():
            async with self.factory() as session:
                item = Product(name="QA pendant", slug=f"qa-{uuid4()}", category_id=self.category.id,
                    pricing_type="fixed", price=Decimal(price), stock=stock, status="active", description="QA",
                    making_charge=Decimal(0), is_gold_karat_priced=False, details=[], **changes)
                session.add(item)
                await session.commit()
                return item.id
        return self.run(create())

    def quote(self, product_id=None, quantity=1, shipping=None, **options):
        return self.call("POST", "checkout/quote", {"items": [{"product_id": product_id or self.product(),
            "quantity": quantity, **options}], "shipping": shipping or SHIPPING})["data"]

    def order(self, product_id=None, quantity=1):
        quote = self.quote(product_id, quantity)
        return self.call("POST", "orders", {"quote_id": quote["id"]}, status=201, key=f"order-{uuid4()}")["data"]

    def edit(self, model, identifier, **values):
        async def update():
            async with self.factory() as session:
                item = await session.get(model, identifier)
                for key, value in values.items():
                    setattr(item, key, value)
                await session.commit()
        return self.run(update())

    def value(self, model, identifier, name):
        async def read():
            async with self.factory() as session:
                return getattr(await session.get(model, identifier), name)
        return self.run(read())

    def close(self):
        async def stop():
            app.dependency_overrides.clear()
            async with self.root_engine.begin() as connection:
                await connection.execute(text(f'DROP SCHEMA "{self.schema}" CASCADE'))
            await self.root_engine.dispose()
        self.run(stop())
        self.runner.close()


async def fake_checkout(payload, key):
    return {"checkout_id": f"chk_{key}", "checkout_url": f"https://checkout.bachs.io/c/{key}",
            "expires_at": (now() + timedelta(minutes=29)).isoformat()}
