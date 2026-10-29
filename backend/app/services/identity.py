from fastapi import Depends
from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.tokens import require_subject
from app.core.config import get_settings
from app.core.errors import AppError
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.auth import BootstrapBody


async def verified_identity(session: AsyncSession, subject: str):
    identity = (await session.execute(text(
        'SELECT id, email, name, "emailVerified" FROM neon_auth."user" WHERE id = :id'
    ), {"id": subject})).mappings().first()
    if not identity:
        raise AppError(code="IDENTITY_NOT_FOUND", message="This account no longer exists.", status_code=401)
    if not identity["emailVerified"]:
        raise AppError(code="EMAIL_NOT_VERIFIED", message="Verify your email before continuing.", status_code=403)
    return identity


async def bootstrap_profile(session: AsyncSession, subject: str, body: BootstrapBody) -> Profile:
    identity = await verified_identity(session, subject)
    admin_email = get_settings().initial_admin_email
    role = "super_admin" if admin_email and identity["email"].casefold() == admin_email.strip().casefold() else "customer"
    # ON CONFLICT makes concurrent first logins idempotent and never overwrites roles.
    await session.execute(insert(Profile).values(
        id=subject, email=identity["email"], name=identity["name"] or "",
        first_name=body.first_name, last_name=body.last_name, phone=body.phone, role=role,
    ).on_conflict_do_nothing(index_elements=[Profile.id]))
    await session.commit()
    profile = await session.get(Profile, subject)
    assert profile is not None
    return profile


async def current_profile(
    subject: str = Depends(require_subject),
    session: AsyncSession = Depends(get_db_session),
) -> Profile:
    await verified_identity(session, subject)
    profile = await session.scalar(select(Profile).where(Profile.id == subject))
    if not profile:
        raise AppError(code="PROFILE_NOT_INITIALIZED", message="Initialize your profile to continue.", status_code=409)
    return profile


async def require_admin(profile: Profile = Depends(current_profile)) -> Profile:
    if profile.role not in {"admin", "super_admin"}:
        raise AppError(code="FORBIDDEN", message="Administrator access is required.", status_code=403)
    return profile
