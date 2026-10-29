from fastapi import APIRouter, Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.errors import AppError
from app.db.health import check_database_connection
from app.db.session import get_db_session
from app.schemas.envelope import ApiFailure, ApiSuccess
from app.schemas.health import DatabaseHealth, HealthData

router = APIRouter()


@router.get(
    "/health",
    response_model=ApiSuccess[HealthData],
    responses={503: {"model": ApiFailure}},
)
async def health(
    session: AsyncSession = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> ApiSuccess[HealthData]:
    try:
        await check_database_connection(session)
    except AppError:
        raise
    except SQLAlchemyError as exc:
        raise AppError(
            code="DATABASE_UNAVAILABLE",
            message="The database is currently unavailable.",
            status_code=503,
        ) from exc

    return ApiSuccess(
        status=200,
        message="API is healthy.",
        data=HealthData(
            service=settings.app_name,
            version=settings.app_version,
            environment=settings.app_env,
            database=DatabaseHealth(status="connected"),
        ),
    )
