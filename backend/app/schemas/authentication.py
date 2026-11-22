from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator

from app.schemas.auth import ProfileData


class EmailBody(BaseModel):
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [{"email": "customer@example.com"}]})
    email: str = Field(min_length=3, max_length=320, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$", description="Identity email address.")


class LoginBody(EmailBody):
    password: SecretStr = Field(min_length=1, max_length=1024, description="Account password; never logged or returned.")
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [{
        "email": "customer@example.com", "password": "Example-password-42!"}]})


class SignupBody(LoginBody):
    name: str = Field(min_length=1, max_length=255, description="Customer's display name. Roles are not accepted.")
    password: SecretStr = Field(min_length=8, max_length=128, description="New password, 8–128 characters.")
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [{
        "name": "Ada James", "email": "customer@example.com", "password": "Example-password-42!"}]})

    @field_validator("name")
    @classmethod
    def nonempty_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Enter your name.")
        return value.strip()


class VerificationBody(EmailBody):
    code: str = Field(min_length=1, max_length=128, description="Exact email verification code; preserve leading zeros.")
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [{"email": "customer@example.com", "code": "012345"}]})


class ResetBody(VerificationBody):
    password: SecretStr = Field(min_length=8, max_length=128, description="New password, 8–128 characters.")
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [{
        "email": "customer@example.com", "code": "012345", "password": "New-example-password-42!"}]})


class IdentityData(BaseModel):
    id: str = Field(description="Opaque Neon identity subject.")
    email: str = Field(description="Identity-owned email; cannot be changed using these endpoints.")
    name: str = Field(description="Identity display name.")
    email_verified: bool = Field(description="Whether the identity provider has verified this email.")


class SessionData(BaseModel):
    identity: IdentityData
    profile: ProfileData | None = Field(description="Application profile and database role; null before email verification.")
    expires_at: datetime = Field(description="Absolute backend session expiry in UTC; never later than Neon session expiry.")


class ActionData(BaseModel):
    accepted: bool = Field(default=True, description="Request accepted; code delivery does not reveal account existence.")
    next_action: Literal["verify_email", "sign_in", "none"] = Field(default="none", description="Next integration step; verification/reset never signs in automatically.")


class CsrfData(BaseModel):
    csrf_token: str = Field(description="Send as X-CSRF-Token with mutations and retain the accompanying HttpOnly CSRF cookie.")
    expires_in: int = Field(default=3600, description="Token validity in seconds; fetch again after login/logout rotates the session.")


class GoogleData(BaseModel):
    authorization_url: str = Field(description="Navigate the browser here; Neon may first set OAuth state cookies before redirecting to Google. Do not fetch with AJAX.")
    expires_in: int = Field(default=600, description="Single-use browser-bound OAuth transaction validity in seconds.")


class LogoutData(BaseModel):
    logged_out: bool = Field(default=True, description="Backend session revoked and browser cookie cleared.")
    provider_revoked: bool = Field(description="False if Neon sign-out could not be confirmed; backend session remains revoked.")
