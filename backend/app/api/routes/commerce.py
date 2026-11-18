from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.commerce_docs import RESPONSES
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.checkout import OrderBody, QuoteBody, QuoteData
from app.schemas.orders import AttemptData, OrderData
from app.schemas.envelope import ApiSuccess
from app.services.identity import current_profile
from app.services.orders import create_order, read_order, cancel_order
from app.services.quotes import create_quote
from app.services.payment_attempts import initiate

router = APIRouter(tags=["checkout and orders"], responses={key: value for key, value in RESPONSES.items() if key not in (400, 413)})
RequestKey = Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=128,
    pattern=r"^[A-Za-z0-9_.:-]+$", description="Opaque unique request key. Persist across retries. Reuse with different order input returns 409.")]
Session = Annotated[AsyncSession, Depends(get_db_session)]
Customer = Annotated[Profile, Depends(current_profile)]


@router.post("/checkout/quote", response_model=ApiSuccess[QuoteData], operation_id="createCheckoutQuote",
             summary="Calculate a five-minute checkout quote", description="Verified customer only. JSON product IDs, whole quantities, selected options and Nigerian delivery details. Prices and shipping are calculated by FastAPI; no browser prices are accepted. NGN decimal amounts, not kobo. Does not reserve inventory.")
async def quote(body: QuoteBody, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await create_quote(session, customer.id, body))


@router.post("/orders", status_code=201, response_model=ApiSuccess[OrderData], operation_id="createOrder",
             summary="Create an order and reserve inventory", description="Verified quote owner only. Requires Idempotency-Key. Recalculates the quote; expired/changed quotes return 409. Locks product rows and reserves shared stock for 30 minutes atomically. Retry returns the same order, even after quote expiry. No payment is assumed.")
async def order(body: OrderBody, session: Session, customer: Customer, request_key: RequestKey):
    return ApiSuccess(status=201, data=await create_order(session, customer, body, request_key))


@router.get("/orders/{identifier}", response_model=ApiSuccess[OrderData], operation_id="getOwnedOrder",
            summary="Read your order and authoritative payment state", description="Verified owner only; another customer's UUID returns 404. No body. Expired unpaid holds are released on access. Snapshots preserve names/options/prices/address even if catalog products change. Redirect parameters never set status.")
async def detail(identifier: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await read_order(session, str(identifier), customer.id))


@router.post("/orders/{identifier}/cancel", response_model=ApiSuccess[OrderData], operation_id="cancelOwnedOrder",
             summary="Cancel an unpaid order", description="Verified owner only. No body. Idempotent state transition; releases reservations once. Paid/payment-review orders return 409. A subsequent late provider payment is recorded for review rather than fulfilled.")
async def cancel(identifier: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await cancel_order(session, str(identifier), customer.id))


@router.post("/orders/{identifier}/payment-attempts", response_model=ApiSuccess[AttemptData], operation_id="initiateOrderPayment",
             summary="Start or recover a Bachs sandbox checkout", description="Verified owner only. No body. Requires Idempotency-Key; retry an uncertain initiation with the original key. Only one unresolved session per order. Returns hosted URL when confirmed; 503 PAYMENT_OUTCOME_UNKNOWN means retry safely, never assume failure or payment. Amount includes configured delivery, with merchant-borne processing fees. Live keys are disabled in this phase.")
async def payment(identifier: UUID, session: Session, customer: Customer, request_key: RequestKey):
    return ApiSuccess(status=200, data=await initiate(session, str(identifier), customer, request_key))
