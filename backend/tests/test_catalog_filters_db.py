"""Real queries in CommerceHarness's disposable PostgreSQL schema; no public records."""
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4
from urllib.parse import urlencode

import pytest
from sqlalchemy import delete, select
from app.models.catalog import Category, GoldRate, Product, ProductOption
from app.models.commerce import Reservation
from app.models.media import Media, MediaLink
from app.services.commerce_common import now


@pytest.fixture
def catalog_data(commerce):
    harness = commerce
    async def seed():
        async with harness.factory() as session:
            prefix = uuid4().hex
            visible = Category(name="Necklaces", slug=prefix, category_type="Gold", is_active=True)
            hidden = Category(name="Hidden", slug=prefix + "-hidden", category_type="Fashion", is_active=False)
            session.add_all([visible, hidden])
            await session.flush()
            rows = {}
            for index, (key, price, stock, status, category) in enumerate([
                ("alpha", "100.50", 5, "active", visible), ("beta", "200", 0, "active", visible),
                ("gamma", None, 10, "active", visible), ("plain", "400", 2, "active", visible),
                ("draft", "300", 3, "draft", visible), ("hidden", "500", 1, "active", hidden),
            ]):
                item = Product(name=key, slug=prefix + "-" + key, category_id=category.id,
                    price=Decimal(price) if price else None, stock=stock, status=status,
                    pricing_type="starting_from" if key == "gamma" else "fixed", description="Disposable filter fixture",
                    label=None if key == "plain" else "featured", is_gold_karat_priced=key == "gamma",
                    gold_weight_grams=Decimal("2.125") if key == "gamma" else None,
                    making_charge=Decimal("50") if key == "gamma" else Decimal(0),
                    created_at=datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(hours=index))
                session.add(item)
                rows[key] = item
            await session.flush()
            media = Media(object_key=prefix + ".png", kind="product", content_type="image/png", size=1,
                          owner_id=harness.admin.id, complete=True)
            session.add(media)
            await session.flush()
            for item in rows.values():
                session.add(MediaLink(media_id=media.id, product_id=item.id, alt="Fixture", position=0))
            for key in ("alpha", "gamma"):
                for kind, values in {"gold_karats": ["18k", "24k"], "sizes": ["one size", "s"], "colors": ["gold", "black"]}.items():
                    for index, value in enumerate(values):
                        session.add(ProductOption(product_id=rows[key].id, kind=kind, value=value, position=index))
            for karat, rate in [("18k", "100.10"), ("24k", "200.20")]:
                await session.merge(GoldRate(karat=karat, rate=Decimal(rate)))
            await session.commit()
            return visible.slug, hidden.slug, {key: item.id for key, item in rows.items()}
    slug, hidden_slug, ids = harness.run(seed())
    def listing(admin=False, **filters):
        harness.activate(harness.admin if admin else harness.customer)
        endpoint = "admin/products" if admin else "catalog/products"
        return harness.call("GET", endpoint + "?" + urlencode({"category": slug, **filters}))["data"]
    return harness, listing, hidden_slug, ids


def test_combined_filters_count_before_pagination_without_option_duplicates(catalog_data):
    _, listing, _, ids = catalog_data
    result = listing(label="featured", category_type="Gold", gold_karat="18k", size="one size", color="gold", sort="name", page_size=1)
    assert result["total"] == 2 and [item["id"] for item in result["items"]] == [ids["alpha"]]
    second = listing(label="featured", gold_karat="18k", size="one size", color="gold", sort="name", page_size=1, page=2)
    assert second["items"][0]["id"] == ids["gamma"]
    assert listing(label="new in")["total"] == 0


def test_price_ranges_match_displayed_fixed_and_gold_prices(catalog_data):
    harness, listing, _, ids = catalog_data
    fixed = listing(min_price=101, max_price=101, gold_karat="24k")
    assert [item["id"] for item in fixed["items"]] == [ids["alpha"]]
    assert fixed["items"][0]["display_price"]["amount"] == 101
    gold = listing(min_price=263, max_price=263, is_gold_karat_priced="true")
    assert [item["id"] for item in gold["items"]] == [ids["gamma"]]
    assert gold["items"][0]["display_price"]["amount"] == 263
    async def remove_rates():
        async with harness.factory() as session:
            await session.execute(delete(GoldRate))
            await session.commit()
    harness.run(remove_rates())
    assert listing(min_price=0, is_gold_karat_priced="true")["total"] == 0
    assert listing(is_gold_karat_priced="true")["items"][0]["display_price"]["available"] is False


def test_reservations_affect_stock_filter_without_changing_recorded_stock(catalog_data):
    harness, listing, _, ids = catalog_data
    harness.activate()
    quote = harness.quote(ids["alpha"], quantity=5, size="one size", color="gold", karat="18k")
    order = harness.call("POST", "orders", {"quote_id": quote["id"]}, status=201, key=f"filter-order-{uuid4()}")["data"]
    assert ids["alpha"] not in {item["id"] for item in listing(in_stock="true")["items"]}
    assert ids["alpha"] in {item["id"] for item in listing(in_stock="false")["items"]}
    async def expire():
        async with harness.factory() as session:
            reservation = await session.scalar(select(Reservation).where(Reservation.order_id == order["id"]))
            reservation.expires_at = now() - timedelta(seconds=1)
            await session.commit()
            return reservation.id
    reservation_id = harness.run(expire())
    assert ids["alpha"] in {item["id"] for item in listing(in_stock="true")["items"]}
    assert harness.value(Reservation, reservation_id, "status") == "held"
    assert harness.value(Product, ids["alpha"], "stock") == 5


def test_admin_filters_do_not_bypass_public_visibility(catalog_data):
    harness, listing, hidden_slug, ids = catalog_data
    assert listing(status="draft")["total"] == 4
    assert listing(category=hidden_slug, category_active="false")["total"] == 0
    assert [item["id"] for item in listing(admin=True, status="draft")["items"]] == [ids["draft"]]
    assert listing(admin=True, category=hidden_slug, category_active="false")["total"] == 1
    assert listing(admin=True, stock_min=3, stock_max=5)["total"] == 2
    result = listing(admin=True, created_from="2026-01-01T00:00:00Z", created_to="2026-01-01T00:00:00Z")
    assert [item["id"] for item in result["items"]] == [ids["alpha"]]
    harness.edit(Product, ids["alpha"], updated_at=now() + timedelta(days=1))
    assert listing(admin=True, sort="updated_desc")["items"][0]["id"] == ids["alpha"]


@pytest.mark.parametrize("sort,expected", [("name", "alpha"), ("name_desc", "plain"), ("oldest", "alpha"),
    ("newest", "plain"), ("price_asc", "alpha"), ("price_desc", "plain")])
def test_public_sorting(catalog_data, sort, expected):
    _, listing, _, ids = catalog_data
    assert listing(sort=sort)["items"][0]["id"] == ids[expected]


@pytest.mark.parametrize("sort,expected", [("stock_asc", "beta"), ("stock_desc", "gamma")])
def test_admin_stock_sorting(catalog_data, sort, expected):
    _, listing, _, ids = catalog_data
    assert listing(admin=True, sort=sort)["items"][0]["id"] == ids[expected]
