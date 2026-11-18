from datetime import datetime
from typing import Literal
from pydantic import Field
from app.schemas.checkout import Naira, LineData, ShippingBody, StrictBody
from app.schemas.operations import AdminTransitionData, FulfilmentStatus, TransitionData

OrderStatus = Literal["awaiting_payment", "paid", "cancelled", "expired", "payment_review"]


class AttemptData(StrictBody):
    id: str
    status: Literal["initiating", "pending", "unknown", "succeeded", "failed", "expired"]
    checkout_id: str | None
    checkout_url: str | None = Field(description="Bachs hosted URL; null until session creation is confirmed.")
    expires_at: datetime


class AuditData(StrictBody):
    id: str
    kind: str
    amount: Naira | None
    currency: str | None
    charge_id: str | None
    actor_id: str | None
    created_at: datetime


class OrderData(StrictBody):
    id: str
    status: OrderStatus
    review_reason: str | None
    items: list[LineData]
    shipping: ShippingBody
    subtotal: Naira
    delivery: Naira
    total: Naira
    currency: Literal["NGN"]
    expires_at: datetime
    created_at: datetime
    payment_attempts: list[AttemptData]
    fulfilment_status: FulfilmentStatus
    carrier: str | None
    tracking_reference: str | None
    fulfilment_history: list[TransitionData]


class AdminOrderData(OrderData):
    fulfilment_history: list[AdminTransitionData]
    customer_id: str
    customer_email: str
    audit: list[AuditData]


class AdminOrderPage(StrictBody):
    items: list[AdminOrderData]
    total: int
    page: int
    page_size: int


class WebhookResult(StrictBody):
    received: bool = True
    outcome: str = Field(description="applied, duplicate, ignored, or a recorded review reason.")
