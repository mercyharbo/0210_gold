from decimal import Decimal
from types import SimpleNamespace
import pytest
from fastapi.routing import APIRoute
from pydantic import ValidationError
from app.core.errors import AppError
from app.main import app
from app.schemas.account import AddressCreate, ProfilePatch
from app.schemas.catalog import ProductBody
from app.schemas.operations import TransitionBody
from app.schemas.reviews import ReviewBody
from app.services.catalog_publication import validate_prices
from httpx import ASGITransport, AsyncClient


@pytest.mark.parametrize('payload', [{'role': 'admin'}, {'email': 'other@example.com'}, {'verified': True}])
def test_profile_rejects_identity_controls(payload):
    with pytest.raises(ValidationError):
        ProfilePatch.model_validate(payload)


def test_request_only_writes_and_invalid_shipping_rejected():
    with pytest.raises(ValidationError):
        ProductBody.model_validate({'pricing_type': 'price_on_request'})
    with pytest.raises(ValidationError):
        TransitionBody(status='shipped')
    with pytest.raises(ValidationError):
        ReviewBody(rating=True, comment='Review')
    with pytest.raises(ValidationError):
        AddressCreate(recipient_name='Ada James', phone='08012345678', address_line_1='12 Example Road',
            state='Lagos', local_area='Not a local area')


def test_publication_requires_each_rate_and_variable_positive_prices():
    product = SimpleNamespace(is_gold_karat_priced=True, pricing_type='starting_from', gold_weight_grams=Decimal(2),
        making_charge=Decimal(50), price=None)
    with pytest.raises(AppError, match='Configure rates'):
        validate_prices(product, {'18k': Decimal(100)}, ['18k', '22k'])
    with pytest.raises(AppError, match='different calculated'):
        validate_prices(product, {'18k': Decimal(100), '22k': Decimal(100)}, ['18k', '22k'])
    validate_prices(product, {'18k': Decimal(100), '22k': Decimal(120)}, ['18k', '22k'])
    product.is_gold_karat_priced, product.pricing_type, product.price = False, 'fixed', Decimal('.01')
    with pytest.raises(AppError, match='positive calculated'):
        validate_prices(product, {}, [])


def test_openapi_examples_validate_and_new_routes_are_protected():
    schema = app.openapi()
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        for method in route.methods:
            operation = schema['paths'].get(route.path, {}).get(method.lower())
            if not operation:
                continue
            for status, response in operation['responses'].items():
                example = response.get('content', {}).get('application/json', {}).get('example')
                if example and status.startswith('2'):
                    route.response_model.model_validate(example)
            if route.path.startswith(('/v1/account/', '/v1/admin/')):
                assert operation.get('security') == [{'HTTPBearer': []}, {'BackendSession': []}]
    # Code-delivery /auth/*/request routes are unrelated to retired sourcing requests.
    assert not any('/requests' in path or '/custom-request' in path or '/personal-shopper' in path for path in schema['paths'])
    write = schema['components']['schemas'].get('ProductBody', {})
    assert 'price_on_request' not in str(write.get('properties', {}).get('pricing_type', {}))


@pytest.mark.asyncio
@pytest.mark.parametrize('method,path', [('GET', '/v1/account/profile'), ('POST', '/v1/account/addresses'),
    ('PUT', '/v1/account/reviews/00000000-0000-4000-8000-000000000001'),
    ('GET', '/v1/account/notifications'), ('GET', '/v1/orders'), ('GET', '/v1/admin/customers'),
    ('POST', '/v1/admin/orders/bulk-fulfilment-transitions')])
async def test_new_private_boundaries_require_identity(method, path):
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.request(method, path, json={})
    assert response.status_code == 401
