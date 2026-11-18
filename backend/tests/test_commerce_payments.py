import hashlib
import hmac
import json
import time
from uuid import uuid4

import pytest
from app.models.catalog import Product
from app.services import bachs_provider
from commerce_harness import fake_checkout


def start(commerce, order=None, key=None, status=200):
    order = order or commerce.order()
    result = commerce.call('POST', f"orders/{order['id']}/payment-attempts",
        key=key or str(uuid4()), status=status)
    return order, result.get('data')


def event(attempt, total, **changes):
    data = {'checkout_id': attempt['checkout_id'], 'reference': attempt['id'],
        'charge_id': f'pay_{uuid4()}', 'amount': total, 'currency': 'NGN', 'status': 'SUCCEEDED'}
    data.update(changes)
    return {'id': f'evt_{uuid4()}', 'type': 'collection.succeeded', 'organization_id': 'acct_fixture',
        'created_at': '2026-11-13T12:00:00Z', 'environment': 'sandbox', 'data': data}


def deliver(commerce, payload, status=200):
    raw = json.dumps(payload, separators=(',', ':')).encode()
    timestamp = str(int(time.time()))
    signature = hmac.new(b'whsec_fixture', timestamp.encode() + b'.' + raw, hashlib.sha256).hexdigest()
    return commerce.call('POST', 'webhooks/bachs', raw=raw, status=status,
        headers={'X-Bachs-Signature-V2': f't={timestamp},v1={signature}', 'Content-Type': 'application/json'})


def test_payment_initiation_reuses_exact_provider_request(commerce, monkeypatch):
    calls = []
    async def create(payload, key):
        calls.append((payload, key))
        return await fake_checkout(payload, key)
    monkeypatch.setattr(bachs_provider, 'create_session', create)
    order = commerce.order()
    key = str(uuid4())
    _, attempt = start(commerce, order, key)
    assert start(commerce, order, key)[1]['id'] == attempt['id']
    assert len(calls) == 1 and calls[0][0]['pricing'] == {'currency': 'NGN', 'amount': order['total']}
    start(commerce, order, status=409)
    commerce.activate(commerce.other)
    start(commerce, order, status=404)


def test_uncertain_response_recovers_with_original_provider_key(commerce, monkeypatch):
    calls = []
    async def uncertain(payload, key):
        calls.append((payload, key))
        if len(calls) == 1:
            raise bachs_provider.ProviderFailure(True)
        return await fake_checkout(payload, key)
    monkeypatch.setattr(bachs_provider, 'create_session', uncertain)
    order, key = commerce.order(), str(uuid4())
    start(commerce, order, key, status=503)
    start(commerce, order, status=409)
    assert start(commerce, order, key)[1]['status'] == 'pending'
    assert calls[0] == calls[1]


def test_signed_success_deduplicates_and_preserves_success(commerce):
    product = commerce.product(stock=2)
    order, attempt = start(commerce, commerce.order(product))
    payload = event(attempt, order['total'])
    assert deliver(commerce, payload)['data']['outcome'] == 'applied'
    assert deliver(commerce, payload)['data']['outcome'] == 'duplicate'
    payload['id'] = f'evt_{uuid4()}'
    assert deliver(commerce, payload)['data']['outcome'] == 'duplicate'
    payload['type'] = 'collection.failed'
    payload['id'] = f'evt_{uuid4()}'
    assert deliver(commerce, payload)['data']['outcome'] == 'ignored'
    assert commerce.value(Product, product, 'stock') == 1
    assert commerce.call('GET', f"orders/{order['id']}")['data']['status'] == 'paid'
    payload['data']['amount'] = '1.00'
    deliver(commerce, payload, status=409)


@pytest.mark.parametrize('changes,reason', [({'amount': '1.00'}, 'AMOUNT_MISMATCH'),
    ({'currency': 'USD'}, 'CURRENCY_MISMATCH'), ({'charge_id': None}, 'MISSING_CHARGE_ID')])
def test_mismatched_payment_needs_review(commerce, changes, reason):
    product = commerce.product(stock=2)
    order, attempt = start(commerce, commerce.order(product))
    assert deliver(commerce, event(attempt, order['total'], **changes))['data']['outcome'] == reason
    assert commerce.value(Product, product, 'stock') == 2
    assert commerce.call('GET', f"orders/{order['id']}")['data']['status'] == 'payment_review'


def test_late_payment_after_cancellation_does_not_consume_stock(commerce):
    product = commerce.product(stock=1)
    order, attempt = start(commerce, commerce.order(product))
    commerce.call('POST', f"orders/{order['id']}/cancel")
    assert deliver(commerce, event(attempt, order['total']))['data']['outcome'] == 'PAYMENT_AFTER_STOCK_RELEASE'
    assert commerce.value(Product, product, 'stock') == 1


def test_wrong_account_and_invalid_signature_are_rejected(commerce):
    commerce.call('POST', 'webhooks/bachs', raw=b'{}', status=400,
        headers={'X-Bachs-Signature-V2': 't=1,v1=invalid'})
    order, attempt = start(commerce)
    payload = event(attempt, order['total'])
    payload['organization_id'] = 'acct_other'
    deliver(commerce, payload, status=403)


def test_reconciliation_checks_provider_evidence_and_permissions(commerce, monkeypatch):
    order, attempt = start(commerce)
    async def lookup(identifier):
        return {'checkout_id': identifier, 'reference': attempt['id'], 'metadata': None,
            'charge': {'payment_id': f'pay_{uuid4()}', 'amount_paid': order['total'],
                'currency': 'NGN', 'status': 'succeeded'}}
    monkeypatch.setattr(bachs_provider, 'retrieve_session', lookup)
    path = f"admin/payment-attempts/{attempt['id']}/reconcile"
    commerce.call('POST', path, status=403)
    commerce.activate(commerce.admin)
    assert commerce.call('POST', path)['data']['status'] == 'paid'
