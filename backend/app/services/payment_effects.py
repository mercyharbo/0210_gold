from decimal import Decimal, InvalidOperation
from sqlalchemy import select
from app.models.payments import PaymentAttempt, PaymentAudit
from app.services.commerce_common import advisory, owned_order, reject
from app.services.inventory import consume_order, lock_order_inventory, release_order


def amount(value):
    try:
        result = Decimal(str(value))
        return result if result.is_finite() and result >= 0 and result.as_tuple().exponent >= -2 else None
    except (InvalidOperation, ValueError):
        return None


async def find_attempt(session, data):
    checkout_id = data.get("checkout_id")
    reference = data.get("reference")
    attempt = await session.scalar(select(PaymentAttempt).where(PaymentAttempt.checkout_id == checkout_id)) if checkout_id else None
    if not attempt and reference:
        attempt = await session.get(PaymentAttempt, reference)
    return attempt


async def apply_event(session, attempt_id, event_type, data, event_id=None, actor_id=None, reconciliation=False):
    outcome = await _apply_event(session, attempt_id, event_type, data, event_id, actor_id, reconciliation)
    from app.services.notifications import payment_state
    await payment_state(session, attempt_id)
    return outcome


async def _apply_event(session, attempt_id, event_type, data, event_id=None, actor_id=None, reconciliation=False):
    initial = await session.get(PaymentAttempt, attempt_id)
    if not initial:
        reject("PAYMENT_NOT_FOUND", "Payment attempt was not found.", 404)
    products = await lock_order_inventory(session, initial.order_id)
    order = await owned_order(session, initial.order_id, lock=True)
    attempt = await session.scalar(select(PaymentAttempt).where(PaymentAttempt.id == attempt_id)
                                  .with_for_update().execution_options(populate_existing=True))
    checkout_id = data.get("checkout_id")
    if not checkout_id or (attempt.checkout_id and checkout_id != attempt.checkout_id):
        reason = "CHECKOUT_MISMATCH"
    elif data.get("reference") not in (None, attempt.id) or (data.get("metadata") or {}).get("order_id", order.id) != order.id:
        reason = "REFERENCE_MISMATCH"
    elif event_type == "collection.succeeded":
        reason = "AMOUNT_MISMATCH" if amount(data.get("amount")) != order.total else None
        if data.get("currency") != order.currency:
            reason = "CURRENCY_MISMATCH"
        if str(data.get("status", "")).upper() != "SUCCEEDED":
            reason = "STATUS_MISMATCH"
        if data.get("fee_bearer") not in (None, "merchant"):
            reason = "FEE_BEARER_MISMATCH"
    elif event_type == "collection.underpaid":
        reason = "UNDERPAID"
    else:
        reason = None
    if reason:
        if order.status != "paid":
            order.status, order.review_reason = "payment_review", reason
        session.add(PaymentAudit(order_id=order.id, attempt_id=attempt.id, event_id=event_id,
                                kind=reason, amount=amount(data.get("amount")), currency=str(data.get("currency", ""))[:10],
                                actor_id=actor_id))
        return reason
    if not attempt.checkout_id:
        attempt.checkout_id = checkout_id
    if event_type == "collection.succeeded":
        charge_id = data.get("charge_id")
        if not isinstance(charge_id, str) or not charge_id:
            if order.status != "paid":
                order.status, order.review_reason = "payment_review", "MISSING_CHARGE_ID"
            session.add(PaymentAudit(order_id=order.id, attempt_id=attempt.id, event_id=event_id, kind="MISSING_CHARGE_ID"))
            return "MISSING_CHARGE_ID"
        await advisory(session, f"charge:{charge_id}")
        previous = await session.scalar(select(PaymentAudit).where(PaymentAudit.charge_id == charge_id))
        if previous:
            if previous.order_id != order.id:
                order.status, order.review_reason = "payment_review", "CHARGE_ALREADY_ASSIGNED"
                session.add(PaymentAudit(order_id=order.id, attempt_id=attempt.id, event_id=event_id, kind="CHARGE_ALREADY_ASSIGNED"))
                return "CHARGE_ALREADY_ASSIGNED"
            return "duplicate"
        existing_success = await session.scalar(select(PaymentAudit.id).where(PaymentAudit.order_id == order.id,
                                                                            PaymentAudit.charge_id.is_not(None)))
        if existing_success:
            order.status, order.review_reason = "payment_review", "ADDITIONAL_PAYMENT"
        else:
            if order.status == "payment_review" and (reconciliation or order.review_reason == "UNDERPAID"):
                order.status = "awaiting_payment"
            if await consume_order(session, order, products):
                order.status, order.review_reason = "paid", None
            else:
                order.status, order.review_reason = "payment_review", "PAYMENT_AFTER_STOCK_RELEASE"
                await release_order(session, order.id)
        attempt.status = "succeeded"
        session.add(PaymentAudit(order_id=order.id, attempt_id=attempt.id, event_id=event_id,
                                charge_id=charge_id, kind="payment_received", amount=order.total,
                                currency=order.currency, actor_id=actor_id))
        return "applied" if order.status == "paid" else order.review_reason
    if order.status == "paid" or attempt.status == "succeeded":
        return "ignored"
    if event_type == "checkout.expired":
        attempt.status = "expired"
        if order.status == "awaiting_payment":
            order.status = "expired"
            await release_order(session, order.id)
    # A failed charge can be retried inside the same checkout; keep its reservation.
    session.add(PaymentAudit(order_id=order.id, attempt_id=attempt.id, event_id=event_id, kind=event_type,
                            actor_id=actor_id))
    return "applied"
