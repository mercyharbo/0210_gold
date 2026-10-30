from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Media(Base):
    __tablename__ = "catalog_media"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    object_key: Mapped[str] = mapped_column(String(500), unique=True)
    kind: Mapped[str] = mapped_column(String(20))
    content_type: Mapped[str] = mapped_column(String(40))
    size: Mapped[int] = mapped_column(Integer)
    owner_id: Mapped[str] = mapped_column(ForeignKey("app_profiles.id"))
    complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MediaLink(Base):
    __tablename__ = "catalog_media_links"
    __table_args__ = (
        CheckConstraint("(CASE WHEN product_id IS NULL THEN 0 ELSE 1 END + "
                        "CASE WHEN category_id IS NULL THEN 0 ELSE 1 END + "
                        "CASE WHEN banner_id IS NULL THEN 0 ELSE 1 END) = 1"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    media_id: Mapped[str] = mapped_column(ForeignKey("catalog_media.id", ondelete="RESTRICT"), index=True)
    product_id: Mapped[str | None] = mapped_column(ForeignKey("catalog_products.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("catalog_categories.id", ondelete="CASCADE"), index=True)
    banner_id: Mapped[str | None] = mapped_column(ForeignKey("catalog_banners.id", ondelete="CASCADE"), index=True)
    alt: Mapped[str] = mapped_column(String(300))
    position: Mapped[int] = mapped_column(Integer, default=0)
