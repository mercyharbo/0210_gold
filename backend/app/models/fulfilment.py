from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.commerce import new_id


class FulfilmentTransition(Base):
    __tablename__ = "commerce_fulfilment_transitions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    order_id: Mapped[str] = mapped_column(ForeignKey("commerce_orders.id", ondelete="RESTRICT"), index=True)
    status: Mapped[str] = mapped_column(String(20))
    actor_id: Mapped[str] = mapped_column(String(255))
    carrier: Mapped[str | None] = mapped_column(String(100))
    tracking_reference: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
