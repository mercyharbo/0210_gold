from app.schemas.envelope import ApiFailure

PROFILE_EXAMPLE = {
    "success": True,
    "status": 200,
    "data": {
        "id": "identity-example",
        "email": "customer@example.com",
        "name": "Ada James",
        "first_name": "Ada",
        "last_name": "James",
        "phone": None,
        "role": "customer",
        "created_at": "2026-10-30T10:00:00Z",
        "updated_at": "2026-10-30T10:00:00Z",
    },
    "message": None,
}


def failure(status: int, code: str, message: str) -> dict:
    error = {"code": code, "message": message}
    if status == 422:
        error["fieldErrors"] = {"phone": ["String should have at most 40 characters"]}
    return {
        "model": ApiFailure,
        "description": message,
        "content": {"application/json": {"example": {
            "success": False, "status": status, "error": error,
        }}},
    }


AUTH_RESPONSES = {
    200: {"description": "Current application profile.", "content": {
        "application/json": {"example": PROFILE_EXAMPLE},
    }},
    401: failure(401, "UNAUTHENTICATED", "Missing, invalid, expired, or wrong-branch token; or deleted identity."),
    403: failure(403, "FORBIDDEN", "Email must be verified; admin checks also require an admin or super_admin role."),
    500: failure(500, "INTERNAL_SERVER_ERROR", "The request could not be completed."),
    503: failure(503, "AUTH_UNAVAILABLE", "Authentication configuration, JWKS service, or database unavailable."),
}
NOT_INITIALIZED = failure(409, "PROFILE_NOT_INITIALIZED", "Initialize your profile using POST /v1/auth/bootstrap.")
INVALID_FIELDS = failure(422, "VALIDATION_ERROR", "The request contains invalid fields.")
ADMIN_SUCCESS = {
    "description": "Verified administrator profile.",
    "content": {"application/json": {"example": {
        **PROFILE_EXAMPLE,
        "data": {**PROFILE_EXAMPLE["data"], "role": "super_admin"},
    }}},
}
