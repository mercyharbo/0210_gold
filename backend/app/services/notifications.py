from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from app.models.account import Notification
from app.models.profile import Profile
from app.models.commerce import Order
from app.models.payments import PaymentAttempt
from app.models.catalog import Product
from app.models.commerce import Reservation
from app.schemas.operations import NotificationData
from app.services.account import page_rows
from app.services.commerce_common import reject


async def emit(session, recipient_id, event_key, kind, message, resource_id, audience="customer"):
    await session.execute(insert(Notification).values(recipient_id=recipient_id, event_key=event_key,
        audience=audience, kind=kind, message=message, resource_id=resource_id)
        .on_conflict_do_nothing(index_elements=[Notification.recipient_id, Notification.event_key]))


async def admins(session, event_key, kind, message, resource_id):
    identifiers = (await session.scalars(select(Profile.id).where(Profile.role.in_(["admin", "super_admin"])))).all()
    for identifier in identifiers:
        await emit(session, identifier, event_key, kind, message, resource_id, "admin")


async def payment_state(session, attempt_id):
    attempt = await session.get(PaymentAttempt, attempt_id)
    order = await session.get(Order, attempt.order_id)
    if order.status == "paid":
        await emit(session, order.customer_id, f"order:{order.id}:paid", "payment", "Payment confirmed for your order.", order.id)
        products = (await session.scalars(select(Product).join(Reservation, Reservation.product_id == Product.id)
            .where(Reservation.order_id == order.id, Product.stock == 0))).all()
        for product in products:
            await admins(session, f"order:{order.id}:empty:{product.id}", "low_stock", "A product is now out of stock.", product.id)
    elif order.status == "payment_review":
        await admins(session, f"order:{order.id}:review:{order.review_reason}", "payment_exception",
            "An order payment requires administrator review.", order.id)


async def listing(session, recipient_id, audience, page, page_size, unread_only=False):
    query = select(Notification).where(Notification.recipient_id == recipient_id, Notification.audience == audience)
    if unread_only:
        query = query.where(Notification.is_read.is_(False))
    rows, meta = await page_rows(session, query.order_by(Notification.created_at.desc(), Notification.id), page, page_size)
    return {**meta, "items": [NotificationData.model_validate(row, from_attributes=True) for row in rows]}


async def mark_read(session, recipient_id, audience, identifier=None):
    query = update(Notification).where(Notification.recipient_id == recipient_id, Notification.audience == audience)
    if identifier:
        row = await session.scalar(select(Notification).where(Notification.id == identifier,
            Notification.recipient_id == recipient_id, Notification.audience == audience))
        if not row:
            reject("NOTIFICATION_NOT_FOUND", "Notification was not found.", 404)
        query = query.where(Notification.id == identifier)
    result = await session.execute(query.where(Notification.is_read.is_(False)).values(is_read=True))
    await session.commit()
    return {"changed": result.rowcount}
