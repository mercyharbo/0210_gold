"""Catalog records. Stock belongs to the product, never its selectable options."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CatalogRecord:
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Category(CatalogRecord, Base):
    __tablename__ = "catalog_categories"
    __table_args__ = (CheckConstraint("sort_order >= 0 AND featured_sort_order >= 0"),)
    name: Mapped[str] = mapped_column(String(150))
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    category_type: Mapped[str] = mapped_column(String(40))
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    featured_sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Product(CatalogRecord, Base):
    __tablename__ = "catalog_products"
    __table_args__ = (
        CheckConstraint("stock >= 0 AND making_charge >= 0"),
        CheckConstraint("price IS NULL OR price > 0"),
        CheckConstraint("gold_weight_grams IS NULL OR gold_weight_grams > 0"),
        CheckConstraint("status IN ('draft', 'active', 'archived')"),
        CheckConstraint("pricing_type IN ('fixed', 'starting_from', 'price_on_request')"),
    )
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("catalog_categories.id", ondelete="RESTRICT"), index=True)
    pricing_type: Mapped[str] = mapped_column(String(30))
    price: Mapped[Decimal | None] = mapped_column(Numeric(16, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    description: Mapped[str] = mapped_column(Text)
    label: Mapped[str | None] = mapped_column(String(40))
    details: Mapped[list] = mapped_column(JSON, default=list)
    gold_weight_grams: Mapped[Decimal | None] = mapped_column(Numeric(12, 3))
    making_charge: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=0)
    note: Mapped[str | None] = mapped_column(Text)
    is_gold_karat_priced: Mapped[bool] = mapped_column(Boolean, default=False)


class ProductOption(Base):
    __tablename__ = "catalog_product_options"
    __table_args__ = (UniqueConstraint("product_id", "kind", "value"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(ForeignKey("catalog_products.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(20))
    value: Mapped[str] = mapped_column(String(60))
    position: Mapped[int] = mapped_column(Integer)


class Banner(CatalogRecord, Base):
    __tablename__ = "catalog_banners"
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    route: Mapped[str] = mapped_column(String(300))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class CategoryPreference(Base):
    __tablename__ = "catalog_category_preferences"
    profile_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="CASCADE"), primary_key=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("catalog_categories.id", ondelete="CASCADE"), primary_key=True)


class StoreSettings(Base):
    __tablename__ = "catalog_settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    values: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class GoldRate(Base):
    __tablename__ = "catalog_gold_rates"
    __table_args__ = (CheckConstraint("rate > 0"), CheckConstraint("karat IN ('18k', '22k', '24k')"))
    karat: Mapped[str] = mapped_column(String(3), primary_key=True)
    rate: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
