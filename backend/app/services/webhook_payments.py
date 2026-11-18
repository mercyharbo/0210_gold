import hashlib
from pydantic import ValidationError
from app.core.config import get_settings
from app.models.payments import WebhookEvent
from app.schemas.payment_events import PaymentEvent
from app.services.bachs_provider import verify_webhook
from app.services.commerce_common import advisory, reject
from app.services.payment_effects import apply_event, find_attempt

EVENTS = {"collection.succeeded", "collection.failed", "collection.underpaid", "checkout.expired"}


async def process_webhook(session, raw, headers):
    envelope = verify_webhook(raw, headers)
    try:
        event = PaymentEvent.model_validate(envelope)
    except ValidationError:
        reject("INVALID_WEBHOOK_PAYLOAD", "The signed webhook payload has invalid fields.", 400)
    settings = get_settings()
    if event.organization_id != settings.bachs_organization_id or event.livemode or event.environment not in (None, "sandbox"):
        reject("WEBHOOK_ACCOUNT_MISMATCH", "Webhook merchant or environment does not match.", 403)
    body_hash = hashlib.sha256(raw).hexdigest()
    await advisory(session, f"webhook:{event.id}")
    existing = await session.get(WebhookEvent, event.id)
    if existing:
        if existing.body_hash != body_hash:
            reject("WEBHOOK_EVENT_CONFLICT", "This event ID was already received with different contents.")
        return {"received": True, "outcome": "duplicate"}
    row = WebhookEvent(id=event.id, body_hash=body_hash, event_type=event.type, outcome="ignored")
    session.add(row)
    await session.flush()
    if event.type in EVENTS:
        data = event.data.model_dump(exclude_none=True)
        attempt = await find_attempt(session, data)
        if not attempt:
            # Retryable: provider may deliver before our initiation transaction is visible.
            reject("WEBHOOK_ATTEMPT_NOT_READY", "Payment attempt cannot be matched yet; retry delivery.", 503)
        row.outcome = await apply_event(session, attempt.id, event.type, data, event_id=event.id)
    await session.commit()
    return {"received": True, "outcome": row.outcome}
