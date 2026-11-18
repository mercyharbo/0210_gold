from copy import deepcopy
from app.schemas.payment_events import PaymentEvent

ID = "00000000-0000-4000-8000-000000000001"
SHIPPING = {"name": "Ada James", "phone": "+2348012345678", "address": "12 Example Street", "country": "Nigeria", "state": "Lagos", "local_area": "Ikeja"}
QUOTE_BODY = {"items": [{"product_id": ID, "quantity": 1}], "shipping": SHIPPING}
LINE = {"product_id": ID, "name": "Gold pendant", "slug": "gold-pendant", "quantity": 1,
        "size": None, "color": None, "karat": None, "unit_price": "120000.00", "line_total": "120000.00"}
TOTALS = {"items": [LINE], "shipping": SHIPPING, "subtotal": "120000.00", "delivery": "5000.00", "total": "125000.00", "currency": "NGN"}
ATTEMPT = {"id": ID, "status": "pending", "checkout_id": "chk_example", "checkout_url": "https://checkout.bachs.io/c/example", "expires_at": "2026-11-13T12:30:00Z"}
ORDER = {**TOTALS, "id": ID, "status": "awaiting_payment", "review_reason": None,
         "expires_at": "2026-11-13T12:30:00Z", "created_at": "2026-11-13T12:00:00Z", "payment_attempts": [ATTEMPT],
         "fulfilment_status": "unfulfilled", "carrier": None, "tracking_reference": None, "fulfilment_history": []}
EVENT = {"id": "evt_example", "type": "collection.succeeded", "organization_id": "acct_example", "created_at": "2026-11-13T12:05:00Z", "environment": "sandbox", "data": {
    "checkout_id": "chk_example", "reference": ID, "charge_id": "ch_example", "amount": "125000.00", "currency": "NGN", "status": "SUCCEEDED", "fee_bearer": "merchant"}}


def add_commerce_examples(schema):
    event_schema = PaymentEvent.model_json_schema(ref_template="#/components/schemas/{model}")
    definitions = event_schema.pop("$defs", {})
    schema["components"]["schemas"].update(definitions)
    schema["components"]["schemas"]["PaymentEvent"] = event_schema
    for path, methods in schema["paths"].items():
        if not path.startswith(("/v1/orders", "/v1/checkout/", "/v1/admin/orders", "/v1/admin/payment-attempts/", "/v1/webhooks/")):
            continue
        for method, operation in methods.items():
            body = None
            data = deepcopy(ORDER)
            status = "200"
            if path.endswith("/quote"):
                body = QUOTE_BODY
                data = {**TOTALS, "id": ID, "expires_at": "2026-11-13T12:05:00Z"}
            elif path == "/v1/orders" and method == "post":
                body, status = {"quote_id": ID}, "201"
            elif path.endswith("/payment-attempts"):
                data = ATTEMPT
            elif path.startswith("/v1/admin/"):
                data.update(customer_id="identity_example", customer_email="ada@example.com", audit=[])
                if path == "/v1/admin/orders":
                    data = {"items": [data], "total": 1, "page": 1, "page_size": 24}
            elif path.endswith("/bachs"):
                body, data = EVENT, {"received": True, "outcome": "applied"}
            if body is not None:
                operation["requestBody"]["content"]["application/json"]["example"] = body
            operation["responses"][status]["content"]["application/json"]["example"] = {
                "success": True, "status": int(status), "data": data, "message": None}
    return schema
