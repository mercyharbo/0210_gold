from typing import Annotated
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.commerce_docs import RESPONSES
from app.db.session import get_db_session
from app.models.profile import Profile
from app.services.identity import current_profile, require_admin

Session = Annotated[AsyncSession, Depends(get_db_session)]
Customer = Annotated[Profile, Depends(current_profile)]
Admin = Annotated[Profile, Depends(require_admin)]
PageNumber = Annotated[int, Query(ge=1, description="One-based page number.")]
PageSize = Annotated[int, Query(ge=1, le=100, description="Items per page; maximum 100.")]
ERRORS = {key: value for key, value in RESPONSES.items() if key not in (400, 413)}

PRIVATE = "Requires a verified Neon identity and initialized application profile. Customer data is owner-scoped; another customer's resource returns 404. "
ADMIN = "Requires a verified Neon identity and database-owned admin or super_admin role. "

PROFILE_UPDATE_EXAMPLE = {
    "success": True, "status": 200, "message": "Profile updated successfully.",
    "data": {
        "id": "identity_example", "email": "ada@example.com", "name": "Ada James",
        "first_name": "Ada", "last_name": "James", "phone": "+2348012345678", "role": "customer",
        "created_at": "2026-11-18T12:00:00Z", "updated_at": "2026-11-23T12:00:00Z",
    },
}
