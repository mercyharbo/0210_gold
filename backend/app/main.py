from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import get_settings
from app.core.errors import AppError
from app.core.logging import configure_logging, get_logger
from app.schemas.envelope import ApiFailure, ErrorDetail
from app.api.catalog_examples import add_catalog_examples
from app.api.commerce_examples import add_commerce_examples
from app.api.account_examples import add_account_examples
from app.api.authentication_docs import add_authentication_docs

logger = get_logger(__name__)


def error_response(error: ErrorDetail, status_code: int) -> JSONResponse:
    payload = ApiFailure(status=status_code, error=error)
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(by_alias=True, exclude_none=True),
    )


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        logger.info("Starting %s %s", settings.app_name, settings.app_version)
        yield
        logger.info("Stopping %s", settings.app_name)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-CSRF-Token"],
    )
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.middleware("http")
    async def private_auth_responses(request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith(settings.api_v1_prefix + "/auth/") or "fmluxe_session" in request.cookies:
            response.headers["Cache-Control"] = "no-store"
            response.headers["Referrer-Policy"] = "no-referrer"
        return response
    original_openapi = app.openapi

    def documented_openapi():
        return add_authentication_docs(add_account_examples(add_commerce_examples(add_catalog_examples(original_openapi()))))

    app.openapi = documented_openapi

    @app.exception_handler(SQLAlchemyError)
    async def handle_database_error(_: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error("Database request failed: %s", type(exc).__name__)
        return error_response(ErrorDetail(code="DATABASE_UNAVAILABLE", message="The database is currently unavailable."), 503)

    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return error_response(
            ErrorDetail(
                code=exc.code,
                message=exc.message,
                field_errors=exc.field_errors,
            ),
            exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        field_errors: dict[str, list[str]] = {}

        for item in exc.errors():
            field_name = ".".join(str(part) for part in item["loc"] if part != "body")
            field_errors.setdefault(field_name or "request", []).append(item["msg"])

        return error_response(
            ErrorDetail(
                code="VALIDATION_ERROR",
                message="The request contains invalid fields.",
                field_errors=field_errors,
            ),
            422,
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled request error", exc_info=exc)
        return error_response(
            ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="The request could not be completed.",
            ),
            500,
        )

    return app


app = create_app()
