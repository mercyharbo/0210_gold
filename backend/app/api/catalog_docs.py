from app.schemas.envelope import ApiFailure

ERRORS = {
    status: {"model": ApiFailure, "description": message, "content": {"application/json": {"example": {
        "success": False, "status": status, "error": {"code": code, "message": message},
    }}}}
    for status, code, message in [
        (401, "UNAUTHENTICATED", "A valid Neon bearer token is required."),
        (403, "FORBIDDEN", "An administrator role and verified identity are required."),
        (404, "NOT_FOUND", "The catalog record was not found or is not public."),
        (409, "CATALOG_CONFLICT", "The slug already exists or this record is still in use."),
        (422, "VALIDATION_ERROR", "Invalid fields; error.fieldErrors maps field names to messages."),
        (503, "DEPENDENCY_UNAVAILABLE", "The database or object storage is unavailable."),
    ]
}

ERRORS[422]["content"]["application/json"]["example"]["error"]["fieldErrors"] = {
    "name": ["Enter a product name."], "stock": ["Stock cannot be negative."],
}
