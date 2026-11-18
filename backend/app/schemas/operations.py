from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import Field, model_validator
from app.schemas.checkout import StrictBody

FulfilmentStatus = Literal["unfulfilled", "processing", "shipped", "delivered"]


class TransitionBody(StrictBody):
    status: Literal["processing", "shipped", "delivered"]
    carrier: str | None = Field(None, min_length=1, max_length=100)
    tracking_reference: str | None = Field(None, min_length=1, max_length=200)

    @model_validator(mode="after")
    def tracking(self):
        if self.status == "shipped" and (not self.carrier or not self.tracking_reference):
            raise ValueError("Shipping requires carrier and tracking reference.")
        if self.status != "shipped" and (self.carrier is not None or self.tracking_reference is not None):
            raise ValueError("Tracking can only be supplied for the shipped transition.")
        return self


class BulkTransition(TransitionBody):
    order_ids: list[UUID] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def unique(self):
        if len(self.order_ids) != len(set(self.order_ids)):
            raise ValueError("Order IDs must be unique.")
        return self


class TransitionData(StrictBody):
    status: FulfilmentStatus
    carrier: str | None
    tracking_reference: str | None
    created_at: datetime


class AdminTransitionData(TransitionData):
    actor_id: str = Field(description="Administrator identity that performed the transition; never exposed publicly.")


class ReadBody(StrictBody):
    is_read: Literal[True] = True


class NotificationData(StrictBody):
    id: str
    kind: str
    message: str
    resource_id: str
    is_read: bool
    created_at: datetime


class ChangedData(StrictBody):
    changed: int = Field(ge=0)
