from app.schemas.auth_responses import failure
from app.schemas.envelope import ApiFailure

AUTHENTICATION_RESPONSES = {
    400: failure(400, "INVALID_CODE", "Invalid, expired or used code; rejected provider request; invalid OAuth state."),
    401: failure(401, "UNAUTHENTICATED", "Missing, expired or revoked session; invalid credentials."),
    403: failure(403, "CSRF_REJECTED", "Untrusted origin, invalid CSRF token or unverified email."),
    409: failure(409, "ACCOUNT_EXISTS", "An account with these details already exists."),
    422: {"model": ApiFailure,
          "description": "Invalid fields; fieldErrors maps submitted field names to messages.",
          "content": {"application/json": {"example": {"success": False, "status": 422,
              "error": {"code": "VALIDATION_ERROR", "message": "The request contains invalid fields.",
                        "fieldErrors": {"email": ["Enter a valid email address."]}}}}}},
    429: failure(429, "AUTH_RATE_LIMITED", "Authentication provider rate limit; wait before retrying."),
    500: failure(500, "INTERNAL_SERVER_ERROR", "The request could not be completed."),
    503: failure(503, "AUTH_UNAVAILABLE", "Provider, encryption configuration or database unavailable."),
}

COOKIE_PROTOCOL = (
    "Uses a host-only HttpOnly fmluxe_session cookie, Path=/, SameSite=Lax; Secure outside development/test. "
    "No password, provider token or JWT is returned. Send cookies on later requests. "
    "All auth POSTs require GET /v1/auth/csrf first, its cookie, and X-CSRF-Token. "
    "Tokens expire in one hour and must be fetched again after login/logout. "
    "Browser origins must be explicitly allowed. Responses use Cache-Control: no-store. "
)

SESSION_EXAMPLE = {"success": True, "status": 200, "data": {
    "identity": {"id": "identity-example", "email": "customer@example.com", "name": "Ada James", "email_verified": True},
    "profile": {"id": "identity-example", "email": "customer@example.com", "name": "Ada James",
                "first_name": None, "last_name": None, "phone": None, "role": "customer",
                "created_at": "2026-11-22T10:00:00Z", "updated_at": "2026-11-22T10:00:00Z"},
    "expires_at": "2026-11-29T10:00:00Z"}, "message": None}


def success_example(data: dict):
    return {200: {"content": {"application/json": {"example": {
        "success": True, "status": 200, "data": data, "message": None}}}}}


def add_authentication_docs(schema: dict) -> dict:
    cookie_responses = {
        ("/v1/auth/csrf", "get"): "Sets the HttpOnly fmluxe_csrf cookie; return the JSON token in X-CSRF-Token.",
        ("/v1/auth/login", "post"): "Sets or rotates the host-only HttpOnly fmluxe_session cookie.",
        ("/v1/auth/logout", "post"): "Expires the fmluxe_session cookie. Fetch a fresh CSRF token afterward.",
        ("/v1/auth/google/start", "post"): "Sets the HttpOnly fmluxe_oauth binding cookie for 600 seconds.",
    }
    for path, methods in schema["paths"].items():
        for method, operation in methods.items():
            if not isinstance(operation, dict):
                continue
            security = operation.get("security", [])
            if method in {"post", "put", "patch", "delete"} and {"BackendSession": []} in security:
                parameters = operation.setdefault("parameters", [])
                if not any(item.get("name", "").lower() == "x-csrf-token" for item in parameters):
                    parameters.append({"name": "X-CSRF-Token", "in": "header", "required": False,
                        "schema": {"type": "string"}, "description": "Required with BackendSession cookies; obtain from GET /v1/auth/csrf. Not required with bearer-only authentication."})
            description = cookie_responses.get((path, method))
            if description:
                operation["responses"]["200"].setdefault("headers", {})["Set-Cookie"] = {
                    "schema": {"type": "string"}, "description": description}
    return schema
