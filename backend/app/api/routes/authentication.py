from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request, Response, Security
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.authentication_docs import AUTHENTICATION_RESPONSES, COOKIE_PROTOCOL, SESSION_EXAMPLE, success_example
from app.auth import sessions
from app.auth.cookies import csrf_token, validate_csrf
from app.auth.tokens import session_cookie
from app.db.session import get_db_session
from app.core.errors import AppError
from app.models.profile import Profile
from app.schemas.auth import BootstrapBody, ProfileData
from app.schemas.authentication import (ActionData, CsrfData, EmailBody, IdentityData, LoginBody,
                                       LogoutData, ResetBody, SessionData, SignupBody, VerificationBody)
from app.schemas.envelope import ApiSuccess
from app.services import auth_credentials, neon_auth
from app.services.identity import bootstrap_profile

router = APIRouter(prefix="/auth", tags=["authentication"], responses=AUTHENTICATION_RESPONSES)
Database = Annotated[AsyncSession, Depends(get_db_session)]


def csrf_required(request: Request, x_csrf_token: Annotated[str | None, Header(
        description="Token from GET /v1/auth/csrf. Also send its fmluxe_csrf cookie.")] = None):
    validate_csrf(request)


Mutation = [Depends(csrf_required)]


def session_data(user: neon_auth.ProviderIdentity, profile: Profile | None, expiry: datetime) -> SessionData:
    return SessionData(identity=IdentityData(id=user.id, email=user.email, name=user.name,
        email_verified=user.emailVerified), profile=ProfileData.model_validate(profile) if profile else None, expires_at=expiry)


@router.get("/csrf", operation_id="getAuthCsrf", response_model=ApiSuccess[CsrfData],
    summary="Obtain a CSRF token and matching cookie", description=COOKIE_PROTOCOL +
    "No authentication required. Fetch before auth POSTs, including signup and login. Does not create a login session.",
    responses=success_example({"csrf_token": "opaque-csrf-example", "expires_in": 3600}))
async def csrf(request: Request, response: Response):
    return ApiSuccess(status=200, data=CsrfData(csrf_token=csrf_token(request, response)))


@router.post("/signup", operation_id="signupCustomer", response_model=ApiSuccess[ActionData], dependencies=Mutation,
    summary="Register an email/password customer", description=COOKIE_PROTOCOL +
    "JSON name/email/password only. Neon hashes the password. Explicitly request an email code using email-verification/request; do not assume automatic delivery. "
    "Does not establish a backend session. Verify the code, then explicitly log in. Existing identities are preserved.",
    responses=success_example({"accepted": True, "next_action": "verify_email"}))
async def signup(body: SignupBody):
    await neon_auth.call("sign-up/email", body={"name": body.name, "email": body.email,
                                               "password": body.password.get_secret_value()})
    return ApiSuccess(status=200, data=ActionData(next_action="verify_email"))


@router.post("/login", operation_id="loginCustomer", response_model=ApiSuccess[SessionData], dependencies=Mutation,
    summary="Sign in a customer or administrator", description=COOKIE_PROTOCOL +
    "JSON email/password. Requires verified email. Creates a new backend session and revokes the previous backend "
    "session for this browser. Initializes the application profile idempotently using database-owned roles.",
    responses={200: {"content": {"application/json": {"example": SESSION_EXAMPLE}}}})
async def login(body: LoginBody, request: Request, response: Response, db: Database):
    result = await neon_auth.call("sign-in/email", body={"email": body.email, "password": body.password.get_secret_value()})
    result = await neon_auth.call("get-session", cookies=result.cookies)
    user, _ = neon_auth.identity(result)
    if not user.emailVerified:
        raise AppError(code="EMAIL_NOT_VERIFIED", message="Verify your email before signing in.", status_code=403)
    user, profile, expiry = await sessions.establish(request, response, db, result)
    return ApiSuccess(status=200, data=session_data(user, profile, expiry))


