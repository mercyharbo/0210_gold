from uuid import UUID
from fastapi import APIRouter
from app.api.account_docs import Admin, Customer, Session, ERRORS, PRIVATE, ADMIN, PageNumber, PageSize
from app.schemas.account import Page
from app.schemas.envelope import ApiSuccess
from app.schemas.operations import ChangedData, NotificationData, ReadBody
from app.services import notifications

router = APIRouter(tags=["in-app notifications"], responses=ERRORS)


@router.get("/account/notifications", response_model=ApiSuccess[Page[NotificationData]], operation_id="listCustomerNotifications",
    summary="Read your in-app notifications", description=PRIVATE + "Newest first; unread_only filters read items. No delivery through email or SMS.")
async def customer_list(session: Session, customer: Customer, page: PageNumber = 1, page_size: PageSize = 24, unread_only: bool = False):
    return ApiSuccess(status=200, data=await notifications.listing(session, customer.id, "customer", page, page_size, unread_only))


@router.patch("/account/notifications/{identifier}", response_model=ApiSuccess[ChangedData], operation_id="readCustomerNotification",
    summary="Mark your notification read", description=PRIVATE + "JSON is_read=true only. Idempotent, changed is 0 or 1. Another recipient's ID returns 404.")
async def customer_read(identifier: UUID, body: ReadBody, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await notifications.mark_read(session, customer.id, "customer", str(identifier)))


@router.post("/account/notifications/read-all", response_model=ApiSuccess[ChangedData], operation_id="readAllCustomerNotifications",
    summary="Mark all your notifications read", description=PRIVATE + "No body. Only your unread customer notifications are changed; response counts affected rows.")
async def customer_read_all(session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await notifications.mark_read(session, customer.id, "customer"))


@router.get("/admin/notifications", response_model=ApiSuccess[Page[NotificationData]], operation_id="listAdminNotifications",
    summary="Read notifications addressed to you as administrator", description=ADMIN + "Newest first. Recipient-specific; other administrators' read state and messages are not returned. unread_only filters read items.")
async def admin_list(session: Session, admin: Admin, page: PageNumber = 1, page_size: PageSize = 24, unread_only: bool = False):
    return ApiSuccess(status=200, data=await notifications.listing(session, admin.id, "admin", page, page_size, unread_only))


@router.patch("/admin/notifications/{identifier}", response_model=ApiSuccess[ChangedData], operation_id="readAdminNotification",
    summary="Mark your administrator notification read", description=ADMIN + "JSON is_read=true only. Another administrator's notification returns 404. Reading does not mark it read for everyone.")
async def admin_read(identifier: UUID, body: ReadBody, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await notifications.mark_read(session, admin.id, "admin", str(identifier)))


@router.post("/admin/notifications/read-all", response_model=ApiSuccess[ChangedData], operation_id="readAllAdminNotifications",
    summary="Mark your administrator notifications read", description=ADMIN + "No body. Affects only the signed-in recipient; response counts changed rows.")
async def admin_read_all(session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await notifications.mark_read(session, admin.id, "admin"))
