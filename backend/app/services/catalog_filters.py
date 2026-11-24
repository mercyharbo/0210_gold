"""SQL predicates shared by public/admin reads; filtering always precedes pagination."""
from sqlalchemy import case, func, select
from app.models.catalog import Category, GoldRate, Product, ProductOption
from app.models.commerce import Reservation
from app.schemas.catalog_filters import AdminProductFilters, ProductFilters
from app.services.commerce_common import now


def display_price_expression():
    minimum_rate = select(func.min(GoldRate.rate)).join(
        ProductOption, ProductOption.value == GoldRate.karat).where(
        ProductOption.product_id == Product.id, ProductOption.kind == "gold_karats").correlate(Product).scalar_subquery()
    gold_price = case((Product.gold_weight_grams != 0,
                      func.round(Product.gold_weight_grams * minimum_rate + Product.making_charge)), else_=None)
    return case((Product.pricing_type == "price_on_request", None),
                (Product.is_gold_karat_priced.is_(True), gold_price), else_=func.round(Product.price))


def available_stock_expression():
    held = select(func.coalesce(func.sum(Reservation.quantity), 0)).where(
        Reservation.product_id == Product.id, Reservation.status == "held",
        Reservation.expires_at > now()).correlate(Product).scalar_subquery()
    return Product.stock - held


def product_query(filters: ProductFilters, *, public=True):
    query = select(Product).join(Category)
    price = display_price_expression()
    if public:
        query = query.where(Product.status == "active", Category.is_active.is_(True))
    if filters.q:
        escaped = filters.q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.where(Product.name.ilike(f"%{escaped}%", escape="\\"))
    if filters.category:
        query = query.where(Category.slug == filters.category)
    if filters.category_type:
        query = query.where(Category.category_type == filters.category_type)
    for name in ("label", "pricing_type", "is_gold_karat_priced"):
        value = getattr(filters, name)
        if value is not None:
            query = query.where(getattr(Product, name) == value)
    for name, kind in (("gold_karat", "gold_karats"), ("size", "sizes"), ("color", "colors")):
        value = getattr(filters, name)
        if value is not None:
            query = query.where(select(ProductOption.id).where(ProductOption.product_id == Product.id,
                ProductOption.kind == kind, ProductOption.value == value).exists())
    if filters.min_price is not None:
        query = query.where(price >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(price <= filters.max_price)
    if filters.in_stock is not None:
        available = available_stock_expression()
        query = query.where(available > 0 if filters.in_stock else available <= 0)
    if not public and isinstance(filters, AdminProductFilters):
        if filters.status is not None:
            query = query.where(Product.status == filters.status)
        if filters.category_active is not None:
            query = query.where(Category.is_active == filters.category_active)
        if filters.stock_min is not None:
            query = query.where(Product.stock >= filters.stock_min)
        if filters.stock_max is not None:
            query = query.where(Product.stock <= filters.stock_max)
        if filters.created_from is not None:
            query = query.where(Product.created_at >= filters.created_from)
        if filters.created_to is not None:
            query = query.where(Product.created_at <= filters.created_to)
    return query


def product_ordering(filters: ProductFilters):
    price = display_price_expression()
    return {
        "newest": Product.created_at.desc(), "oldest": Product.created_at.asc(),
        "price_asc": price.asc().nullslast(), "price_desc": price.desc().nullslast(),
        "name": func.lower(Product.name).asc(), "name_desc": func.lower(Product.name).desc(),
        "stock_asc": Product.stock.asc(), "stock_desc": Product.stock.desc(), "updated_desc": Product.updated_at.desc(),
    }[filters.sort]
