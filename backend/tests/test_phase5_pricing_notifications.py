import runpy
from decimal import Decimal
from pathlib import Path
from uuid import uuid4
from sqlalchemy import text
from app.models.catalog import Product, ProductOption
from app.models.profile import Profile
from app.services.notifications import admins
from test_commerce_payments import deliver, event, start


def test_rate_dependencies_and_publication_guard(commerce):
    product = commerce.product()
    commerce.edit(Product, product, is_gold_karat_priced=True, gold_weight_grams=Decimal(2), pricing_type='starting_from')
    async def options():
        async with commerce.factory() as session:
            session.add_all(ProductOption(product_id=product, kind='gold_karats', value=karat, position=position)
                for position, karat in enumerate(['18k', '22k']))
            await session.commit()
    commerce.run(options())
    commerce.activate(commerce.admin)
    commerce.call('PUT', 'admin/gold-rates', {'rates': {'18k': '100', '22k': '200'}})
    commerce.call('PUT', 'admin/gold-rates', {'rates': {'18k': '100'}}, status=409)
    commerce.call('PUT', 'admin/gold-rates', {'rates': {'18k': '100', '22k': '100'}}, status=409)
    assert len(commerce.call('GET', 'catalog/gold-rates')['data']) == 2
    commerce.edit(Product, product, status='draft')
    commerce.call('PUT', 'admin/gold-rates', {'rates': {'18k': '100'}})
    body = {'name': 'QA gold pendant', 'slug': f'qa-{uuid4()}', 'category_id': commerce.category.id,
        'description': 'QA', 'status': 'active', 'stock': 1, 'is_gold_karat_priced': True,
        'gold_weight_grams': '2', 'gold_karats': ['18k', '22k'], 'pricing_type': 'starting_from',
        'images': [{'media_id': str(uuid4()), 'alt': 'Gold pendant'}]}
    assert commerce.call('POST', 'admin/products', body, status=422)['error']['code'] == 'GOLD_RATE_REQUIRED'


def test_inquiry_migration_preserves_record_and_publicly_unpublishes(commerce):
    product = commerce.product()
    commerce.edit(Product, product, pricing_type='price_on_request', price=None)
    statements = []
    class Capture:
        def execute(self, statement):
            statements.append(statement)
        def __getattr__(self, name):
            return lambda *args, **kwargs: None
    migration = runpy.run_path(str(Path(__file__).parents[1] / 'alembic/versions/0005_product_sales.py'))
    upgrade = migration['upgrade']
    upgrade.__globals__['op'] = Capture()
    upgrade()
    async def apply_data():
        async with commerce.factory() as session:
            await session.execute(text(f'SET LOCAL search_path TO "{commerce.schema}"'))
            for statement in statements:
                await session.execute(text(statement))
            await session.commit()
    commerce.run(apply_data())
    assert commerce.value(Product, product, 'status') == 'draft'
    assert commerce.value(Product, product, 'pricing_type') == 'price_on_request'
    commerce.activate(commerce.admin)
    saved = commerce.call('GET', f'admin/products/{product}')['data']
    assert saved['id'] == product and saved['status'] == 'draft'
    commerce.call('GET', f"catalog/products/{saved['slug']}", status=404)


def test_notifications_deduplicate_and_isolate_administrators(commerce):
    other_admin = Profile(id=f'qa-{uuid4()}', email='admin2@example.invalid', name='Second admin', role='admin')
    key = f'test:{uuid4()}'
    resource = str(uuid4())
    async def notify():
        async with commerce.factory() as session:
            session.add(other_admin)
            await session.flush()
            await admins(session, key, 'review', 'Example review notice.', resource)
            await admins(session, key, 'review', 'Example review notice.', resource)
            await session.commit()
    commerce.run(notify())
    commerce.activate(commerce.admin)
    first = [row for row in commerce.call('GET', 'admin/notifications')['data']['items'] if row['resource_id'] == resource]
    assert len(first) == 1
    commerce.call('PATCH', f"admin/notifications/{first[0]['id']}", {'is_read': True})
    commerce.activate(other_admin)
    second = [row for row in commerce.call('GET', 'admin/notifications')['data']['items'] if row['resource_id'] == resource]
    assert len(second) == 1 and second[0]['is_read'] is False
    commerce.call('PATCH', f"admin/notifications/{first[0]['id']}", {'is_read': True}, status=404)


def test_payment_notifications_are_transactional_and_once(commerce):
    order, attempt = start(commerce, commerce.order(commerce.product(stock=1)))
    payload = event(attempt, order['total'])
    deliver(commerce, payload)
    deliver(commerce, payload)
    customer = commerce.call('GET', 'account/notifications')['data']['items']
    assert len([item for item in customer if item['kind'] == 'payment' and item['resource_id'] == order['id']]) == 1
    commerce.activate(commerce.admin)
    messages = commerce.call('GET', 'admin/notifications')['data']['items']
    assert len([item for item in messages if item['kind'] == 'low_stock' and item['resource_id'] == order['items'][0]['product_id']]) == 1


def test_admin_stock_zero_crossing_notifies_once(commerce):
    product = commerce.product(stock=4)
    commerce.activate(commerce.admin)
    body = {'name': 'QA pendant', 'slug': f'qa-{uuid4()}', 'description': 'QA product',
        'category_id': commerce.category.id, 'status': 'draft', 'stock': 0, 'price': '1000', 'images': []}
    commerce.call('PUT', f'admin/products/{product}', body)
    commerce.call('PUT', f'admin/products/{product}', body)
    messages = commerce.call('GET', 'admin/notifications')['data']['items']
    assert len([item for item in messages if item['kind'] == 'low_stock' and item['resource_id'] == product]) == 1
