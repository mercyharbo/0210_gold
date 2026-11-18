from decimal import Decimal
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.models.catalog import Banner, Category, GoldRate, Product, ProductOption
from app.models.media import Media, MediaLink
from app.schemas.catalog import BannerData, CategoryData, ProductData
from app.services.pricing import calculate_price
from app.services.storage import public_url
from app.services.inventory import held_quantity

MODELS = {"products": Product, "categories": Category, "banners": Banner}
LINK_FIELDS = {"products": "product_id", "categories": "category_id", "banners": "banner_id"}


def fail(code: str, message: str, status: int = 422, field: str | None = None):
    raise AppError(code=code, message=message, status_code=status,
                   field_errors={field: [message]} if field else None)


async def record(session: AsyncSession, kind: str, identifier: str):
    item = await session.get(MODELS[kind], identifier)
    if item is None:
        fail("NOT_FOUND", "This catalog record was not found.", 404)
    return item


async def rates(session: AsyncSession) -> dict[str, Decimal]:
    return {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}


async def images(session: AsyncSession, kind: str, identifier: str):
    rows = (await session.execute(select(MediaLink, Media).join(Media).where(
        getattr(MediaLink, LINK_FIELDS[kind]) == identifier).order_by(MediaLink.position))).all()
    return [{"media_id": media.id, "url": public_url(media.object_key), "alt": link.alt,
             "position": link.position} for link, media in rows]


async def output(session: AsyncSession, kind: str, item):
    data = {column.name: getattr(item, column.name) for column in item.__table__.columns}
    data["images"] = await images(session, kind, item.id)
    if kind == "products":
        options = (await session.scalars(select(ProductOption).where(
            ProductOption.product_id == item.id).order_by(ProductOption.position))).all()
        for field in ("sizes", "colors", "gold_karats"):
            data[field] = [option.value for option in options if option.kind == field]
        category = await session.get(Category, item.category_id)
        data["category"] = {"name": category.name, "slug": category.slug}
        data["display_price"] = calculate_price(item, await rates(session), data["gold_karats"])
        return ProductData.model_validate(data)
    return (CategoryData if kind == "categories" else BannerData).model_validate(data)


async def save(session: AsyncSession, kind: str, body, identifier: str | None = None):
    if kind == "products":
        from app.services.catalog_publication import publication
        await publication(session, body)
    item = None
    if identifier:
        item = await record(session, kind, identifier)
        if kind == "products":
            item = await session.scalar(select(Product).where(Product.id == identifier)
                .with_for_update().execution_options(populate_existing=True))
            if body.stock < await held_quantity(session, identifier):
                fail("STOCK_RESERVED", "Stock cannot be reduced below active order reservations.", 409, "stock")
    previous_stock = item.stock if kind == "products" and item else None
    data = body.model_dump(mode="json", exclude={"images", "sizes", "colors", "gold_karats"})
    if kind == "products":
        category = await session.get(Category, str(body.category_id))
        if not category or (body.status == "active" and not category.is_active):
            fail("INVALID_CATEGORY", "Choose an active category for published products.", field="category_id")
    requested_ids = [str(image.media_id) for image in body.images]
    media_rows = (await session.scalars(select(Media).where(Media.id.in_(requested_ids)).with_for_update())).all() if requested_ids else []
    expected_kind = {"products": "product", "categories": "category", "banners": "banner"}[kind]
    if len(set(requested_ids)) != len(requested_ids) or len(media_rows) != len(requested_ids) or any(
        not row.complete or row.kind != expected_kind for row in media_rows
    ):
        fail("INVALID_MEDIA", "Use completed uploads of the correct image type.", field="images")
    item = item or MODELS[kind]()
    for key, value in data.items():
        setattr(item, key, value)
    session.add(item)
    try:
        await session.flush()
        field = getattr(MediaLink, LINK_FIELDS[kind])
        await session.execute(delete(MediaLink).where(field == item.id))
        for position, image in enumerate(body.images):
            session.add(MediaLink(media_id=str(image.media_id), alt=image.alt, position=position,
                                  **{LINK_FIELDS[kind]: item.id}))
        if kind == "products":
            await session.execute(delete(ProductOption).where(ProductOption.product_id == item.id))
            for field in ("sizes", "colors", "gold_karats"):
                for position, value in enumerate(getattr(body, field)):
                    session.add(ProductOption(product_id=item.id, kind=field, value=value, position=position))
            if previous_stock and item.stock == 0:
                from uuid import uuid4
                from app.services.notifications import admins
                await admins(session, f"product:{item.id}:empty:{uuid4()}", "low_stock",
                    "A product is now out of stock.", item.id)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        fail("CATALOG_CONFLICT", "This slug is already used or a referenced record has changed.", 409, "slug")
    await session.refresh(item)
    return await output(session, kind, item)


async def remove(session: AsyncSession, kind: str, identifier: str):
    item = await record(session, kind, identifier)
    if kind == "products":
        item = await session.scalar(select(Product).where(Product.id == identifier).with_for_update())
        if await held_quantity(session, identifier):
            fail("STOCK_RESERVED", "This product has active order reservations and cannot be deleted.", 409)
    try:
        await session.delete(item)
        await session.commit()
    except IntegrityError:
        await session.rollback()
        fail("RECORD_IN_USE", "Remove or move the products using this category first.", 409)
    return {"deleted": True}


