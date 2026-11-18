from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            BACKEND_ROOT.parent / ".env",
            BACKEND_ROOT.parent / ".env.local",
            BACKEND_ROOT / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_name: str = "FM LUXE API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/v1"
    database_url: str | None = None
    database_url_unpooled: str | None = None
    cors_origins: str = "http://localhost:4000"
    log_level: str = "INFO"
    neon_auth_base_url: str | None = None
    neon_auth_jwks_url: str | None = None
    initial_admin_email: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_endpoint_url_s3: str | None = None
    aws_region: str = "us-east-2"
    catalog_bucket: str = "catalog-images"
    bachs_api_key: str | None = None
    bachs_organization_id: str | None = None
    bachs_webhook_secret: str | None = None
    bachs_success_url: str = "http://localhost:4000/order-success"
    bachs_cancel_url: str = "http://localhost:4000/checkout"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str | None:
        if not self.database_url:
            return None

        if self.database_url.startswith("postgresql+psycopg://"):
            return self.database_url

        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1,
            )

        if self.database_url.startswith("postgres://"):
            return self.database_url.replace(
                "postgres://",
                "postgresql+psycopg://",
                1,
            )

        return self.database_url

    @property
    def sqlalchemy_migration_url(self) -> str | None:
        if self.database_url_unpooled:
            return self.model_copy(
                update={"database_url": self.database_url_unpooled},
            ).sqlalchemy_database_url
        return self.sqlalchemy_database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