@router.post("/email-verification/request", operation_id="requestEmailVerification", response_model=ApiSuccess[ActionData],
    dependencies=Mutation, summary="Request an email verification code", description=COOKIE_PROTOCOL +
    "JSON email. Generic accepted response whether the account exists. Provider cooldown and code lifetime apply.",
    responses=success_example({"accepted": True, "next_action": "none"}))
async def request_verification(body: EmailBody):
    await auth_credentials.request_code(body, "email-verification")
    return ApiSuccess(status=200, data=ActionData())


@router.post("/email-verification/confirm", operation_id="confirmEmailVerification", response_model=ApiSuccess[ActionData],
    dependencies=Mutation, summary="Verify ownership with an email code", description=COOKIE_PROTOCOL +
    "JSON email/code. Invalid, expired or reused codes fail. Does not sign in; call login after success.",
    responses=success_example({"accepted": True, "next_action": "sign_in"}))
async def confirm_verification(body: VerificationBody):
    await neon_auth.call("email-otp/verify-email", body={"email": body.email, "otp": body.code})
    return ApiSuccess(status=200, data=ActionData(next_action="sign_in"))


@router.post("/password-reset/request", operation_id="requestPasswordReset", response_model=ApiSuccess[ActionData],
    dependencies=Mutation, summary="Request a password-reset code", description=COOKIE_PROTOCOL +
    "JSON email. Identical accepted response for existing and unknown accounts. Never returns a code.",
    responses=success_example({"accepted": True, "next_action": "none"}))
async def request_reset(body: EmailBody):
    await auth_credentials.request_code(body, "forget-password")
    return ApiSuccess(status=200, data=ActionData())


@router.post("/password-reset/confirm", operation_id="confirmPasswordReset", response_model=ApiSuccess[ActionData],
    dependencies=Mutation, summary="Reset a password using its emailed code", description=COOKIE_PROTOCOL +
    "JSON email/code/password. Neon validates the single-use code and changes the password. "
    "Revokes this account's backend sessions. Requires a fresh login; does not change roles or Google identity.",
    responses=success_example({"accepted": True, "next_action": "sign_in"}))
async def confirm_reset(body: ResetBody, db: Database):
    await auth_credentials.reset_password(body, db)
    return ApiSuccess(status=200, data=ActionData(next_action="sign_in"))


@router.get("/session", operation_id="getAuthSession", response_model=ApiSuccess[SessionData],
    summary="Restore the current cookie session", description=COOKIE_PROTOCOL +
    "Requires the backend cookie; Authorization headers are rejected on this cookie-only endpoint. Revalidates Neon session; returns 401 when signed out. "
    "Does not extend absolute backend expiry. Verified identities receive their initialized application profile.",
    responses={200: {"content": {"application/json": {"example": SESSION_EXAMPLE}}}})
async def get_session(request: Request, db: Database, cookie: str | None = Security(session_cookie)):
    if request.headers.get("authorization") is not None:
        raise AppError(code="COOKIE_SESSION_REQUIRED", message="Use the backend session cookie without an Authorization header.", status_code=401)
    record, user = await sessions.resolve(request, db)
    profile = await bootstrap_profile(db, user.id, BootstrapBody()) if user.emailVerified else None
    return ApiSuccess(status=200, data=session_data(user, profile, record.expires_at))


@router.post("/logout", operation_id="logoutCustomer", response_model=ApiSuccess[LogoutData], dependencies=Mutation,
    summary="End the current backend cookie session", description=COOKIE_PROTOCOL +
    "No JSON body. Idempotent even if already signed out. Revokes the backend session before contacting Neon. "
    "provider_revoked=false reports an unconfirmed provider logout; previously issued bearer JWTs may live until expiry.",
    responses=success_example({"logged_out": True, "provider_revoked": True}))
async def logout(request: Request, response: Response, db: Database):
    return ApiSuccess(status=200, data=LogoutData(provider_revoked=await sessions.logout(request, response, db)))
