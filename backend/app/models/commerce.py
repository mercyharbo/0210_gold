"""Durable checkout snapshots and product-level inventory holds."""
from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, JSON, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


def new_id():
    return str(uuid4())


class Quote(Base):
    __tablename__ = "commerce_quotes"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    customer_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="RESTRICT"), index=True)
    request: Mapped[dict] = mapped_column(JSON)
    snapshot: Mapped[dict] = mapped_column(JSON)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "commerce_orders"
    __table_args__ = (
        UniqueConstraint("customer_id", "request_key"),
        CheckConstraint("subtotal >= 0 AND delivery >= 0 AND total > 0"),
        CheckConstraint("status IN ('awaiting_payment','paid','cancelled','expired','payment_review')"),
        CheckConstraint("fulfilment_status IN ('unfulfilled','processing','shipped','delivered')", name="order_fulfilment_status"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    customer_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="RESTRICT"), index=True)
    quote_id: Mapped[str] = mapped_column(ForeignKey("commerce_quotes.id", ondelete="RESTRICT"), unique=True)
    request_key: Mapped[str] = mapped_column(String(128))
    request_hash: Mapped[str] = mapped_column(String(64))
    customer_email: Mapped[str] = mapped_column(String(320))
    shipping: Mapped[dict] = mapped_column(JSON)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    delivery: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(String(3), default="NGN")
    status: Mapped[str] = mapped_column(String(24), default="awaiting_payment", index=True)
    review_reason: Mapped[str | None] = mapped_column(String(100))
    fulfilment_status: Mapped[str] = mapped_column(String(20), default="unfulfilled", server_default="unfulfilled")
    carrier: Mapped[str | None] = mapped_column(String(100))
    tracking_reference: Mapped[str | None] = mapped_column(String(200))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "commerce_order_items"
    __table_args__ = (CheckConstraint("quantity > 0 AND unit_price > 0"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("commerce_orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("catalog_products.id", ondelete="SET NULL"))
    snapshot: Mapped[dict] = mapped_column(JSON)
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    position: Mapped[int] = mapped_column(Integer)


class Reservation(Base):
    __tablename__ = "commerce_reservations"
    __table_args__ = (
        UniqueConstraint("order_id", "product_id"), CheckConstraint("quantity > 0"),
        CheckConstraint("status IN ('held','consumed','released')"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("commerce_orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("catalog_products.id", ondelete="SET NULL"), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(12), default="held")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
