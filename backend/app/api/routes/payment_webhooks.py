from typing import Annotated
from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.commerce_docs import RESPONSES
from app.db.session import get_db_session
from app.schemas.envelope import ApiSuccess
from app.schemas.orders import WebhookResult
from app.services.commerce_common import reject
from app.services.webhook_payments import process_webhook

router = APIRouter(tags=["payment webhooks"])


@router.post("/webhooks/bachs", response_model=ApiSuccess[WebhookResult], operation_id="receiveBachsWebhook",
             responses={key: value for key, value in RESPONSES.items() if key not in (401, 404, 422)},
             summary="Receive signed Bachs sandbox events", description="Provider endpoint; no bearer token. Send directly to FastAPI. Reads untouched application/json bytes, maximum 256 KiB. Prefers V2 signatures with 300-second timestamp tolerance; supports legacy timestamp/signature headers. Validates configured merchant and sandbox environment. Stores event IDs and body hashes; retries are idempotent. collection.succeeded requires matching checkout, gross amount/currency and charge ID. checkout.completed alone never marks these positive-value orders paid.",
             openapi_extra={"requestBody": {"required": True, "content": {"application/json": {
                 "schema": {"$ref": "#/components/schemas/PaymentEvent"}}}}})
async def webhook(request: Request, session: Annotated[AsyncSession, Depends(get_db_session)],
                  signature_v2: Annotated[str | None, Header(alias="X-Bachs-Signature-V2", description="t=timestamp,v1=HMAC; all rotation signatures are checked.")] = None,
                  signature: Annotated[str | None, Header(alias="X-Bachs-Signature")] = None,
                  timestamp: Annotated[str | None, Header(alias="X-Bachs-Timestamp")] = None):
    raw = bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw) > 256 * 1024:
            reject("WEBHOOK_TOO_LARGE", "Webhook body exceeds 256 KiB.", 413)
    result = await process_webhook(session, bytes(raw), request.headers)
    return ApiSuccess(status=200, data=WebhookResult(**result))
