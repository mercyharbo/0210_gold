from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.commerce import new_id


class Address(Base):
    __tablename__ = "account_addresses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    customer_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="CASCADE"), index=True)
    label: Mapped[str | None] = mapped_column(String(100))
    recipient_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(40))
    address_line_1: Mapped[str] = mapped_column(String(1000))
    address_line_2: Mapped[str | None] = mapped_column(String(1000))
    state: Mapped[str] = mapped_column(String(100))
    local_area: Mapped[str] = mapped_column(String(100))
    locality: Mapped[str | None] = mapped_column(String(150))
    postal_code: Mapped[str | None] = mapped_column(String(20))
    delivery_notes: Mapped[str | None] = mapped_column(String(1000))
    country: Mapped[str] = mapped_column(String(20), default="Nigeria")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (Index("uq_address_default_customer", "customer_id", unique=True,
        postgresql_where=text("is_default = true")),)


class Wishlist(Base):
    __tablename__ = "account_wishlist"
    customer_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="CASCADE"), primary_key=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("catalog_products.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Review(Base):
    __tablename__ = "account_reviews"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    customer_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="RESTRICT"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("catalog_products.id", ondelete="CASCADE"), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(String(2000))
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    moderation_note: Mapped[str | None] = mapped_column(String(2000))
    moderated_by: Mapped[str | None] = mapped_column(String(255))
    revision: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    __table_args__ = (UniqueConstraint("customer_id", "product_id"),
        CheckConstraint("rating BETWEEN 1 AND 5"), CheckConstraint("status IN ('pending','approved','rejected')"))


class Notification(Base):
    __tablename__ = "account_notifications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id", ondelete="CASCADE"), index=True)
    event_key: Mapped[str] = mapped_column(String(300))
    audience: Mapped[str] = mapped_column(String(10))
    kind: Mapped[str] = mapped_column(String(40))
    message: Mapped[str] = mapped_column(Text)
    resource_id: Mapped[str] = mapped_column(String(36))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint("recipient_id", "event_key"), CheckConstraint("audience IN ('customer','admin')"))
