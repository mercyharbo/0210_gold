from unittest.mock import AsyncMock
import pytest
from httpx import ASGITransport, AsyncClient
from app.api.account_docs import PROFILE_UPDATE_EXAMPLE
from app.db.session import get_db_session
from app.main import create_app
from app.schemas.auth import ProfileData
from app.services import account
from app.services.identity import current_profile


@pytest.fixture
def profile_app(monkeypatch):
    application = create_app()
    profile = ProfileData.model_validate(PROFILE_UPDATE_EXAMPLE['data'])

    async def identity():
        return profile

    async def database():
        yield None

    application.dependency_overrides[current_profile] = identity
    application.dependency_overrides[get_db_session] = database
    save = AsyncMock(return_value=profile)
    monkeypatch.setattr(account, 'patch_profile', save)
    return application, save


@pytest.mark.asyncio
async def test_patch_profile_returns_server_message_and_matches_docs(profile_app):
    application, save = profile_app
    async with AsyncClient(transport=ASGITransport(app=application), base_url='http://test') as client:
        response = await client.patch('/v1/account/profile', json={'phone': None})
    assert response.status_code == 200
    assert response.json() == PROFILE_UPDATE_EXAMPLE
    assert save.await_args.args[2].model_dump(exclude_unset=True) == {'phone': None}
    documented = application.openapi()['paths']['/v1/account/profile']['patch']
    assert documented['responses']['200']['content']['application/json']['example'] == response.json()
    assert any(header['name'].lower() == 'x-csrf-token' for header in documented['parameters'])


@pytest.mark.asyncio
@pytest.mark.parametrize('body,field', [({'role': 'admin'}, 'role'), ({'email': 'other@example.com'}, 'email'),
    ({'name': 'Other'}, 'name'), ({'phone': 'letters'}, 'phone'), ({'first_name': ''}, 'first_name')])
async def test_invalid_profile_fields_return_inline_errors(profile_app, body, field):
    application, save = profile_app
    async with AsyncClient(transport=ASGITransport(app=application), base_url='http://test') as client:
        response = await client.patch('/v1/account/profile', json=body)
    assert response.status_code == 422
    assert field in response.json()['error']['fieldErrors']
    save.assert_not_awaited()
