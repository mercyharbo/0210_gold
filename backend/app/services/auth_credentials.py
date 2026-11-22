from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.auth_session import AuthSession
from app.schemas.authentication import EmailBody, ResetBody
from app.services import neon_auth


async def request_code(body: EmailBody, purpose: str):
    try:
        await neon_auth.call("email-otp/send-verification-otp", body={"email": body.email, "type": purpose})
    except AppError as exc:
        if exc.code not in {"INVALID_CODE", "ACCOUNT_EXISTS"}:
            raise


async def subject_for_email(db: AsyncSession, email: str) -> str | None:
    subject = await db.scalar(text('SELECT id FROM neon_auth."user" WHERE lower(email) = lower(:email)'), {"email": email})
    # Neon stores UUIDs; application subject columns deliberately use opaque strings.
    return str(subject) if subject is not None else None


async def reset_password(body: ResetBody, db: AsyncSession):
    await neon_auth.call("email-otp/reset-password", body={"email": body.email, "otp": body.code,
                                                         "password": body.password.get_secret_value()})
    subject = await subject_for_email(db, body.email)
    if subject:
        await db.execute(delete(AuthSession).where(AuthSession.subject == subject))
        await db.commit()
