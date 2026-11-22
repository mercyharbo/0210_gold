from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.authentication_docs import AUTHENTICATION_RESPONSES, COOKIE_PROTOCOL, success_example
from app.api.routes.authentication import csrf_required
from app.auth import oauth
from app.db.session import get_db_session
from app.schemas.authentication import GoogleData
from app.schemas.envelope import ApiSuccess

router = APIRouter(prefix="/auth/google", tags=["authentication"], responses=AUTHENTICATION_RESPONSES)


@router.post("/start", operation_id="startGoogleLogin", response_model=ApiSuccess[GoogleData],
    dependencies=[Depends(csrf_required)], summary="Begin Google authentication",
    description=COOKIE_PROTOCOL + "No JSON body. Returns authorization_url; navigate the browser there. "
    "Sets a separate HttpOnly OAuth binding cookie, valid for 10 minutes. No client-selected return URLs. "
    "Neon's Google callback remains at NEON_AUTH_BASE_URL/callback/google; the later application callback is this API.",
    responses=success_example({"authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?example=sanitized", "expires_in": 600}))
async def start(request: Request, response: Response, db: AsyncSession = Depends(get_db_session)):
    url = await oauth.start(request, response, db)
    return ApiSuccess(status=200, data=GoogleData(authorization_url=url))


@router.get("/callback", operation_id="completeGoogleLogin", response_class=RedirectResponse,
    status_code=303, summary="Complete the browser-bound Google authentication transaction",
    description="OAuth browser navigation only. Requires state query and OAuth binding cookie from start; "
    "Neon appends neon_auth_session_verifier. Exchanges it server-side, consumes the transaction once, "
    "sets the backend session cookie and redirects to AUTH_FRONTEND_URL + AUTH_SUCCESS_PATH. "
    "Errors return the documented JSON envelope, never reflect provider error text or redirect to arbitrary URLs. "
    "Callback URLs contain sensitive verifier values: disable or redact proxy/server access-log query strings.",
    responses={303: {"description": "Session established; navigate to the configured application destination.",
        "headers": {"Location": {"schema": {"type": "string"}, "description": "Fixed configured application destination."},
                    "Set-Cookie": {"schema": {"type": "string"}, "description": "HttpOnly backend session cookie; clears OAuth binding."}}}})
async def callback(request: Request,
                   state: Annotated[str, Query(min_length=20, max_length=128, description="Opaque transaction state; never generate it in the frontend.")],
                   neon_auth_session_verifier: Annotated[str | None, Query(max_length=4096, description="Single-use verifier supplied by Neon.")] = None,
                   error: Annotated[str | None, Query(max_length=1000, description="Provider failure marker; contents are never reflected.")] = None,
                   db: AsyncSession = Depends(get_db_session)):
    response = RedirectResponse(oauth.frontend_destination(), status_code=303, headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"})
    await oauth.complete(request, response, db, state, neon_auth_session_verifier, error)
    return response
