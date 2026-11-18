from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import Field, model_validator
from app.schemas.account import Page
from app.schemas.checkout import StrictBody

ReviewStatus = Literal["pending", "approved", "rejected"]


class ReviewBody(StrictBody):
    rating: int = Field(ge=1, le=5, strict=True)
    comment: str = Field(min_length=1, max_length=2000)


class ReviewData(ReviewBody):
    id: str
    product_id: str
    status: ReviewStatus
    verified_purchase: Literal[True] = True
    created_at: datetime
    updated_at: datetime


class PublicReview(ReviewBody):
    id: str
    author_name: str = Field(description="Given name only; never an email address.")
    verified_purchase: Literal[True] = True
    created_at: datetime


class PublicReviewPage(Page[PublicReview]):
    average_rating: str | None = Field(description="Approved ratings only, two decimal places; null when no reviews.")
    rating_count: int


class AdminReviewData(ReviewData):
    customer_id: str
    moderation_note: str | None
    moderated_by: str | None


class ModerationBody(StrictBody):
    status: Literal["approved", "rejected"]
    moderation_note: str | None = Field(None, max_length=2000, description="Administrator-only; not sent to the customer.")


class BulkModeration(ModerationBody):
    review_ids: list[UUID] = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def unique(self):
        if len(self.review_ids) != len(set(self.review_ids)):
            raise ValueError("Review IDs must be unique.")
        return self
