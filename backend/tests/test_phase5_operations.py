from app.models.catalog import Product
from app.models.commerce import Order


def test_reviews_require_purchase_moderation_and_private_notes(commerce):
    product = commerce.product()
    body = {'rating': 5, 'comment': 'The jewellery matches its description.'}
    path = f'account/reviews/{product}'
    commerce.call('PUT', path, body, status=403)
    order = commerce.order(product)
    commerce.edit(Order, order['id'], status='paid')
    review = commerce.call('PUT', path, body)['data']
    assert review['status'] == 'pending'
    slug = commerce.value(Product, product, 'slug')
    public = f'catalog/products/{slug}/reviews'
    assert commerce.call('GET', public)['data']['total'] == 0
    commerce.activate(commerce.admin)
    commerce.call('PATCH', f"admin/reviews/{review['id']}", {'status': 'approved', 'moderation_note': 'Private example note'})
    commerce.activate()
    visible = commerce.call('GET', public)['data']
    assert visible['average_rating'] == '5.00' and visible['rating_count'] == 1
    assert 'moderation_note' not in str(visible) and 'email' not in str(visible)
    assert commerce.call('PUT', path, body)['data']['status'] == 'approved'
    assert commerce.call('PUT', path, {**body, 'rating': 4})['data']['status'] == 'pending'
    assert commerce.call('GET', public)['data']['total'] == 0
    commerce.activate(commerce.other)
    commerce.call('DELETE', path)
    commerce.activate()
    assert commerce.call('GET', 'account/reviews')['data']['total'] >= 1


def test_fulfilment_atomicity_notifications_and_customer_boundaries(commerce):
    first, second = commerce.order(), commerce.order()
    commerce.edit(Order, first['id'], status='paid')
    commerce.call('GET', 'admin/customers', status=403)
    commerce.activate(commerce.admin)
    bulk = 'admin/orders/bulk-fulfilment-transitions'
    commerce.call('POST', bulk, {'order_ids': [first['id'], second['id']], 'status': 'processing'}, status=409)
    assert commerce.value(Order, first['id'], 'fulfilment_status') == 'unfulfilled'
    path = f"admin/orders/{first['id']}/fulfilment-transitions"
    commerce.call('POST', path, {'status': 'delivered'}, status=409)
    commerce.call('POST', path, {'status': 'processing'})
    commerce.call('POST', path, {'status': 'processing'})
    commerce.call('POST', path, {'status': 'shipped'}, status=422)
    shipping = {'status': 'shipped', 'carrier': 'Example courier', 'tracking_reference': 'TRACK-123'}
    commerce.call('POST', path, shipping)
    commerce.call('POST', path, {**shipping, 'tracking_reference': 'TRACK-456'}, status=409)
    result = commerce.call('POST', path, {'status': 'delivered'})['data']
    assert len(result['fulfilment_history']) == 3
    assert all(row['actor_id'] == commerce.admin.id for row in result['fulfilment_history'])
    assert result['status'] == 'paid'
    assert commerce.call('GET', f'admin/customers/{commerce.customer.id}')['data']['paid_order_count'] >= 1
    commerce.activate()
    assert all('actor_id' not in row for row in commerce.call('GET', f"orders/{first['id']}")['data']['fulfilment_history'])
    messages = commerce.call('GET', 'account/notifications')['data']['items']
    notifications = [row for row in messages if row['kind'] == 'fulfilment' and row['resource_id'] == first['id']]
    assert len(notifications) == 3
    commerce.activate(commerce.other)
    commerce.call('PATCH', f"account/notifications/{notifications[0]['id']}", {'is_read': True}, status=404)
    commerce.activate()
    assert commerce.call('PATCH', f"account/notifications/{notifications[0]['id']}", {'is_read': True})['data']['changed'] == 1
    assert commerce.call('PATCH', f"account/notifications/{notifications[0]['id']}", {'is_read': True})['data']['changed'] == 0
