from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import get_db_session
from app.db.session import get_engine, get_session_factory
from app.core.config import get_settings
from app.main import app


class HealthySession:
    async def execute(self, _: object) -> None:
        return None


async def healthy_session() -> AsyncIterator[HealthySession]:
    yield HealthySession()


@pytest.mark.asyncio
async def test_health_returns_versioned_success_envelope() -> None:
    app.dependency_overrides[get_db_session] = healthy_session

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.get("/v1/health")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "status": 200,
        "data": {
            "service": "FM LUXE API",
            "version": "0.1.0",
            "environment": "development",
            "database": {"status": "connected"},
        },
        "message": "API is healthy.",
    }


@pytest.mark.asyncio
async def test_health_reports_missing_database_configuration(monkeypatch) -> None:
    monkeypatch.setattr(get_settings(), "database_url", None)
    get_engine.cache_clear()
    get_session_factory.cache_clear()
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        response = await client.get("/v1/health")

    assert response.status_code == 503
    assert response.json() == {
        "success": False,
        "status": 503,
        "error": {
            "code": "DATABASE_NOT_CONFIGURED",
            "message": "The database connection is not configured.",
        },
    }
