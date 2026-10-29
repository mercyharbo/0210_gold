from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.tokens import require_subject
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.auth import BootstrapBody, ProfileData
from app.schemas.envelope import ApiSuccess
from app.schemas.auth_responses import ADMIN_SUCCESS, AUTH_RESPONSES, INVALID_FIELDS, NOT_INITIALIZED
from app.services.identity import bootstrap_profile, current_profile, require_admin

router = APIRouter(tags=["identity"], responses=AUTH_RESPONSES)


@router.post("/auth/bootstrap", operation_id="bootstrapProfile", response_model=ApiSuccess[ProfileData],
             responses={422: INVALID_FIELDS},
             summary="Initialize the signed-in customer's application profile",
             description="Requires a verified Neon identity. Creates one profile per subject; retries return the existing profile. "
             "Never updates an existing role or profile. Initial admin email is server configuration only. Send {} when no optional names are available.")
async def bootstrap(body: BootstrapBody, subject: str = Depends(require_subject),
                    session: AsyncSession = Depends(get_db_session)):
    profile = await bootstrap_profile(session, subject, body)
    return ApiSuccess(status=200, data=ProfileData.model_validate(profile))


@router.get("/auth/me", operation_id="getCurrentProfile", response_model=ApiSuccess[ProfileData],
            responses={409: NOT_INITIALIZED},
            summary="Read your profile and current database role",
            description="No body or query parameters. Identity is taken exclusively from the bearer token. Never returns another user's profile.")
async def me(profile: Profile = Depends(current_profile)):
    return ApiSuccess(status=200, data=ProfileData.model_validate(profile))


@router.get("/admin/auth-check", operation_id="checkAdminAccess", response_model=ApiSuccess[ProfileData],
            responses={200: ADMIN_SUCCESS, 409: NOT_INITIALIZED},
            summary="Verify administrator access", description="Requires a verified identity and an admin or super_admin application role.")
async def admin_check(profile: Profile = Depends(require_admin)):
    return ApiSuccess(status=200, data=ProfileData.model_validate(profile))
