from uuid import UUID
from fastapi import APIRouter, Query
from sqlalchemy import or_, select
from app.api.account_docs import Admin, Customer, Session, ERRORS, PRIVATE, ADMIN, PageNumber, PageSize
from app.models.commerce import Order
from app.models.profile import Profile
from app.schemas.account import CustomerData, Page
from app.schemas.envelope import ApiSuccess
from app.schemas.operations import BulkTransition, TransitionBody
from app.schemas.orders import AdminOrderData, OrderData, OrderStatus
from app.services.account import customer_summary, page_rows
from app.services.fulfilment import transition
from app.services.orders import read_order

router = APIRouter(tags=["customer and fulfilment operations"], responses=ERRORS)


@router.get("/orders", response_model=ApiSuccess[Page[OrderData]], operation_id="listOwnedOrderHistory",
    summary="Read your order history", description=PRIVATE + "Newest first. Optional payment/order status filter. Includes immutable snapshots and fulfilment history; never another customer's orders.")
async def orders(session: Session, customer: Customer, page: PageNumber = 1, page_size: PageSize = 24, status: OrderStatus | None = None):
    from sqlalchemy import case
    from app.services.commerce_common import now
    query = select(Order).where(Order.customer_id == customer.id)
    if status:
        effective = case(((Order.status == "awaiting_payment") & (Order.expires_at <= now()), "expired"), else_=Order.status)
        query = query.where(effective == status)
    rows, meta = await page_rows(session, query.order_by(Order.created_at.desc(), Order.id), page, page_size)
    return ApiSuccess(status=200, data={**meta, "items": [await read_order(session, row.id, customer.id) for row in rows]})


@router.get("/admin/customers", response_model=ApiSuccess[Page[CustomerData]], operation_id="listAdminCustomers",
    summary="Search customer profiles and order summaries", description=ADMIN + "Read-only customer directory. Search q matches name, email or phone literally, case-insensitively. Newest first. No identity credentials, password access or role mutations.")
async def customers(session: Session, admin: Admin, page: PageNumber = 1, page_size: PageSize = 24,
    q: str | None = Query(None, max_length=200)):
    query = select(Profile).where(Profile.role == "customer")
    if q:
        value = q.strip().replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        query = query.where(or_(*(field.ilike(f"%{value}%", escape='\\') for field in
            (Profile.name, Profile.first_name, Profile.last_name, Profile.email, Profile.phone))))
    rows, meta = await page_rows(session, query.order_by(Profile.created_at.desc(), Profile.id), page, page_size)
    return ApiSuccess(status=200, data={**meta, "items": [await customer_summary(session, row.id) for row in rows]})


@router.get("/admin/customers/{identifier}", response_model=ApiSuccess[CustomerData], operation_id="getAdminCustomer",
    summary="Read a customer profile and order summary", description=ADMIN + "Identity ID is an opaque string, not necessarily UUID. No body. Paid total is a two-decimal NGN string; order records remain accessible through the admin order API.")
async def customer_detail(identifier: str, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await customer_summary(session, identifier))


@router.post("/admin/orders/{identifier}/fulfilment-transitions", response_model=ApiSuccess[AdminOrderData], operation_id="transitionOrderFulfilment",
    summary="Advance fulfilment of a paid order", description=ADMIN + "JSON status moves unfulfilled → processing → shipped → delivered. Shipped requires carrier/tracking_reference. Repeated identical transitions return the existing order; skipped/backward steps, changed replay tracking or unpaid orders return 409. No payment, refund or inventory mutation. Stores actor/history and creates a customer notification atomically.")
async def fulfil(identifier: UUID, body: TransitionBody, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=(await transition(session, [str(identifier)], body, admin.id))[0])


@router.post("/admin/orders/bulk-fulfilment-transitions", response_model=ApiSuccess[list[AdminOrderData]], operation_id="bulkTransitionOrderFulfilment",
    summary="Advance up to 100 paid orders atomically", description=ADMIN + "JSON unique order_ids plus transition status/tracking. Validates every order before updates; one missing/invalid order fails the entire batch. No payment confirmation or restocking through this interface.")
async def bulk_fulfil(body: BulkTransition, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await transition(session, [str(value) for value in body.order_ids], body, admin.id))
