from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from app.models.account import Wishlist
from app.models.catalog import Category, GoldRate, Product, ProductOption
from app.models.media import Media, MediaLink
from app.services.account import page_rows
from app.services.commerce_common import reject
from app.services.pricing import calculate_price
from app.services.storage import public_url


async def membership(session, customer_id, product_id, add):
    if add:
        product = await session.scalar(select(Product).join(Category).where(Product.id == product_id,
            Product.status == "active", Category.is_active.is_(True)))
        if not product:
            reject("PRODUCT_NOT_FOUND", "Product was not found.", 404)
        changed = await session.scalar(insert(Wishlist).values(customer_id=customer_id, product_id=product_id)
            .on_conflict_do_nothing(index_elements=[Wishlist.customer_id, Wishlist.product_id]).returning(Wishlist.product_id))
    else:
        changed = await session.scalar(delete(Wishlist).where(Wishlist.customer_id == customer_id,
            Wishlist.product_id == product_id).returning(Wishlist.product_id))
    await session.commit()
    return {"changed": int(changed is not None)}


async def listing(session, customer_id, page, page_size):
    query = select(Wishlist).where(Wishlist.customer_id == customer_id).order_by(Wishlist.created_at.desc(), Wishlist.product_id)
    rows, meta = await page_rows(session, query, page, page_size)
    ids = [row.product_id for row in rows]
    products = {row.id: row for row in (await session.scalars(select(Product).where(Product.id.in_(ids)))).all()}
    categories = {row.id: row for row in (await session.scalars(select(Category).where(
        Category.id.in_([product.category_id for product in products.values()])))).all()}
    rates = {row.karat: row.rate for row in (await session.scalars(select(GoldRate))).all()}
    options = (await session.scalars(select(ProductOption).where(ProductOption.product_id.in_(ids),
        ProductOption.kind == "gold_karats"))).all()
    media = (await session.execute(select(MediaLink, Media).join(Media).where(MediaLink.product_id.in_(ids))
        .order_by(MediaLink.position, MediaLink.id))).all()
    images = {}
    for link, image in media:
        images.setdefault(link.product_id, (public_url(image.object_key), link.alt))
    items = []
    for row in rows:
        product = products[row.product_id]
        price = calculate_price(product, rates, [option.value for option in options if option.product_id == product.id])
        image_url, image_alt = images.get(product.id, (None, None))
        items.append({"product_id": product.id, "name": product.name, "slug": product.slug,
            "display_price": price, "image_url": image_url, "image_alt": image_alt,
            "available": product.status == "active" and categories[product.category_id].is_active and
                product.stock > 0 and price.available, "created_at": row.created_at})
    return {**meta, "items": items}
