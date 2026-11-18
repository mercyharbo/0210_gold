from sqlalchemy import select
from app.models.commerce import Order
from app.models.fulfilment import FulfilmentTransition
from app.services.commerce_common import reject
from app.services.notifications import emit
from app.services.orders import order_data

NEXT = {"unfulfilled": "processing", "processing": "shipped", "shipped": "delivered"}


async def transition(session, identifiers, body, actor_id):
    # Lock all orders in a stable order, then validate the entire batch before writes.
    rows = (await session.scalars(select(Order).where(Order.id.in_(identifiers)).order_by(Order.id)
        .with_for_update().execution_options(populate_existing=True))).all()
    if len(rows) != len(identifiers):
        reject("ORDER_NOT_FOUND", "One or more orders were not found.", 404)
    for row in rows:
        if row.status != "paid":
            reject("ORDER_NOT_PAID", "Only confirmed paid orders can be fulfilled.")
        if row.fulfilment_status == body.status:
            if body.status == "shipped" and (row.carrier != body.carrier or row.tracking_reference != body.tracking_reference):
                reject("TRACKING_CONFLICT", "The repeated shipping transition has different tracking details.")
        elif NEXT.get(row.fulfilment_status) != body.status:
            reject("INVALID_FULFILMENT_TRANSITION", "Fulfilment must move forward one step at a time.")
    for row in rows:
        if row.fulfilment_status == body.status:
            continue
        row.fulfilment_status = body.status
        if body.status == "shipped":
            row.carrier, row.tracking_reference = body.carrier, body.tracking_reference
        session.add(FulfilmentTransition(order_id=row.id, status=body.status, actor_id=actor_id,
            carrier=row.carrier, tracking_reference=row.tracking_reference))
        await emit(session, row.customer_id, f"order:{row.id}:fulfilment:{body.status}", "fulfilment",
            f"Your order is now {body.status}.", row.id)
    await session.commit()
    return [await order_data(session, row, admin=True) for row in rows]
