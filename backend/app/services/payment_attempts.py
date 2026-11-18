import math
from datetime import datetime
from sqlalchemy import select
from app.core.config import get_settings
from app.models.payments import PaymentAttempt, PaymentAudit
from app.models.commerce import new_id
from app.schemas.orders import AttemptData
from app.services import bachs_provider
from app.services.commerce_common import advisory, now, owned_order, reject


async def initiate(session, identifier, customer, request_key):
    bachs_provider.configured()
    order = await owned_order(session, identifier, customer.id, lock=True)
    attempt = await session.scalar(select(PaymentAttempt).where(
        PaymentAttempt.order_id == identifier, PaymentAttempt.request_key == request_key))
    if not attempt:
        if order.status != "awaiting_payment" or (order.expires_at - now()).total_seconds() < 60:
            reject("ORDER_NOT_PAYABLE", "This order cannot start another payment. Request a new quote if expired.")
        pending = await session.scalar(select(PaymentAttempt.id).where(PaymentAttempt.order_id == identifier,
            PaymentAttempt.status.in_(["initiating", "unknown", "pending"])))
        if pending:
            reject("PAYMENT_ALREADY_PENDING", "Reuse the existing payment attempt and its idempotency key.")
        settings = get_settings()
        attempt_id = new_id()
        minutes = max(1, min(30, math.floor((order.expires_at - now()).total_seconds() / 60)))
        payload = {"pricing": {"currency": "NGN", "amount": format(order.total, '.2f')},
                   "customer": {"email": order.customer_email, "name": order.shipping["name"],
                                "phone_number": order.shipping["phone"]},
                   "reference": attempt_id, "metadata": {"order_id": order.id, "attempt_id": attempt_id},
                   "success_url": settings.bachs_success_url, "cancel_url": settings.bachs_cancel_url,
                   "expires_in_minutes": minutes}
        attempt = PaymentAttempt(id=attempt_id, order_id=identifier, request_key=request_key,
                                 provider_request=payload, expires_at=order.expires_at, status="initiating")
        session.add(attempt)
        session.add(PaymentAudit(order_id=identifier, attempt_id=attempt_id, kind="payment_initiated", actor_id=customer.id))
    await session.commit()  # Durable before contacting Bachs; a lost response never loses the provider key.
    await advisory(session, f"payment-request:{attempt.id}")
    attempt = await session.scalar(select(PaymentAttempt).where(PaymentAttempt.id == attempt.id)
                                  .with_for_update().execution_options(populate_existing=True))
    if attempt.status in ("pending", "succeeded", "failed", "expired"):
        return AttemptData.model_validate(attempt, from_attributes=True)
    try:
        result = await bachs_provider.create_session(attempt.provider_request, f"fm-luxe-{attempt.id}")
    except bachs_provider.ProviderFailure as failure:
        attempt.status = "unknown" if failure.unknown else "failed"
        session.add(PaymentAudit(order_id=identifier, attempt_id=attempt.id, kind=f"provider_{attempt.status}"))
        await session.commit()
        reject("PAYMENT_OUTCOME_UNKNOWN" if failure.unknown else "PAYMENT_START_FAILED",
               "Payment initiation could not be confirmed. Retry with the same idempotency key." if failure.unknown
               else "Bachs could not create this checkout session. Check payment configuration.", 503)
    attempt.checkout_id = result["checkout_id"]
    attempt.checkout_url = result["checkout_url"]
    attempt.expires_at = min(attempt.expires_at, datetime.fromisoformat(result["expires_at"].replace("Z", "+00:00")))
    attempt.status = "pending"
    await session.commit()
    return AttemptData.model_validate(attempt, from_attributes=True)
