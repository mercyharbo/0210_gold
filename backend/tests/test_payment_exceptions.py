from uuid import uuid4

from app.models.catalog import Product
from test_commerce_payments import deliver, event, start


def test_underpaid_then_success_and_additional_charge_need_review(commerce):
    product = commerce.product(stock=3)
    order, attempt = start(commerce, commerce.order(product))
    payload = event(attempt, '1.00')
    payload['type'] = 'collection.underpaid'
    payload['data']['status'] = 'UNDERPAID'
    assert deliver(commerce, payload)['data']['outcome'] == 'UNDERPAID'
    assert commerce.value(Product, product, 'stock') == 3
    assert deliver(commerce, event(attempt, order['total']))['data']['outcome'] == 'applied'
    assert commerce.value(Product, product, 'stock') == 2
    expired = event(attempt, order['total'])
    expired['type'] = 'checkout.expired'
    assert deliver(commerce, expired)['data']['outcome'] == 'ignored'
    additional = event(attempt, order['total'], charge_id=f'pay_{uuid4()}')
    assert deliver(commerce, additional)['data']['outcome'] == 'ADDITIONAL_PAYMENT'
    assert commerce.value(Product, product, 'stock') == 2
    assert commerce.call('GET', f"orders/{order['id']}")['data']['review_reason'] == 'ADDITIONAL_PAYMENT'
