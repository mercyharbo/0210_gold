from app.models.payments import PaymentAttempt
from app.services import bachs_provider
from app.services.commerce_common import reject
from app.services.orders import read_order
from app.services.payment_effects import apply_event


async def reconcile(session, identifier, actor_id):
    attempt = await session.get(PaymentAttempt, identifier)
    if not attempt:
        reject("PAYMENT_NOT_FOUND", "Payment attempt was not found.", 404)
    if not attempt.checkout_id:
        reject("PAYMENT_OUTCOME_UNKNOWN", "Retry the original payment initiation with its original idempotency key first.")
    provider = await bachs_provider.retrieve_session(attempt.checkout_id)
    if provider.get("checkout_id") != attempt.checkout_id or provider.get("reference") != attempt.id:
        reject("PROVIDER_REFERENCE_MISMATCH", "Bachs returned an unexpected payment reference.")
    if (provider.get("metadata") or {}).get("order_id", attempt.order_id) != attempt.order_id:
        reject("PROVIDER_REFERENCE_MISMATCH", "Bachs returned an unexpected order reference.")
    charge = provider.get("charge") or {}
    status = str(charge.get("status", provider.get("payment_status", ""))).lower()
    if status in {"succeeded", "paid"} and charge:
        data = {"checkout_id": attempt.checkout_id, "reference": attempt.id,
                "charge_id": charge.get("charge_id") or charge.get("payment_id") or charge.get("id"),
                "amount": charge.get("amount_paid") or charge.get("amount"),
                "currency": charge.get("currency"), "status": "SUCCEEDED"}
        await apply_event(session, attempt.id, "collection.succeeded", data, actor_id=actor_id, reconciliation=True)
    elif str(provider.get("status", "")).lower() == "expired":
        await apply_event(session, attempt.id, "checkout.expired", {"checkout_id": attempt.checkout_id,
            "reference": attempt.id}, actor_id=actor_id, reconciliation=True)
    else:
        from app.models.payments import PaymentAudit
        session.add(PaymentAudit(order_id=attempt.order_id, attempt_id=attempt.id,
                                kind="reconciliation_pending", actor_id=actor_id))
    await session.commit()
    return await read_order(session, attempt.order_id, admin=True)
