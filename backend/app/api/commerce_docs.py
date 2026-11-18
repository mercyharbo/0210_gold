from app.schemas.envelope import ApiFailure

RESPONSES = {
    status: {"model": ApiFailure, "description": message, "content": {"application/json": {"example": {
        "success": False, "status": status, "error": {"code": code, "message": message},
    }}}}
    for status, code, message in [
        (400, "INVALID_WEBHOOK", "Webhook signature, timestamp or payload is invalid."),
        (401, "UNAUTHENTICATED", "A valid Neon bearer token is required."),
        (403, "FORBIDDEN", "Email verification or administrator access is required."),
        (404, "ORDER_NOT_FOUND", "The requested resource was not found or does not belong to this customer."),
        (409, "ORDER_CONFLICT", "Quote, stock, idempotency key or order state conflicts with the request."),
        (413, "WEBHOOK_TOO_LARGE", "Webhook body exceeds 256 KiB."),
        (422, "VALIDATION_ERROR", "Invalid fields; see error.fieldErrors."),
        (500, "INTERNAL_SERVER_ERROR", "The request could not be completed."),
        (503, "DEPENDENCY_UNAVAILABLE", "Database or payment provider is unavailable or not configured."),
    ]
}
RESPONSES[422]["content"]["application/json"]["example"]["error"]["fieldErrors"] = {
    "items.0.quantity": ["Quantity must be a positive whole number."]}
