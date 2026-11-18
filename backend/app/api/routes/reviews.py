from uuid import UUID
from fastapi import APIRouter
from app.api.account_docs import Admin, Customer, Session, ERRORS, PRIVATE, ADMIN, PageNumber, PageSize
from app.schemas.account import Page
from app.schemas.catalog import Deleted
from app.schemas.envelope import ApiSuccess
from app.schemas.reviews import AdminReviewData, BulkModeration, ModerationBody, PublicReviewPage, ReviewBody, ReviewData, ReviewStatus
from app.services import reviews

router = APIRouter(tags=["product reviews"], responses=ERRORS)


@router.get("/account/reviews", response_model=ApiSuccess[Page[ReviewData]], operation_id="listOwnedReviews",
    summary="Read your product reviews", description=PRIVATE + "Newest first. Includes pending and rejected reviews, but never private moderation notes.")
async def owned_list(session: Session, customer: Customer, page: PageNumber = 1, page_size: PageSize = 24):
    return ApiSuccess(status=200, data=await reviews.listing(session, page, page_size, customer_id=customer.id))


@router.put("/account/reviews/{product_id}", response_model=ApiSuccess[ReviewData], operation_id="writePurchasedProductReview",
    summary="Create or edit your purchased-product review", description=PRIVATE + "Requires a paid order containing this product (403 PURCHASE_REQUIRED otherwise). JSON rating 1–5 and comment 1–2000 characters. One review per customer/product. New or edited content returns to pending moderation. An identical retry preserves its current moderation state.")
async def write(product_id: UUID, body: ReviewBody, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await reviews.put(session, customer.id, str(product_id), body))


@router.delete("/account/reviews/{product_id}", response_model=ApiSuccess[Deleted], operation_id="deleteOwnedProductReview",
    summary="Delete your product review", description=PRIVATE + "No body. Idempotent; cannot remove another customer's review.")
async def remove(product_id: UUID, session: Session, customer: Customer):
    return ApiSuccess(status=200, data=await reviews.remove(session, customer.id, str(product_id)))


@router.get("/catalog/products/{slug}/reviews", response_model=ApiSuccess[PublicReviewPage], operation_id="listApprovedProductReviews",
    summary="Read approved reviews and rating summary", description="Public; no bearer token. Active product/category only. Newest first. Only approved reviews contribute to list/count/average; average_rating is a two-decimal string or null. Exposes given names only, no emails, customer IDs or moderation notes.")
async def public(slug: str, session: Session, page: PageNumber = 1, page_size: PageSize = 24):
    return ApiSuccess(status=200, data=await reviews.public_listing(session, slug, page, page_size))


@router.get("/admin/reviews", response_model=ApiSuccess[Page[AdminReviewData]], operation_id="listModerationReviews",
    summary="Inspect reviews awaiting moderation", description=ADMIN + "Newest first, optional status filter. Private moderation notes are administrator-only.")
async def admin_list(session: Session, admin: Admin, page: PageNumber = 1, page_size: PageSize = 24, status: ReviewStatus | None = None):
    return ApiSuccess(status=200, data=await reviews.listing(session, page, page_size, status=status, admin=True))


@router.patch("/admin/reviews/{identifier}", response_model=ApiSuccess[AdminReviewData], operation_id="moderateProductReview",
    summary="Approve or reject a review", description=ADMIN + "JSON status approved/rejected and optional private moderation_note. Records moderator and notifies the customer without disclosing the note. Identical retry causes no additional notification.")
async def moderate(identifier: UUID, body: ModerationBody, session: Session, admin: Admin):
    rows = await reviews.moderate(session, [str(identifier)], body, admin.id)
    return ApiSuccess(status=200, data=rows[0])


@router.post("/admin/reviews/bulk-moderate", response_model=ApiSuccess[list[AdminReviewData]], operation_id="bulkModerateProductReviews",
    summary="Moderate up to 100 reviews atomically", description=ADMIN + "JSON unique review_ids plus status/note. All IDs must exist; otherwise 404 and no change. Stable locking order; repeat decisions are harmless.")
async def bulk(body: BulkModeration, session: Session, admin: Admin):
    return ApiSuccess(status=200, data=await reviews.moderate(session, [str(value) for value in body.review_ids], body, admin.id))
