from datetime import timedelta
from sqlalchemy import select
from app.models.commerce import Order, OrderItem, Quote
from app.models.payments import PaymentAttempt, PaymentAudit
from app.schemas.checkout import QuoteBody
from app.schemas.orders import AdminOrderData, OrderData, AttemptData, AuditData
from app.services.commerce_common import advisory, digest, now, owned_order, reject
from app.services.inventory import lock_products, reserve, lock_order_inventory, release_order
from app.services.quotes import price_cart
from app.models.fulfilment import FulfilmentTransition
from app.schemas.operations import AdminTransitionData, TransitionData


async def create_order(session, customer, body, request_key):
    fingerprint = digest(body.model_dump(mode="json"))
    await advisory(session, f"order:{customer.id}:{request_key}")
    existing = await session.scalar(select(Order).where(Order.customer_id == customer.id, Order.request_key == request_key))
    if existing:
        if existing.request_hash != fingerprint:
            reject("IDEMPOTENCY_CONFLICT", "This idempotency key was already used with a different request.")
        return await order_data(session, existing)
    quote = await session.scalar(select(Quote).where(Quote.id == str(body.quote_id), Quote.customer_id == customer.id).with_for_update())
    if not quote:
        reject("QUOTE_NOT_FOUND", "Quote was not found.", 404)
    if await session.scalar(select(Order.id).where(Order.quote_id == quote.id)):
        reject("QUOTE_ALREADY_USED", "This quote already has an order.")
    if quote.expires_at <= now():
        reject("QUOTE_EXPIRED", "Request a new quote before ordering.")
    cart = QuoteBody.model_validate(quote.request)
    products = await lock_products(session, [str(line.product_id) for line in cart.items])
    snapshot, quantities = await price_cart(session, cart, products)
    if digest(snapshot) != digest(quote.snapshot):
        reject("QUOTE_CHANGED", "Prices or product details changed. Request and review a new quote.")
    order = Order(customer_id=customer.id, quote_id=quote.id, request_key=request_key, request_hash=fingerprint,
                  customer_email=customer.email, shipping=snapshot["shipping"], subtotal=snapshot["subtotal"],
                  delivery=snapshot["delivery"], total=snapshot["total"], currency="NGN",
                  status="awaiting_payment", expires_at=now() + timedelta(minutes=30))
    session.add(order)
    await session.flush()
    for position, line in enumerate(snapshot["items"]):
        session.add(OrderItem(order_id=order.id, product_id=line["product_id"], quantity=line["quantity"],
                              unit_price=line["unit_price"], snapshot=line, position=position))
    await reserve(session, order, quantities, products)
    session.add(PaymentAudit(order_id=order.id, kind="order_created", actor_id=customer.id))
    await session.commit()
    await session.refresh(order)
    return await order_data(session, order)


async def expire_order(session, order):
    if order.status == "awaiting_payment" and order.expires_at <= now():
        await release_order(session, order.id)
        order.status = "expired"
        session.add(PaymentAudit(order_id=order.id, kind="reservation_expired"))


async def read_order(session, identifier, customer_id=None, admin=False):
    await owned_order(session, identifier, customer_id)
    await lock_order_inventory(session, identifier)
    order = await owned_order(session, identifier, customer_id, lock=True)
    await expire_order(session, order)
    await session.commit()
    return await order_data(session, order, admin)


async def cancel_order(session, identifier, customer_id):
    await owned_order(session, identifier, customer_id)
    await lock_order_inventory(session, identifier)
    order = await owned_order(session, identifier, customer_id, lock=True)
    await expire_order(session, order)
    if order.status in ("paid", "payment_review"):
        reject("ORDER_NOT_CANCELLABLE", "A paid order or payment under review cannot be cancelled here.")
    if order.status == "awaiting_payment":
        await release_order(session, identifier)
        order.status = "cancelled"
        session.add(PaymentAudit(order_id=identifier, kind="customer_cancelled", actor_id=customer_id))
    await session.commit()
    return await order_data(session, order)


async def order_data(session, order, admin=False):
    transitions = (await session.scalars(select(FulfilmentTransition).where(FulfilmentTransition.order_id == order.id)
        .order_by(FulfilmentTransition.created_at, FulfilmentTransition.id))).all()
    items = (await session.scalars(select(OrderItem).where(OrderItem.order_id == order.id).order_by(OrderItem.position))).all()
    attempts = (await session.scalars(select(PaymentAttempt).where(PaymentAttempt.order_id == order.id)
                                     .order_by(PaymentAttempt.created_at))).all()
    data = dict(id=order.id, status=order.status, review_reason=order.review_reason,
                items=[item.snapshot for item in items], shipping=order.shipping,
                subtotal=order.subtotal, delivery=order.delivery, total=order.total, currency=order.currency,
                expires_at=order.expires_at, created_at=order.created_at,
                payment_attempts=[AttemptData.model_validate(attempt, from_attributes=True) for attempt in attempts],
                fulfilment_status=order.fulfilment_status, carrier=order.carrier, tracking_reference=order.tracking_reference,
                fulfilment_history=[TransitionData.model_validate(row, from_attributes=True) for row in transitions])
    if admin:
        data["fulfilment_history"] = [AdminTransitionData.model_validate(row, from_attributes=True) for row in transitions]
        audit = (await session.scalars(select(PaymentAudit).where(PaymentAudit.order_id == order.id)
                                      .order_by(PaymentAudit.created_at))).all()
        return AdminOrderData(**data, customer_id=order.customer_id, customer_email=order.customer_email,
                              audit=[AuditData.model_validate(row, from_attributes=True) for row in audit])
    return OrderData(**data)
