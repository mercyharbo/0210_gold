import asyncio
from uuid import uuid4
from app.models.account import Address
from app.models.catalog import Product

ADDRESS = {'recipient_name': 'Ada James', 'phone': '08012345678', 'address_line_1': '12 Example Road',
    'state': 'Lagos', 'local_area': 'Ikeja'}


def test_profile_preferences_and_wishlist_ownership(commerce):
    response = commerce.call('PATCH', 'account/profile', {'first_name': 'Ada', 'phone': None})
    assert response['message'] == 'Profile updated successfully.'
    result = response['data']
    assert result['first_name'] == 'Ada' and result['phone'] is None
    commerce.call('PATCH', 'account/profile', {'role': 'admin'}, status=422)
    commerce.call('PUT', 'account/category-preferences', {'category_ids': [commerce.category.id]})
    assert commerce.call('GET', 'account/category-preferences')['data']['category_ids'] == [commerce.category.id]
    commerce.call('PUT', 'account/category-preferences', {'category_ids': [str(uuid4())]}, status=422)
    product = commerce.product()
    path = f'account/wishlist/{product}'
    assert commerce.call('PUT', path)['data']['changed'] == 1
    assert commerce.call('PUT', path)['data']['changed'] == 0
    commerce.edit(Product, product, status='archived')
    assert commerce.call('GET', 'account/wishlist')['data']['items'][0]['available'] is False
    commerce.activate(commerce.other)
    assert commerce.call('GET', 'account/wishlist')['data']['total'] == 0
    commerce.activate()
    assert commerce.call('DELETE', path)['data']['changed'] == 1
    assert commerce.call('DELETE', path)['data']['changed'] == 0


def test_addresses_default_race_reassignment_and_snapshot(commerce):
    first = commerce.call('POST', 'account/addresses', ADDRESS, status=201)['data']
    second = commerce.call('POST', 'account/addresses', {**ADDRESS, 'label': 'Work'}, status=201)['data']
    assert first['is_default'] is True and second['is_default'] is False
    async def compete():
        return await asyncio.gather(*(commerce.request('PUT', f"account/addresses/{row['id']}/default")
            for row in (first, second)))
    assert all(response.status_code == 200 for response in commerce.run(compete()))
    addresses = commerce.call('GET', 'account/addresses')['data']
    assert sum(row['is_default'] for row in addresses) == 1
    default = next(row for row in addresses if row['is_default'])
    commerce.call('PATCH', f"account/addresses/{default['id']}", {'state': None}, status=422)
    commerce.activate(commerce.other)
    commerce.call('PATCH', f"account/addresses/{first['id']}", {'label': 'No'}, status=404)
    commerce.call('DELETE', f"account/addresses/{first['id']}", status=404)
    commerce.activate()
    commerce.call('DELETE', f"account/addresses/{default['id']}")
    remaining = commerce.call('GET', 'account/addresses')['data']
    assert len(remaining) == 1 and remaining[0]['is_default'] is True
    order = commerce.order()
    commerce.call('PATCH', f"account/addresses/{remaining[0]['id']}", {'address_line_1': '77 Different Street'})
    assert commerce.call('GET', f"orders/{order['id']}")['data']['shipping'] == order['shipping']
    commerce.activate(commerce.other)
    assert commerce.call('GET', 'orders')['data']['total'] == 0
