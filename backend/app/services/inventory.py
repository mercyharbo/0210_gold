from sqlalchemy import func, select, update
from app.models.catalog import Product
from app.models.commerce import Reservation
from app.services.commerce_common import now, reject


async def lock_products(session, identifiers):
    return {item.id: item for item in (await session.scalars(select(Product).where(
        Product.id.in_(identifiers)).order_by(Product.id).with_for_update().execution_options(populate_existing=True))).all()}


async def held_quantity(session, product_id):
    return await session.scalar(select(func.coalesce(func.sum(Reservation.quantity), 0)).where(
        Reservation.product_id == product_id, Reservation.status == "held", Reservation.expires_at > now()))


async def release_expired(session, product_ids):
    await session.execute(update(Reservation).where(Reservation.product_id.in_(product_ids),
        Reservation.status == "held", Reservation.expires_at <= now()).values(status="released"))


async def reserve(session, order, quantities, products):
    await release_expired(session, products)
    for product_id, quantity in quantities.items():
        if quantity > products[product_id].stock - await held_quantity(session, product_id):
            reject("INSUFFICIENT_STOCK", "Some items no longer have enough stock. Request a new quote.")
        session.add(Reservation(order_id=order.id, product_id=product_id, quantity=quantity,
                                status="held", expires_at=order.expires_at))


async def lock_order_inventory(session, order_id):
    identifiers = list((await session.scalars(select(Reservation.product_id).where(
        Reservation.order_id == order_id, Reservation.product_id.is_not(None)))).all())
    return await lock_products(session, identifiers)


async def release_order(session, order_id):
    await session.execute(update(Reservation).where(Reservation.order_id == order_id,
        Reservation.status == "held").values(status="released"))


async def consume_order(session, order, products):
    rows = (await session.scalars(select(Reservation).where(Reservation.order_id == order.id)
                                  .with_for_update().execution_options(populate_existing=True))).all()
    if not rows or order.status != "awaiting_payment" or order.expires_at <= now() or any(
        row.status != "held" or row.expires_at <= now() or row.product_id not in products or
        products[row.product_id].stock < row.quantity for row in rows
    ):
        return False
    for row in rows:
        products[row.product_id].stock -= row.quantity
        row.status = "consumed"
    return True
