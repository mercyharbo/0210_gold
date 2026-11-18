from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.commerce_docs import RESPONSES
from app.db.session import get_db_session
from app.models.commerce import Order
from app.models.profile import Profile
from app.schemas.envelope import ApiSuccess
from app.schemas.orders import AdminOrderData, AdminOrderPage, OrderStatus
from app.services.identity import require_admin
from app.services.orders import read_order
from app.services.reconciliation import reconcile
from app.services.commerce_common import now

router = APIRouter(prefix="/admin", tags=["admin orders and payments"], responses={key: value for key, value in RESPONSES.items() if key not in (400, 413)})
Session = Annotated[AsyncSession, Depends(get_db_session)]
Admin = Annotated[Profile, Depends(require_admin)]


@router.get("/orders", response_model=ApiSuccess[AdminOrderPage], operation_id="listAdminOrders",
            summary="Inspect orders and payment exceptions", description="Admin/super_admin only. Includes customer contact, fulfilment actor history and payment audit; never public. Newest first, optional status and customer_id filters. Read access normalizes expired unpaid orders and releases their holds. page_size is capped at 100.")
async def listing(session: Session, admin: Admin, page: int = Query(1, ge=1),
                  page_size: int = Query(24, ge=1, le=100), status: OrderStatus | None = None,
                  customer_id: str | None = Query(None, min_length=1, max_length=255, description="Opaque identity ID; filters one customer's orders.")):
    query = select(Order)
    if customer_id:
        query = query.where(Order.customer_id == customer_id)
    if status:
        effective_status = case(
            ((Order.status == "awaiting_payment") & (Order.expires_at <= now()), "expired"),
            else_=Order.status,
        )
        query = query.where(effective_status == status)
    total = await session.scalar(select(func.count()).select_from(query.subquery()))
    identifiers = list((await session.scalars(query.with_only_columns(Order.id).order_by(
        Order.created_at.desc(), Order.id).offset((page - 1) * page_size).limit(page_size))).all())
    items = [await read_order(session, identifier, admin=True) for identifier in identifiers]
    return ApiSuccess(status=200, data=AdminOrderPage(items=items, total=total, page=page, page_size=page_size))


@router.get("/orders/{identifier}", response_model=ApiSuccess[AdminOrderData], operation_id="getAdminOrder",
            summary="Read an order and payment audit", description="Admin/super_admin only. No body; full immutable order snapshot, payment attempts and audit entries. Payment success cannot be set by editing status.")
async def detail(identifier: UUID, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await read_order(session, str(identifier), admin=True))


@router.post("/payment-attempts/{identifier}/reconcile", response_model=ApiSuccess[AdminOrderData], operation_id="reconcileBachsPayment",
             summary="Reconcile payment against Bachs", description="Admin/super_admin only. No body and no caller-supplied payment status. Fetches the known sandbox session using server credentials; checks reference, gross NGN amount and confirmed charge. Records actor and handles expiry/late payments. Unknown initiation requires retry with the original idempotency key first.")
async def reconciliation(identifier: UUID, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await reconcile(session, str(identifier), admin.id))
