from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import func, select
from app.models.account import Review
from app.models.catalog import Category, Product
from app.models.commerce import Order, OrderItem
from app.models.profile import Profile
from app.schemas.reviews import AdminReviewData, PublicReview, ReviewData
from app.services.account import page_rows
from app.services.commerce_common import advisory, reject
from app.services.notifications import admins, emit


def data(row, admin=False):
    return (AdminReviewData if admin else ReviewData).model_validate(row, from_attributes=True)


async def put(session, customer_id, product_id, body):
    await advisory(session, f"review:{customer_id}:{product_id}")
    if not await session.get(Product, product_id):
        reject("PRODUCT_NOT_FOUND", "Product was not found.", 404)
    paid = await session.scalar(select(OrderItem.id).join(Order).where(Order.customer_id == customer_id,
        Order.status == "paid", OrderItem.product_id == product_id).limit(1))
    if not paid:
        reject("PURCHASE_REQUIRED", "A paid order containing this product is required.", 403)
    row = await session.scalar(select(Review).where(Review.customer_id == customer_id, Review.product_id == product_id)
        .with_for_update().execution_options(populate_existing=True))
    if row and row.rating == body.rating and row.comment == body.comment:
        return data(row)
    if not row:
        row = Review(customer_id=customer_id, product_id=product_id, revision=1)
        session.add(row)
    else:
        row.revision += 1
    row.rating, row.comment, row.status = body.rating, body.comment, "pending"
    row.moderation_note, row.moderated_by = None, None
    await session.flush()
    await admins(session, f"review:{row.id}:{row.revision}:pending", "review", "A product review awaits moderation.", row.id)
    await session.commit()
    await session.refresh(row)
    return data(row)


async def remove(session, customer_id, product_id):
    await advisory(session, f"review:{customer_id}:{product_id}")
    row = await session.scalar(select(Review).where(Review.customer_id == customer_id, Review.product_id == product_id).with_for_update())
    if row:
        await session.delete(row)
    await session.commit()
    return {"deleted": True}


async def listing(session, page, page_size, customer_id=None, status=None, admin=False):
    query = select(Review)
    if customer_id:
        query = query.where(Review.customer_id == customer_id)
    if status:
        query = query.where(Review.status == status)
    rows, meta = await page_rows(session, query.order_by(Review.created_at.desc(), Review.id), page, page_size)
    return {**meta, "items": [data(row, admin) for row in rows]}


async def public_listing(session, slug, page, page_size):
    product = await session.scalar(select(Product).join(Category).where(Product.slug == slug,
        Product.status == "active", Category.is_active.is_(True)))
    if not product:
        reject("PRODUCT_NOT_FOUND", "Product was not found.", 404)
    query = select(Review).where(Review.product_id == product.id, Review.status == "approved")
    average = await session.scalar(select(func.avg(Review.rating)).where(Review.product_id == product.id, Review.status == "approved"))
    rows, meta = await page_rows(session, query.order_by(Review.created_at.desc(), Review.id), page, page_size)
    authors = {row.id: row for row in (await session.scalars(select(Profile).where(
        Profile.id.in_([review.customer_id for review in rows])))).all()}
    items = []
    for row in rows:
        name = authors[row.customer_id].first_name or "Customer"
        name = name.split()[0] if name.strip() and "@" not in name else "Customer"
        items.append(PublicReview(id=row.id, rating=row.rating, comment=row.comment, author_name=name, created_at=row.created_at))
    return {**meta, "items": items, "rating_count": meta["total"],
        "average_rating": str(Decimal(average).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)) if average is not None else None}


async def moderate(session, identifiers, body, actor_id):
    rows = (await session.scalars(select(Review).where(Review.id.in_(identifiers)).order_by(Review.id)
        .with_for_update().execution_options(populate_existing=True))).all()
    if len(rows) != len(identifiers):
        reject("REVIEW_NOT_FOUND", "One or more reviews were not found.", 404)
    for row in rows:
        if row.status == body.status and row.moderation_note == body.moderation_note:
            continue
        changed = row.status != body.status
        row.status, row.moderation_note, row.moderated_by = body.status, body.moderation_note, actor_id
        row.revision += 1
        if changed:
            await emit(session, row.customer_id, f"review:{row.id}:{row.revision}:{row.status}", "review",
                f"Your product review was {row.status}.", row.id)
    await session.commit()
    for row in rows:
        await session.refresh(row)
    return [data(row, True) for row in rows]
