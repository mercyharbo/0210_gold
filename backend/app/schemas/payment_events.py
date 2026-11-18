from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PaymentEventData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    checkout_id: str | None = Field(default=None, max_length=200)
    reference: str | None = Field(default=None, max_length=200)
    charge_id: str | None = Field(default=None, max_length=200)
    amount: str | None = Field(default=None, max_length=50)
    currency: str | None = Field(default=None, max_length=10)
    status: str | None = Field(default=None, max_length=50)
    metadata: dict | None = None
    fee_bearer: str | None = Field(default=None, max_length=30)


class PaymentEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(min_length=1, max_length=200)
    type: str = Field(min_length=1, max_length=100)
    organization_id: str = Field(min_length=1, max_length=200)
    created_at: datetime
    environment: str | None = None
    livemode: bool = False
    data: PaymentEventData
