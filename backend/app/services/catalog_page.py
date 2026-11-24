"""Bounded catalog reads: sort and paginate in PostgreSQL, then load associations in batches."""
from sqlalchemy import func, select

from app.models.catalog import Category, GoldRate, Product, ProductOption
from app.models.media import Media, MediaLink
from app.schemas.catalog import ProductData
from app.services.pricing import calculate_price
from app.services.storage import public_url
from app.schemas.catalog_filters import ProductFilters
from app.services.catalog_filters import product_query, product_ordering


async def product_page(session, *, public=True, filters: ProductFilters | None = None):
    filters = filters or ProductFilters()
    page, page_size = filters.page, filters.page_size
    query = product_query(filters, public=public)
    total = await session.scalar(select(func.count()).select_from(query.subquery()))
    ordering = product_ordering(filters)
    products = (await session.scalars(query.order_by(ordering, Product.id).offset((page - 1) * page_size).limit(page_size))).all()
    if not products:
        return {"items": [], "total": total, "page": page, "page_size": page_size}
    ids = [product.id for product in products]
    options = (await session.scalars(select(ProductOption).where(ProductOption.product_id.in_(ids)).order_by(ProductOption.position))).all()
    media = (await session.execute(select(MediaLink, Media).join(Media).where(
        MediaLink.product_id.in_(ids)).order_by(MediaLink.position))).all()
    categories = {row.id: row for row in (await session.scalars(select(Category).where(
        Category.id.in_({product.category_id for product in products})))).all()}
    rates = {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}
    items = []
    for product in products:
        data = {column.name: getattr(product, column.name) for column in product.__table__.columns}
        for field in ("sizes", "colors", "gold_karats"):
            data[field] = [option.value for option in options if option.product_id == product.id and option.kind == field]
        data["images"] = [{"media_id": image.id, "url": public_url(image.object_key), "alt": link.alt,
                           "position": link.position} for link, image in media if link.product_id == product.id]
        category_row = categories[product.category_id]
        data["category"] = {"name": category_row.name, "slug": category_row.slug}
        data["display_price"] = calculate_price(product, rates, data["gold_karats"])
        items.append(ProductData.model_validate(data))
    return {"items": items, "total": total, "page": page, "page_size": page_size}
