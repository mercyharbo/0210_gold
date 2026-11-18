from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.commerce import new_id


class PaymentAttempt(Base):
    __tablename__ = "commerce_payment_attempts"
    __table_args__ = (UniqueConstraint("order_id", "request_key"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("commerce_orders.id", ondelete="RESTRICT"), index=True)
    request_key: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(20), default="initiating")
    checkout_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    checkout_url: Mapped[str | None] = mapped_column(String(1000))
    provider_request: Mapped[dict] = mapped_column(JSON)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WebhookEvent(Base):
    __tablename__ = "commerce_webhook_events"
    id: Mapped[str] = mapped_column(String(200), primary_key=True)
    body_hash: Mapped[str] = mapped_column(String(64))
    event_type: Mapped[str] = mapped_column(String(100))
    outcome: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PaymentAudit(Base):
    __tablename__ = "commerce_payment_audits"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str | None] = mapped_column(ForeignKey("commerce_orders.id", ondelete="RESTRICT"), index=True)
    attempt_id: Mapped[str | None] = mapped_column(ForeignKey("commerce_payment_attempts.id", ondelete="RESTRICT"))
    event_id: Mapped[str | None] = mapped_column(ForeignKey("commerce_webhook_events.id", ondelete="RESTRICT"))
    charge_id: Mapped[str | None] = mapped_column(String(200), unique=True)
    kind: Mapped[str] = mapped_column(String(80))
    amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    currency: Mapped[str | None] = mapped_column(String(10))
    actor_id: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
