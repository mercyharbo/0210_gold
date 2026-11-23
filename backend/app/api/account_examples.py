from copy import deepcopy
from app.api.commerce_examples import ID, ORDER
from app.api.account_docs import PROFILE_UPDATE_EXAMPLE

PROFILE = {"id": "identity_example", "email": "ada@example.com", "name": "Ada James", "first_name": "Ada",
    "last_name": "James", "phone": "+2348012345678", "role": "customer",
    "created_at": "2026-11-18T12:00:00Z", "updated_at": "2026-11-18T12:00:00Z"}
ADDRESS_BODY = {"label": "Home", "recipient_name": "Ada James", "phone": "+2348012345678",
    "address_line_1": "12 Example Street", "address_line_2": None, "country": "Nigeria", "state": "Lagos",
    "local_area": "Ikeja", "locality": None, "postal_code": None, "delivery_notes": None}
ADDRESS = {**ADDRESS_BODY, "id": ID, "is_default": True, "created_at": "2026-11-18T12:00:00Z"}
REVIEW_BODY = {"rating": 5, "comment": "The pendant matches the description and arrived safely."}
REVIEW = {**REVIEW_BODY, "id": ID, "product_id": ID, "status": "pending", "verified_purchase": True,
    "created_at": "2026-11-18T12:00:00Z", "updated_at": "2026-11-18T12:00:00Z"}
ADMIN_REVIEW = {**REVIEW, "customer_id": "identity_example", "moderation_note": None, "moderated_by": None}
NOTIFICATION = {"id": ID, "kind": "payment", "message": "Payment confirmed for your order.", "resource_id": ID,
    "is_read": False, "created_at": "2026-11-18T12:00:00Z"}
CUSTOMER = {"profile": PROFILE, "order_count": 1, "paid_order_count": 1, "paid_total": "125000.00"}


def page(item):
    return {"items": [item], "total": 1, "page": 1, "page_size": 24}


def add_account_examples(schema):
    order = deepcopy(ORDER)
    order.update(fulfilment_status="unfulfilled", carrier=None, tracking_reference=None, fulfilment_history=[])
    admin_order = {**order, "customer_id": PROFILE["id"], "customer_email": PROFILE["email"], "audit": []}
    examples = {
        "getAccountProfile": (None, PROFILE), "patchAccountProfile": ({"first_name": "Ada", "phone": None}, PROFILE),
        "getCategoryPreferences": (None, {"category_ids": [ID]}),
        "replaceCategoryPreferences": ({"category_ids": [ID]}, {"category_ids": [ID]}),
        "listOwnedAddresses": (None, [ADDRESS]), "createOwnedAddress": (ADDRESS_BODY, ADDRESS),
        "patchOwnedAddress": ({"address_line_1": "14 Example Street"}, ADDRESS),
        "deleteOwnedAddress": (None, {"deleted": True}), "setDefaultAddress": (None, ADDRESS),
        "listOwnedWishlist": (None, page({"product_id": ID, "name": "Gold pendant", "slug": "gold-pendant",
            "display_price": {"amount": 120000, "currency": "NGN", "available": True, "reason": None, "karat": None},
            "image_url": None, "image_alt": None, "available": True, "created_at": "2026-11-18T12:00:00Z"})),
        "addWishlistProduct": (None, {"changed": 1}), "removeWishlistProduct": (None, {"changed": 1}),
        "listOwnedReviews": (None, page(REVIEW)), "writePurchasedProductReview": (REVIEW_BODY, REVIEW),
        "deleteOwnedProductReview": (None, {"deleted": True}),
        "listApprovedProductReviews": (None, {**page({**REVIEW_BODY, "id": ID, "author_name": "Ada",
            "verified_purchase": True, "created_at": "2026-11-18T12:00:00Z"}), "average_rating": "5.00", "rating_count": 1}),
        "listModerationReviews": (None, page(ADMIN_REVIEW)),
        "moderateProductReview": ({"status": "approved", "moderation_note": None},
            {**ADMIN_REVIEW, "status": "approved", "moderated_by": "admin_example"}),
        "bulkModerateProductReviews": ({"review_ids": [ID], "status": "approved"},
            [{**ADMIN_REVIEW, "status": "approved", "moderated_by": "admin_example"}]),
        "listOwnedOrderHistory": (None, page(order)), "listAdminCustomers": (None, page(CUSTOMER)),
        "getAdminCustomer": (None, CUSTOMER),
        "transitionOrderFulfilment": ({"status": "processing"}, {**admin_order, "status": "paid", "fulfilment_status": "processing"}),
        "bulkTransitionOrderFulfilment": ({"order_ids": [ID], "status": "processing"},
            [{**admin_order, "status": "paid", "fulfilment_status": "processing"}]),
    }
    for role in ("Customer", "Admin"):
        examples[f"list{role}Notifications"] = (None, page(NOTIFICATION))
        examples[f"read{role}Notification"] = ({"is_read": True}, {"changed": 1})
        examples[f"readAll{role}Notifications"] = (None, {"changed": 1})
    for methods in schema["paths"].values():
        for operation in methods.values():
            identifier = operation.get("operationId")
            if identifier not in examples:
                continue
            body, data = examples[identifier]
            if body is not None:
                operation["requestBody"]["content"]["application/json"]["example"] = deepcopy(body)
            status = "201" if identifier == "createOwnedAddress" else "200"
            operation["responses"][status]["content"]["application/json"]["example"] = {
                "success": True, "status": int(status), "message": None, "data": deepcopy(data)}
            if identifier == "patchAccountProfile":
                operation["responses"][status]["content"]["application/json"]["example"] = deepcopy(PROFILE_UPDATE_EXAMPLE)
    return schema
